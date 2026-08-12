import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;

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