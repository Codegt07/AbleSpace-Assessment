import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import {
  TaskUpdate,
  TaskUpdateDocument,
} from './schemas/task-update.schema';

import {
  TaskComment,
  TaskCommentDocument,
} from './schemas/task-comment.schema';

import {
  TaskView,
  TaskViewDocument,
} from './schemas/task-view.schema';

import { UpdateTaskSettingsDto } from './dto/update-task-settings.dto';
import { NotificationsService } from '../notifications/notifications.service';

type TaskStatus = 'To Do' | 'Doing' | 'Completed' | 'On Hold';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  Guest,
  GuestDocument,
} from '../auth/schemas/guest.schema';


@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,

    @InjectModel(TaskView.name)
    private readonly taskViewModel: Model<TaskViewDocument>,

    @InjectModel(TaskUpdate.name)
    private readonly taskUpdateModel: Model<TaskUpdateDocument>,

    @InjectModel(TaskComment.name)
    private readonly taskCommentModel: Model<TaskCommentDocument>,
    @InjectModel(Guest.name)  
    private readonly guestModel: Model<GuestDocument>,

    private readonly workspaceMembersService: WorkspaceMembersService,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService
    
    
    

  ) {}

  private calculateOverallStatus(statuses: TaskStatus[]): TaskStatus {
    if (statuses.length === 0) {
      return 'To Do';
    }

    // On Hold is treated separately.
    if (statuses.includes('On Hold')) {
      return 'On Hold';
    }

    const rank: Record<TaskStatus, number> = {
      'To Do': 0,
      Doing: 1,
      Completed: 2,
      'On Hold': -1,
    };

    return statuses.reduce((worst, current) =>
      rank[current] < rank[worst] ? current : worst,
    );
  }

  private async enrichTask(task: TaskDocument | any) {
  const createdBy = task.createdBy?.toString();

  const user = createdBy
    ? await this.guestModel
        .findOne({ guestId: createdBy })
        .select('guestId name username avatar')
        .lean()
        .exec()
    : null;

  return {
    ...task.toObject ? task.toObject() : task,
    assignee:
      user?.name ||
      user?.username ||
      'Guest',
    avatar: user?.avatar || '',
  };
}

  private updateOverallStatus(task: TaskDocument) {
    task.status = this.calculateOverallStatus(
      task.members.map((member) => member.status as TaskStatus),
    );
  }

  private async createUpdate(
  taskId: string,
  userId: string,
  message: string,
  metadata: Record<string, any> | null = null,
) {
  return this.taskUpdateModel.create({
    taskId,
    userId,
    message,
    metadata,
  });
}

async create(createTaskDto: CreateTaskDto) {
  const {
    members = [],
    ...taskData
  } = createTaskDto;

  const workspaceMembers =
    await this.workspaceMembersService.findByWorkspace(
      createTaskDto.workspaceId,
    );

  const validMemberIds = new Set(
    workspaceMembers.map(
      (member) => member.userId,
    ),
  );

  const invalidMembers = members.filter(
    (userId) => !validMemberIds.has(userId),
  );

  if (invalidMembers.length > 0) {
    throw new BadRequestException(
      'One or more selected users are not members of this workspace',
    );
  }

  const initialStatus =
    createTaskDto.status || 'To Do';

  const task = await this.taskModel.create({
    ...taskData,
    status: initialStatus,
    members: members.map((userId) => ({
      userId,
      status: initialStatus,
    })),
  });

  this.updateOverallStatus(task);

 await task.save();

return this.enrichTask(task);
}

  async createSubtask(
  parentTaskId: string,
  workspaceId: string,
  userId: string,
  createTaskDto: CreateTaskDto,
) {
  const parentTask = await this.taskModel.findOne({
    _id: parentTaskId,
    workspaceId,
    $or: [
      { createdBy: userId },
      { 'members.userId': userId },
    ],
  });

  if (!parentTask) {
    throw new NotFoundException('Parent task not found');
  }

    const isCreator = parentTask.createdBy === userId;

  if (
    !isCreator &&
    !parentTask.allowMembersToCreateSubtasks
  ) {
    throw new ForbiddenException(
      'Members are not allowed to create subtasks',
    );
  }

  const {
    members = [],
    ...taskData
  } = createTaskDto;

  const workspaceMembers =
    await this.workspaceMembersService.findByWorkspace(
      workspaceId,
    );

  const validMemberIds = new Set(
    workspaceMembers.map((member) => member.userId),
  );

  const invalidMembers = members.filter(
    (memberId) => !validMemberIds.has(memberId),
  );

  if (invalidMembers.length > 0) {
    throw new BadRequestException(
      'One or more selected users are not members of this workspace',
    );
  }

  const subtask = await this.taskModel.create({
    ...taskData,
    type: 'subtask',
    parentTaskId,
    workspaceId,
    createdBy: userId,
    members: members.map((memberId) => ({
      userId: memberId,
      status: 'To Do',
    })),
  });

  this.updateOverallStatus(subtask);
  await subtask.save();

  await this.createUpdate(
    parentTaskId,
    userId,
    `Created subtask "${subtask.title}"`,
    {
      subtaskId: subtask._id,
    },
  );

  return subtask;
}


