import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskViewDocument = HydratedDocument<TaskView>;

@Schema({ timestamps: true })
export class TaskView {
  @Prop({ required: true, index: true })
  taskId: string;

  @Prop({ required: true, index: true })
  userId: string;
}

export const TaskViewSchema = SchemaFactory.createForClass(TaskView);

TaskViewSchema.index(
  { taskId: 1, userId: 1 },
  { unique: true },
);