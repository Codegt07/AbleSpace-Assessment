import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  WorkspaceMember,
  WorkspaceMemberDocument,
} from './schemas/workspace-member.schema';

import {
  Guest,
  GuestDocument,
} from '../auth/schemas/guest.schema';

import {
  Task,
  TaskDocument,
} from '../tasks/schemas/task.schema';

import {
  TaskUpdate,
  TaskUpdateDocument,
} from '../tasks/schemas/task-update.schema';

import {
  TaskComment,
  TaskCommentDocument,
} from '../tasks/schemas/task-comment.schema';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectModel(WorkspaceMember.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>,

    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,

    @InjectModel(TaskUpdate.name)
    private readonly taskUpdateModel: Model<TaskUpdateDocument>,

    @InjectModel(TaskComment.name)
    private readonly taskCommentModel: Model<TaskCommentDocument>,
  ) {}

  async addMember(
    workspaceId: string,
    userId: string,
    role: string = 'member',
  ) {
    const existingMember = await this.memberModel.findOne({
      workspaceId,
      userId,
    });

    if (existingMember) {
      return existingMember;
    }

    return this.memberModel.create({
      workspaceId,
      userId,
      role,
    });
  }

  async findByUser(userId: string) {
    return this.memberModel
      .find({ userId })
      .exec();
  }

  async findByWorkspace(workspaceId: string) {
    return this.memberModel
      .find({ workspaceId })
      .exec();
  }

  async findWorkspaceUsers(workspaceId: string) {
    const members = await this.memberModel
      .find({ workspaceId })
      .lean();

    const userIds = members.map(
      (member) => member.userId,
    );

    const users = await this.guestModel
      .find({
        guestId: { $in: userIds },
      })
      .select('guestId name username avatar title')
      .lean();

    return users.map((user) => ({
      userId: user.guestId,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      title: user.title,
    }));
  }

async leaveWorkspace(
  workspaceId: string,
  userId: string,
) {
  const membership = await this.memberModel.findOne({
    workspaceId,
    userId,
  });

  if (!membership) {
    throw new Error(
      'You are not a member of this workspace',
    );
  }

  // Tasks created by this user
  const ownedTasks = await this.taskModel
    .find({
      workspaceId,
      createdBy: userId,
    })
    .select('_id')
    .lean();

const ownedTaskIds = ownedTasks.map(
  (task) => task._id.toString(),
);

  
  const tasksToDelete =
    await this.taskModel
      .find({
        workspaceId,
        $or: [
          {
            createdBy: userId,
          },
          {
            parentTaskId: {
              $in: ownedTaskIds,
            },
          },
        ],
      })
      .select('_id')
      .lean();

  const taskIdsToDelete =
  tasksToDelete.map((task) => task._id.toString());


  await this.taskModel.updateMany(
    {
      workspaceId,
      createdBy: {
        $ne: userId,
      },
      members: {
        $elemMatch: {
          userId,
        },
      },
    },
    {
      $pull: {
        members: {
          userId,
        },
      },
    },
  );

  await this.taskCommentModel.deleteMany({
    userId,
  });


  await this.taskUpdateModel.deleteMany({
    $or: [
      {
        userId,
      },
      {
        taskId: {
          $in: taskIdsToDelete,
        },
      },
    ],
  });

  if (taskIdsToDelete.length > 0) {
    await this.taskModel.deleteMany({
      _id: {
        $in: taskIdsToDelete,
      },
      workspaceId,
    });
  }

  await this.memberModel.deleteOne({
    workspaceId,
    userId,
  });

  await this.guestModel.deleteOne({
    guestId: userId,
  });

  return {
    success: true,
    message:
      'Workspace left and all user data deleted successfully',
  };
}
}