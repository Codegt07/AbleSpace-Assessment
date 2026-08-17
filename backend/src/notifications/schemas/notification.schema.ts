import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument =
  HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    enum: [
      'welcome',
      'task_added',
      'task_removed',
      'tip',
    ],
  })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, default: null })
  taskId?: string | null;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);