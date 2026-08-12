import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GuestDocument = HydratedDocument<Guest>;

@Schema({ timestamps: true })
export class Guest {
  @Prop({ required: true, unique: true })
  guestId: string;

  @Prop({ default: 'Guest', trim: true })
  name: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  username: string;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: true })
  isGuest: boolean;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);