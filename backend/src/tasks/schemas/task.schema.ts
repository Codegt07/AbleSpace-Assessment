import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    enum: ['To Do', 'Doing', 'Completed', 'On Hold'],
    default: 'To Do',
  })
  status: string;

  @Prop({
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  })
  priority: string;

  @Prop({ default: '' })
  assignee: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ required: true })
  guestId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);