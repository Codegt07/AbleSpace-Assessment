import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Guest, GuestSchema } from './schemas/guest.schema';

import { WorkspacesModule } from '../workspaces/workspaces.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Guest.name,
        schema: GuestSchema,
      },
    ]),

    WorkspacesModule,
    WorkspaceMembersModule,
    NotificationsModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}