import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WorkspaceMember,
  WorkspaceMemberDocument,
} from './schemas/workspace-member.schema';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectModel(WorkspaceMember.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>,
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
}