async getSubtasks(
  parentTaskId: string,
  workspaceId: string,
  userId: string,
  mode?: string,
) {
  const parentTask = await this.taskModel.findOne({
    _id: parentTaskId,
    workspaceId,
  });

  if (!parentTask) {
    throw new NotFoundException(
      'Parent task not found',
    );
  }

  const directAccess =
    parentTask.createdBy === userId ||
    parentTask.members.some(
      (member) => member.userId === userId,
    );

  const viewAccess =
    mode === 'view' &&
    (await this.hasViewAccess(
      parentTaskId,
      workspaceId,
      userId,
    ));

  if (!directAccess && !viewAccess) {
    throw new NotFoundException(
      'Parent task not found',
    );
  }

  return this.taskModel
    .find({
      parentTaskId,
      workspaceId,
      type: 'subtask',
    })
    .sort({ createdAt: -1 })
    .exec();
}

async getProjects(
  workspaceId: string,
  userId: string,
) {
  const assignedSubtasks = await this.taskModel
    .find({
      workspaceId,
      type: 'subtask',
      'members.userId': userId,
    })
    .select('parentTaskId')
    .lean();

  const projectIds = new Set<string>();

  for (const subtask of assignedSubtasks) {
    let currentParentId = subtask.parentTaskId;

    while (currentParentId) {
      const parentTask = await this.taskModel
        .findOne({
          _id: currentParentId,
          workspaceId,
        })
        .select('_id parentTaskId')
        .lean();

      if (!parentTask) {
        break;
      }

      projectIds.add(parentTask._id.toString());
      currentParentId = parentTask.parentTaskId;
    }
  }

  if (projectIds.size === 0) {
    return [];
  }

  return this.taskModel
    .find({
      workspaceId,
      _id: {
        $in: Array.from(projectIds),
      },
    })
    .sort({ createdAt: -1 })
    .exec();
}

async findAll(
  workspaceId: string,
  userId: string,
) {
  const tasks = await this.taskModel
    .find({
      workspaceId,
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    })
    .sort({ createdAt: -1 })
    .exec();

  return Promise.all(
    tasks.map((task) => this.enrichTask(task)),
  );
}

  private async hasViewAccess(
  taskId: string,
  workspaceId: string,
  userId: string,
) {
  let currentTaskIds = [taskId];

  while (currentTaskIds.length > 0) {
    const childTasks = await this.taskModel
      .find({
        workspaceId,
        parentTaskId: {
          $in: currentTaskIds,
        },
      })
      .select('_id members')
      .lean();

    if (childTasks.length === 0) {
      return false;
    }

    const userAssigned = childTasks.some(
      (childTask) =>
        childTask.members?.some(
          (member) => member.userId === userId,
        ),
    );

    if (userAssigned) {
      return true;
    }

    currentTaskIds = childTasks.map(
      (childTask) => childTask._id.toString(),
    );
  }

  return false;
}

