import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskCommentDocument =
  HydratedDocument<TaskComment>;

@Schema({ timestamps: true })
export class TaskComment {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ type: String, default: null })
  parentCommentId?: string | null;
}

export const TaskCommentSchema =
  SchemaFactory.createForClass(TaskComment);