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

  @IsString()
  @IsOptional()
  assignee?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsString()
  @IsNotEmpty()
  guestId: string;
}