import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsIn(['Low', 'Medium', 'High'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  members?: string[];

  @IsString()
  @IsOptional()
  projectId?: string;

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
  resources?: string[];
}