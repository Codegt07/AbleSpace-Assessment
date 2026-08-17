import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel:
      Model<NotificationDocument>,
  ) {}

  async create(
    userId: string,
    type: 'welcome' | 'task_added' | 'task_removed' | 'tip',
    message: string,
    taskId?: string,
  ) {
    return this.notificationModel.create({
      userId,
      type,
      message,
      taskId: taskId ?? null,
    });
  }

  async findByUser(userId: string) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    return this.notificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        userId,
      },
      {
        $set: { isRead: true },
      },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );

    return { message: 'All notifications marked as read' };
  }
}