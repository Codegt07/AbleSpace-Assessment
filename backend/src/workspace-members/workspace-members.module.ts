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
    ]),
  ],
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}