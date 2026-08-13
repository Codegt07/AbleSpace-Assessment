import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: false })
export class TaskMember {
  @Prop({ required: true })
  userId: string;

  @Prop({
    enum: ['To Do', 'Doing', 'Completed', 'On Hold'],
    default: 'To Do',
  })
  status: string;
}

export const TaskMemberSchema =
  SchemaFactory.createForClass(TaskMember);

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    enum: ['main', 'subtask'],
    default: 'main',
  })
  type: string;

  @Prop({ type: String, default: null })
  parentTaskId?: string | null;  

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

@Prop({
  type: [
    {
      userId: { type: String, required: true },
      status: {
        type: String,
        enum: ['To Do', 'Doing', 'Completed', 'On Hold'],
        default: 'To Do',
      },
    },
  ],
  default: [],
})
members: TaskMember[];
  @Prop({ default: false })
allowMembersToAddMembers: boolean;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop()
  projectId?: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [String], default: [] })
  resources: string[];
  
}


export const TaskSchema = SchemaFactory.createForClass(Task);