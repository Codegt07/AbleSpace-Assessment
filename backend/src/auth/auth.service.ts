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

   const commonWorkspaceId = '6a7f11d3b4bb4dc3f2f82b82';

   await this.workspaceMembersService.addMember(
    commonWorkspaceId,
    guest.guestId,
    'member',
   );

   return {
    ...guest.toObject(),
    workspaceId: commonWorkspaceId,
   };
 }

 async updateProfile(
  guestId: string,
  data: {
    name?: string;
    email?: string;
    username?: string;
    title?: string;
    avatar?: string;
  },
) {
  const guest = await this.guestModel.findOneAndUpdate(
    { guestId },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!guest) {
    throw new Error('Guest not found');
  }

  return guest;
}

}