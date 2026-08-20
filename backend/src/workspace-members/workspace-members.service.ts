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

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectModel(WorkspaceMember.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>,

    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,
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

  await this.memberModel.deleteOne({
    workspaceId,
    userId,
  });

  await this.guestModel.deleteOne({
    guestId: userId,
  });

  return {
    success: true,
    message: 'Workspace left successfully',
  };
}
}