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
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(@Query('guestId') guestId: string) {
    return this.tasksService.findAll(guestId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('guestId') guestId: string,
  ) {
    return this.tasksService.findOne(id, guestId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('guestId') guestId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, guestId, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('guestId') guestId: string,
  ) {
    return this.tasksService.remove(id, guestId);
  }
}