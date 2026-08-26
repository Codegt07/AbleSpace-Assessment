import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

import { CreateTaskResourceDto } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['To Do', 'Doing', 'Completed', 'On Hold'])
  @IsOptional()
  status?: string;

 @IsIn(['Urgent', 'High', 'Medium', 'Low'])
 @IsOptional()
 priority?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  members?: string[];

  @IsDateString()
 @ IsOptional()
   startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resources?: CreateTaskResourceDto[];
  
  @IsString()
  @IsOptional()
  projectId?: string;
}