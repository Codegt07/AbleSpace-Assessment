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

type TaskStatus = 'To Do' | 'Doing' | 'Completed' | 'On Hold';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,

    private readonly workspaceMembersService: WorkspaceMembersService,
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

    Object.assign(task, allowedTaskUpdates);

    this.updateOverallStatus(task);

    return task.save();
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

  return task.save();
}

async updateMemberAddPermission(
  id: string,
  workspaceId: string,
  userId: string,
  enabled: boolean,
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

  task.allowMembersToAddMembers = enabled;

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

    task.members = task.members.filter(
      (member) => member.userId !== memberId,
    );

    this.updateOverallStatus(task);

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
}