async findOne(
  id: string,
  workspaceId: string,
  userId: string,
  mode?: string,
) {
  const task = await this.taskModel.findOne({
    _id: id,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      'Task not found',
    );
  }

  const directAccess =
    task.createdBy === userId ||
    task.members.some(
      (member) => member.userId === userId,
    );

  if (directAccess) {
    return task;
  }

  if (
    mode === 'view' &&
    (await this.hasViewAccess(
      id,
      workspaceId,
      userId,
    ))
  ) {
    return task;
  }

  throw new NotFoundException(
    'Task not found',
  );
}

async getUpdates(
  taskId: string,
  workspaceId: string,
  userId: string,
  mode?: string,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      'Task not found',
    );
  }

  const directAccess =
    task.createdBy === userId ||
    task.members.some(
      (member) => member.userId === userId,
    );

  const viewAccess =
    mode === 'view' &&
    (await this.hasViewAccess(
      taskId,
      workspaceId,
      userId,
    ));

  if (!directAccess && !viewAccess) {
    throw new NotFoundException(
      'Task not found',
    );
  }

  return this.taskUpdateModel
    .find({ taskId })
    .sort({ createdAt: -1 })
    .exec();
}

  async recordView(
    taskId: string,
    workspaceId: string,
    userId: string,
    mode?: string,
  ) {
    const task = await this.taskModel.findOne({
      _id: taskId,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const directAccess =
      task.createdBy === userId ||
      task.members.some((member) => member.userId === userId);

    const viewAccess =
      mode === 'view' &&
      (await this.hasViewAccess(
        taskId,
        workspaceId,
        userId,
      ));

    if (!directAccess && !viewAccess) {
      throw new NotFoundException('Task not found');
    }

    try {
      const existingView = await this.taskViewModel.findOne({
        taskId,
        userId,
      });

      if (existingView) {
        return {
          viewed: false,
          message: 'Task already viewed',
        };
      }

      await this.taskViewModel.create({
        taskId,
        userId,
      });

      await this.createUpdate(
        taskId,
        userId,
        'Viewed this task',
      );

      return {
        viewed: true,
        message: 'Task view recorded',
      };
    } catch (error: any) {
      // Duplicate key means another request already recorded the view.
      if (error?.code === 11000) {
        return {
          viewed: false,
          message: 'Task already viewed',
        };
      }

      throw error;
    }
  }

  async getViewers(
    taskId: string,
    workspaceId: string,
    userId: string,
    mode?: string,
  ) {
    const task = await this.taskModel.findOne({
      _id: taskId,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const directAccess =
      task.createdBy === userId ||
      task.members.some((member) => member.userId === userId);

    const viewAccess =
      mode === 'view' &&
      (await this.hasViewAccess(
        taskId,
        workspaceId,
        userId,
      ));

    if (!directAccess && !viewAccess) {
      throw new NotFoundException('Task not found');
    }

    return this.taskViewModel
      .find({ taskId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

async update(
  id: string,
  workspaceId: string,
  userId: string,
  updateTaskDto: UpdateTaskDto,
) {
  const task = await this.taskModel.findOne({
    _id: id,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  

  if (task.createdBy !== userId) {
    throw new ForbiddenException(
      'Only the task creator can edit task details',
    );
  }

  const {
    members,
    status,
    ...rawTaskUpdates
  } = updateTaskDto as UpdateTaskDto & {
    members?: unknown;
    status?: unknown;
  };

  const allowedTaskUpdates = Object.fromEntries(
    Object.entries(rawTaskUpdates).filter(
      ([, value]) => value !== undefined,
    ),
  );

  const changes: Record<string, any> = {};

  for (const [key, newValue] of Object.entries(
    allowedTaskUpdates,
  )) {
    const oldValue = (task as any)[key];

    const normalizeValue = (value: any) => {
      if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
      }

      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }

      if (value === null || value === undefined || value === '') {
        return '';
      }

      return String(value);
    };

    if (
      normalizeValue(oldValue) !==
      normalizeValue(newValue)
    ) {
      changes[key] = {
        oldValue,
        newValue,
      };
    }
  }

  const statusChange =
  status !== undefined &&
  status !== task.status
    ? {
        oldValue: task.status,
        newValue: status as string,
      }
    : null;

if (status !== undefined) {
  task.status = status as TaskStatus;
}

const savedTask = await this.taskModel.findOneAndUpdate(
  {
    _id: id,
    workspaceId,
  },
  {
    $set: {
      ...allowedTaskUpdates,
      ...(status !== undefined ? { status } : {}),
    },
  },
  {
    new: true,
    runValidators: true,
  },
);


if (!savedTask) {
  throw new NotFoundException('Task not found');
}

  if (Object.keys(changes).length > 0) {
    const fieldLabels: Record<string, string> = {
      title: 'title',
      description: 'description',
      priority: 'priority',
      startDate: 'start date',
      dueDate: 'due date',
      labels: 'labels',
      resources: 'resources',
      projectId: 'project',
      type: 'type',
      parentTaskId: 'parent task',
      allowMembersToAddMembers: 'member adding permission',
    };

    for (const [field, change] of Object.entries(changes)) {
      const label = fieldLabels[field] ?? field;
      const formatUpdateValue = (
      value: any,
        field: string,
      ) => {
        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          return 'No value';
        }

        if (
          field === 'startDate' ||
          field === 'dueDate'
        ) {
          const date = new Date(value);

          if (Number.isNaN(date.getTime())) {
            return String(value);
          }

          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }

        if (field === 'labels' || field === 'resources') {
          if (Array.isArray(value)) {
            return value.length > 0
              ? value.join(', ')
              : 'No value';
          }
        }

        return String(value);
      };

      const oldValue = formatUpdateValue(
        change.oldValue,
        field,
      );

      const newValue = formatUpdateValue(
        change.newValue,
        field,
      );

      await this.createUpdate(
        id,
        userId,
        `Changed ${label} from ${oldValue} to ${newValue}`,
        {
          [field]: change,
        },
      );
    }
  }

  if (statusChange) {
  await this.createUpdate(
    id,
    userId,
    `Changed status from ${statusChange.oldValue} to ${statusChange.newValue}`,
    {
      status: statusChange,
    },
  );
}

  return savedTask;
}

async updateMemberStatus(
  id: string,
  workspaceId: string,
  userId: string,
  status: TaskStatus,
) {
  const task = await this.taskModel.findOne({
    _id: id,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const member = task.members.find(
    (item) => item.userId === userId,
  );

  if (!member) {
    throw new ForbiddenException(
      'You are not assigned to this task',
    );
  }

  member.status = status;

  this.updateOverallStatus(task);

  await this.createUpdate(
    id,
    userId,
    `Changed status to ${status}`,
  );

  return task.save();
}

 async addMember(
  id: string,
  workspaceId: string,
  userId: string,
  memberId: string,
) {
  const task = await this.taskModel.findOne({
    _id: id,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const isCreator = task.createdBy === userId;

  const isTaskMember = task.members.some(
    (member) => member.userId === userId,
  );

  if (!isCreator && !isTaskMember) {
    throw new ForbiddenException(
      'You are not part of this task',
    );
  }

  if (!isCreator && !task.allowMembersToAddMembers) {
    throw new ForbiddenException(
      'Members are not allowed to add other members to this task',
    );
  }

  if (task.createdBy === memberId) {
    throw new BadRequestException(
      'Task creator is already the owner of this task',
    );
  }

  const workspaceMembers =
    await this.workspaceMembersService.findByWorkspace(
      workspaceId,
    );

  const isWorkspaceMember = workspaceMembers.some(
    (member) => member.userId === memberId,
  );

  if (!isWorkspaceMember) {
    throw new BadRequestException(
      'User is not a member of this workspace',
    );
  }

  const alreadyAssigned = task.members.some(
    (member) => member.userId === memberId,
  );

  if (alreadyAssigned) {
    throw new BadRequestException(
      'User is already assigned to this task',
    );
  }

  task.members.push({
    userId: memberId,
    status: 'To Do',
  } as any);

  this.updateOverallStatus(task);

  await this.createUpdate(
  id,
  userId,
  'Added a member to this task',
  { memberId },
);

await this.notificationsService.create(
  memberId,
  'task_added',
  `You were added to task "${task.title}"`,
  id,
);

  return task.save();
}

async uploadTaskResource(
  taskId: string,
  workspaceId: string,
  userId: string,
  file: Express.Multer.File,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const isCreator = task.createdBy === userId;

  const isTaskMember = task.members.some(
    (member) => member.userId === userId,
  );

  if (!isCreator && !isTaskMember) {
    throw new ForbiddenException(
      'You are not part of this task',
    );
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      'Only PDF, DOC and DOCX files are allowed',
    );
  }

  const uploadedFile =
    await this.cloudinaryService.uploadFile(file);

    task.resources.push({
    type: 'file',
    name: file.originalname,
    url: uploadedFile.url,
    mimeType: file.mimetype,
    size: file.size,
    addedBy: userId,
    publicId: uploadedFile.publicId,
    resourceType: uploadedFile.resourceType,
  });

  await this.createUpdate(
    taskId,
    userId,
    `Added resource "${file.originalname}"`,
  );

  return task.save();
}

async removeTaskResource(
  taskId: string,
  resourceId: string,
  workspaceId: string,
  userId: string,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const isCreator = task.createdBy === userId;

  const isTaskMember = task.members.some(
    (member) => member.userId === userId,
  );

  if (!isCreator) {
  throw new ForbiddenException(
    'Only the task owner can remove resources',
  );
  }

  const resourceIndex = task.resources.findIndex(
    (item) => item._id?.toString() === resourceId,
  );

  if (resourceIndex === -1) {
    throw new NotFoundException(
      'Resource not found',
    );
  }

  const resource = task.resources[resourceIndex];

  if (
    resource.type === 'file' &&
    resource.publicId
  ) {
    await this.cloudinaryService.deleteFile(
      resource.publicId,
      resource.resourceType || 'image',
    );
  }

  task.resources.splice(resourceIndex, 1);

  await this.createUpdate(
    taskId,
    userId,
    `Removed resource "${resource.name}"`,
  );

  return task.save();
}

async addTaskResourceLink(
  taskId: string,
  workspaceId: string,
  userId: string,
  name: string,
  url: string,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  const isCreator = task.createdBy === userId;

  const isTaskMember = task.members.some(
    (member) => member.userId === userId,
  );

  if (!isCreator && !isTaskMember) {
    throw new ForbiddenException(
      'You are not part of this task',
    );
  }

  if (!name?.trim()) {
    throw new BadRequestException(
      'Resource name is required',
    );
  }

  if (!url?.trim()) {
    throw new BadRequestException(
      'Resource URL is required',
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    throw new BadRequestException(
      'Please provide a valid URL',
    );
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new BadRequestException(
      'Only HTTP and HTTPS links are allowed',
    );
  }

  task.resources.push({
    type: 'link',
    name: name.trim(),
    url: parsedUrl.toString(),
    addedBy: userId,
  });

  await this.createUpdate(
    taskId,
    userId,
    `Added resource link "${name.trim()}"`,
  );

  return task.save();
}

  async updateTaskSettings(
    id: string,
    workspaceId: string,
    userId: string,
    settings: UpdateTaskSettingsDto,
  ) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy !== userId) {
      throw new ForbiddenException(
        'Only the task creator can change task settings',
      );
    }

    const changes: Record<string, any> = {};

    const allowedSettings = [
      'allowMembersToAddMembers',
      'allowMembersToCreateSubtasks',
      'allowMembersToComment',
    ] as const;

    for (const field of allowedSettings) {
      const newValue = settings[field];

      if (newValue === undefined) {
        continue;
      }

      const oldValue = task[field];

      if (oldValue !== newValue) {
        changes[field] = {
          oldValue,
          newValue,
        };

        task[field] = newValue;
      }
    }

    const fieldLabels: Record<string, string> = {
      allowMembersToAddMembers: 'member adding permission',
      allowMembersToCreateSubtasks: 'subtask creation permission',
      allowMembersToComment: 'comment permission',
    };

    for (const [field, change] of Object.entries(changes)) {
      const label = fieldLabels[field] ?? field;

      await this.createUpdate(
        id,
        userId,
        `${change.newValue ? 'Enabled' : 'Disabled'} ${label}`,
        {
          [field]: change,
        },
      );
    }

    return task.save();
  }

  async removeMember(
    id: string,
    workspaceId: string,
    userId: string,
    memberId: string,
  ) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy === memberId) {
      throw new BadRequestException(
        'The task creator cannot be removed',
      );
    }

    const currentUserIsMember =
      task.createdBy === userId ||
      task.members.some((member) => member.userId === userId);

    if (!currentUserIsMember) {
      throw new ForbiddenException(
        'You are not part of this task',
      );
    }

    const memberExists = task.members.some(
      (member) => member.userId === memberId,
    );

    if (!memberExists) {
      throw new NotFoundException(
        'Member is not assigned to this task',
      );
    }

    await this.notificationsService.create(
  memberId,
  'task_removed',
  `You were removed from task "${task.title}"`,
  id,
);

    task.members = task.members.filter(
      (member) => member.userId !== memberId,
    );

    this.updateOverallStatus(task);

  await this.createUpdate(
  id,
  userId,
  'Removed a member from this task',
  { memberId },
);

    return task.save();
  }

  async leaveTask(
    id: string,
    workspaceId: string,
    userId: string,
  ) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy === userId) {
      throw new BadRequestException(
        'Task creator cannot leave their own task',
      );
    }

    const memberExists = task.members.some(
      (member) => member.userId === userId,
    );

    if (!memberExists) {
      throw new NotFoundException(
        'You are not assigned to this task',
      );
    }

    task.members = task.members.filter(
      (member) => member.userId !== userId,
    );

    this.updateOverallStatus(task);
    await this.createUpdate(
  id,
  userId,
  'Declined to work on this task',
);

    return task.save();
  }

  async remove(
    id: string,
    workspaceId: string,
    userId: string,
  ) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy !== userId) {
      throw new ForbiddenException(
        'Only the task creator can delete the task',
      );
    }

    await task.deleteOne();

    return {
      message: 'Task deleted successfully',
    };
  }

  async getComments(
  taskId: string,
  workspaceId: string,
  userId: string,
  mode?: string,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      'Task not found',
    );
  }

  const directAccess =
    task.createdBy === userId ||
    task.members.some(
      (member) => member.userId === userId,
    );

  const viewAccess =
    mode === 'view' &&
    (await this.hasViewAccess(
      taskId,
      workspaceId,
      userId,
    ));

  if (!directAccess && !viewAccess) {
    throw new NotFoundException(
      'Task not found',
    );
  }

  return this.taskCommentModel
    .find({ taskId })
    .sort({ createdAt: 1 })
    .lean()
    .exec();
}

