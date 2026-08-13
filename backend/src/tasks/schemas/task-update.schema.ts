import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskUpdateDocument =
  HydratedDocument<TaskUpdate>;

@Schema({ timestamps: true })
export class TaskUpdate {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: null })
  metadata?: Record<string, any> | null;
}

export const TaskUpdateSchema =
  SchemaFactory.createForClass(TaskUpdate);