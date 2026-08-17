import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService:
      NotificationsService,
  ) {}

  @Get()
  findByUser(
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.findByUser(
      userId,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.markAsRead(
      id,
      userId,
    );
  }

  @Patch('read-all')
  markAllAsRead(
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(
      userId,
    );
  }
}