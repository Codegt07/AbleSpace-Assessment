import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';

@Controller('workspace-members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}



  @Get()
  findByWorkspace(
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.workspaceMembersService.findByWorkspace(
      workspaceId,
    );
  }

  @Get('users')
findWorkspaceUsers(
  @Query('workspaceId') workspaceId: string,
) {
  return this.workspaceMembersService.findWorkspaceUsers(
    workspaceId,
  );
}

  @Post()
addMember(
  @Query('workspaceId') workspaceId: string,
  @Query('userId') userId: string,
  @Query('role') role?: string,
) {
  return this.workspaceMembersService.addMember(
    workspaceId,
    userId,
    role || 'member',
  );
}

@Delete('leave')
leaveWorkspace(
  @Query('workspaceId') workspaceId: string,
  @Query('userId') userId: string,
) {
  return this.workspaceMembersService.leaveWorkspace(
    workspaceId,
    userId,
  );
}

}
