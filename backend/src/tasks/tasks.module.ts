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
}
]),
    WorkspaceMembersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}