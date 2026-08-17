import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTaskSettingsDto {
  @IsBoolean()
  @IsOptional()
  allowMembersToAddMembers?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMembersToCreateSubtasks?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMembersToComment?: boolean;
}