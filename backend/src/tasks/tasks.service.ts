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

import { UpdateTaskSettingsDto } from './dto/update-task-settings.dto';
import { NotificationsService } from '../notifications/notifications.service';

type TaskStatus = 'To Do' | 'Doing' | 'Completed' | 'On Hold';



@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,

    @InjectModel(TaskUpdate.name)
    private readonly taskUpdateModel: Model<TaskUpdateDocument>,

    @InjectModel(TaskComment.name)
    private readonly taskCommentModel: Model<TaskCommentDocument>,

    private readonly workspaceMembersService: WorkspaceMembersService,
    private readonly notificationsService: NotificationsService

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
      workspaceMembers.map((member) => member.userId),
    );

    const invalidMembers = members.filter(
      (userId) => !validMemberIds.has(userId),
    );

    if (invalidMembers.length > 0) {
      throw new BadRequestException(
        'One or more selected users are not members of this workspace',
      );
    }

    const task = await this.taskModel.create({
      ...taskData,
      members: members.map((userId) => ({
        userId,
        status: 'To Do',
      })),
    });

    this.updateOverallStatus(task);
    await task.save();

    return task;
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

  return this.taskModel
    .find({
      parentTaskId,
      workspaceId,
      type: 'subtask',
    })
    .sort({ createdAt: -1 })
    .exec();
}

  async findAll(workspaceId: string, userId: string) {
    return this.taskModel
      .find({
        workspaceId,
        $or: [
          { createdBy: userId },
          { 'members.userId': userId },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(
    id: string,
    workspaceId: string,
    userId: string,
   ) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getUpdates(
  taskId: string,
  workspaceId: string,
  userId: string,
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

  return this.taskUpdateModel
    .find({ taskId })
    .sort({ createdAt: -1 })
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

  // Members/status are handled by dedicated actions.
  const {
    members,
    status,
    ...allowedTaskUpdates
  } = updateTaskDto as UpdateTaskDto & {
    members?: unknown;
    status?: unknown;
  };

  const changes: Record<string, any> = {};

  for (const [key, newValue] of Object.entries(
    allowedTaskUpdates,
  )) {
    const oldValue = (task as any)[key];

    if (
      String(oldValue ?? '') !==
      String(newValue ?? '')
    ) {
      changes[key] = {
        oldValue,
        newValue,
      };
    }
  }

  Object.assign(task, allowedTaskUpdates);

  this.updateOverallStatus(task);

  const savedTask = await task.save();

  if (Object.keys(changes).length > 0) {
    const fieldLabels: Record<string, string> = {
      title: 'title',
      description: 'description',
      priority: 'priority',
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
      const oldValue =
        change.oldValue === null ||
        change.oldValue === undefined ||
        change.oldValue === ''
          ? 'No value'
          : String(change.oldValue);

      const newValue =
        change.newValue === null ||
        change.newValue === undefined ||
        change.newValue === ''
          ? 'No value'
          : String(change.newValue);

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
}