import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceMemberDocument =
  HydratedDocument<WorkspaceMember>;

@Schema({ timestamps: true })
export class WorkspaceMember {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    enum: ['owner', 'member'],
    default: 'member',
  })
  role: string;
}

export const WorkspaceMemberSchema =
  SchemaFactory.createForClass(WorkspaceMember);

WorkspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true },
);