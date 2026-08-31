import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';


import {
  Guest,
  GuestDocument,
} from './schemas/guest.schema';

import { WorkspacesService } from '../workspaces/workspaces.service';

import {
  WorkspaceMembersService,
} from '../workspace-members/workspace-members.service';

import {
  NotificationsService,
} from '../notifications/notifications.service';


import {
  Task,
  TaskDocument,
} from '../tasks/schemas/task.schema';  

@Injectable()
export class AuthService {
  private readonly googleClient =
    new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

 constructor(
  @InjectModel(Guest.name)
  private readonly guestModel: Model<GuestDocument>,

  @InjectModel(Task.name)
  private readonly taskModel: Model<TaskDocument>,

  private readonly workspacesService: WorkspacesService,

  private readonly workspaceMembersService:
    WorkspaceMembersService,

  private readonly notificationsService:
    NotificationsService,

    private readonly cloudinaryService: CloudinaryService,
) {}
  

  async createGuest() {
    const guest =
      await this.guestModel.create({
        guestId: randomUUID(),
        name: 'Guest',
        isGuest: true,
      });

    const commonWorkspaceId =
      '6a7f11d3b4bb4dc3f2f82b82';

    await this.workspaceMembersService.addMember(
      commonWorkspaceId,
      guest.guestId,
      'member',
    );

    await this.notificationsService.create(
      guest.guestId,
      'welcome',
      'Welcome to the workspace!',
    );

    const welcomeTask =
  await this.taskModel.findById(
    '6a8c4b50523cb03a9f2a1b51',
  );

if (welcomeTask) {
  const alreadyMember =
    welcomeTask.members.some(
      (member) =>
        member.userId === guest.guestId,
    );

  if (!alreadyMember) {
    welcomeTask.members.push({
      userId: guest.guestId,
      status: 'To Do',
    } as any);

    await welcomeTask.save();

    await this.notificationsService.create(
      guest.guestId,
      'task_added',
      'You’ve been added to the Welcome Task by Admin. Explore the task description and subtasks to learn about Pyramid’s features.',
      '6a8c4b50523cb03a9f2a1b51',
    );
  }
}

    return {
      ...guest.toObject(),
      workspaceId: commonWorkspaceId,
    };
  }
  

  async googleLogin(code: string) {
    if (!code) {
      throw new UnauthorizedException(
        'Google authorization code is required',
      );
    }

    try {
      const redirectUri =
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      const { tokens } =
        await this.googleClient.getToken({
          code,
          redirect_uri: redirectUri,
        });

      if (!tokens.id_token) {
        throw new UnauthorizedException(
          'Google ID token not received',
        );
      }

      const ticket =
        await this.googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience:
            process.env.GOOGLE_CLIENT_ID,
        });

      const payload =
        ticket.getPayload();

      if (!payload || !payload.sub) {
        throw new UnauthorizedException(
          'Invalid Google account',
        );
      }

      const googleId = payload.sub;

      const commonWorkspaceId =
        '6a7f11d3b4bb4dc3f2f82b82';

      let guest =
        await this.guestModel.findOne({
          googleId,
        });

      const isNewUser = !guest;

      if (!guest) {
        guest =
          await this.guestModel.create({
            guestId: randomUUID(),
            googleId,
            name:
              payload.name ||
              payload.email?.split('@')[0] ||
              'Google User',
            email:
              payload.email || '',
            username:
              payload.email?.split('@')[0] ||
              '',
            avatar:
              payload.picture || '',
            isGuest: false,
          });
      } else {
        guest.name =
          payload.name || guest.name;

        guest.email =
          payload.email || guest.email;

        guest.avatar =
          payload.picture ||
          guest.avatar;

        guest.isGuest = false;

        await guest.save();
      }

      await this.workspaceMembersService.addMember(
        commonWorkspaceId,
        guest.guestId,
        'member',
      );

      

      if (isNewUser) {
  await this.notificationsService.create(
    guest.guestId,
    'welcome',
    'Welcome to the workspace!',
  );

  const welcomeTask =
    await this.taskModel.findById(
      '6a8c4b50523cb03a9f2a1b51',
    );

  if (welcomeTask) {
    const alreadyMember =
      welcomeTask.members.some(
        (member) =>
          member.userId === guest.guestId,
      );

    if (!alreadyMember) {
      welcomeTask.members.push({
        userId: guest.guestId,
        status: 'To Do',
      } as any);

      await welcomeTask.save();

      await this.notificationsService.create(
        guest.guestId,
        'task_added',
        'You’ve been added to the Welcome Task by Admin. Explore the task description and subtasks to learn about Pyramid’s features.',
        '6a8c4b50523cb03a9f2a1b51',
      );
    }
  }
}

      return {
        ...guest.toObject(),
        workspaceId:
          commonWorkspaceId,
      };
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      console.error(
        'Google Login Error:',
        error,
      );

      throw new UnauthorizedException(
        'Google login failed',
      );
    }
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
    const guest =
      await this.guestModel.findOneAndUpdate(
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
      throw new Error(
        'Guest not found',
      );
    }

    return guest;
  }

  async updateProfileAvatar(
  guestId: string,
  file: Express.Multer.File,
) {
  if (!file) {
    throw new Error('Profile image is required');
  }

  const uploaded =
    await this.cloudinaryService.uploadFile(file);

  const guest =
    await this.guestModel.findOneAndUpdate(
      { guestId },
      {
        $set: {
          avatar: uploaded.url,
        },
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