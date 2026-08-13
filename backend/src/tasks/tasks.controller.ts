import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.findAll(
      workspaceId,
      userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.findOne(
      id,
      workspaceId,
      userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      id,
      workspaceId,
      userId,
      updateTaskDto,
    );
  }

  @Patch(':id/status')
  updateMemberStatus(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
    @Body('status') status:
      | 'To Do'
      | 'Doing'
      | 'Completed'
      | 'On Hold',
  ) {
    return this.tasksService.updateMemberStatus(
      id,
      workspaceId,
      userId,
      status,
    );
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
    @Body('memberId') memberId: string,
  ) {
    return this.tasksService.addMember(
      id,
      workspaceId,
      userId,
      memberId,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.removeMember(
      id,
      workspaceId,
      userId,
      memberId,
    );
  }

  @Post(':id/leave')
  leaveTask(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.leaveTask(
      id,
      workspaceId,
      userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.remove(
      id,
      workspaceId,
      userId,
    );
  }
}