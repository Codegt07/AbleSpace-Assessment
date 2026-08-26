import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskResourceDto {
  type: 'link' | 'file';

  name: string;

  url: string;

  mimeType?: string;

  size?: number;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['main', 'subtask'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

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

}