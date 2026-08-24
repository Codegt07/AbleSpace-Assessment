import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Guest, GuestSchema } from './schemas/guest.schema';

import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
  {
    name: Guest.name,
    schema: GuestSchema,
  },
  {
    name: Task.name,
    schema: TaskSchema,
  },
]),

    WorkspacesModule,
    WorkspaceMembersModule,
    NotificationsModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}