import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from './schemas/workspace-member.schema';

import {
  Guest,
  GuestSchema,
} from '../auth/schemas/guest.schema';

import { WorkspaceMembersService } from './workspace-members.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import {
  Task,
  TaskSchema,
} from '../tasks/schemas/task.schema';

import {
  TaskUpdate,
  TaskUpdateSchema,
} from '../tasks/schemas/task-update.schema';

import {
  TaskComment,
  TaskCommentSchema,
} from '../tasks/schemas/task-comment.schema';

  @Module({
    imports: [
      MongooseModule.forFeature([
    {
      name: WorkspaceMember.name,
      schema: WorkspaceMemberSchema,
    },
    {
      name: Guest.name,
      schema: GuestSchema,
    },
    {
      name: Task.name,
      schema: TaskSchema,
    },
    {
      name: TaskUpdate.name,
      schema: TaskUpdateSchema,
    },
    {
      name: TaskComment.name,
      schema: TaskCommentSchema,
    },
  ]),
  ],
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}