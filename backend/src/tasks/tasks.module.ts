import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/task.schema';

import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import {
  TaskUpdate,
  TaskUpdateSchema,
} from './schemas/task-update.schema';
import {
  TaskComment,
  TaskCommentSchema,
} from './schemas/task-comment.schema';
import {
  TaskView,
  TaskViewSchema,
} from './schemas/task-view.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Guest, GuestSchema } from '../auth/schemas/guest.schema';
import { TasksGateway } from './tasks.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
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
{
  name: TaskView.name,
  schema: TaskViewSchema,
},
{
  name: Guest.name,
  schema: GuestSchema,
}
]),
    WorkspaceMembersModule,
    NotificationsModule,
    CloudinaryModule,
  ],
  controllers: [TasksController],
  providers: [
  TasksService,
  TasksGateway,
],
  
})
export class TasksModule {}