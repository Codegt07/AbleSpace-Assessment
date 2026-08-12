import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.taskModel.create(createTaskDto);
  }

  async findAll(guestId: string) {
    return this.taskModel
      .find({ guestId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, guestId: string) {
    const task = await this.taskModel.findOne({
      _id: id,
      guestId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.taskModel.create(createTaskDto);
  }

  async findAll(workspaceId: string) {
    return this.taskModel
      .find({ workspaceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, workspaceId: string) {
    const task = await this.taskModel.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    workspaceId: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.taskModel.findOneAndUpdate(
      {
        _id: id,
        workspaceId,
      },
      updateTaskDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async remove(id: string, workspaceId: string) {
    const task = await this.taskModel.findOneAndDelete({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      message: 'Task deleted successfully',
    };
  }
}