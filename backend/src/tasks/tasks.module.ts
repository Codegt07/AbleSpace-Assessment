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
]),
    WorkspaceMembersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}