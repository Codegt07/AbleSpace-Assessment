import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import { Guest, GuestDocument } from './schemas/guest.schema';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,

    private readonly workspacesService: WorkspacesService,

    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  async createGuest() {
    const guest = await this.guestModel.create({
      guestId: randomUUID(),
      name: 'Guest',
      isGuest: true,
    });

    const workspace = await this.workspacesService.create(
      'Demo Workspace',
      guest.guestId,
    );

    await this.workspaceMembersService.addMember(
      workspace._id.toString(),
      guest.guestId,
      'owner',
    );

    return {
      ...guest.toObject(),
      workspaceId: workspace._id,
    };
  }
}