async addComment(
  taskId: string,
  workspaceId: string,
  userId: string,
  message: string,
  parentCommentId?: string | null,
) {
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
    $or: [
      { createdBy: userId },
      { 'members.userId': userId },
    ],
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

    const isCreator = task.createdBy === userId;

  if (!isCreator && !task.allowMembersToComment) {
    throw new ForbiddenException(
      'Members are not allowed to comment on this task',
    );
  }

  if (!message?.trim()) {
    throw new BadRequestException(
      'Comment cannot be empty',
    );
  }

  let validParentCommentId: string | null = null;

  if (parentCommentId) {
    const parentComment =
      await this.taskCommentModel.findOne({
        _id: parentCommentId,
        taskId,
      });

    if (!parentComment) {
      throw new BadRequestException(
        'Parent comment not found',
      );
    }

    validParentCommentId = parentComment._id.toString();
  }

  return this.taskCommentModel.create({
    taskId,
    userId,
    message: message.trim(),
    parentCommentId: validParentCommentId,
  });
}

async deleteComment(
  taskId: string,
  commentId: string,
  workspaceId: string,
  userId: string,
) {
  // Check whether the user has access to this task
  const task = await this.taskModel.findOne({
    _id: taskId,
    workspaceId,
    $or: [
      { createdBy: userId },
      { 'members.userId': userId },
    ],
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  // Find the comment and ensure it belongs to this task
  const comment = await this.taskCommentModel.findOne({
    _id: commentId,
    taskId,
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  const isCommentOwner = comment.userId === userId;
  const isTaskCreator = task.createdBy === userId;

  if (!isCommentOwner && !isTaskCreator) {
    throw new ForbiddenException(
      'You are not allowed to delete this comment',
    );
  }

  await this.taskCommentModel.deleteMany({
  taskId,
  $or: [
    { _id: commentId },
    { parentCommentId: commentId },
  ],
});

  return {
    message: 'Comment deleted successfully',
  };
}

}