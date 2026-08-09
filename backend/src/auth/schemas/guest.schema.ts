import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GuestDocument = HydratedDocument<Guest>;

@Schema({ timestamps: true })
export class Guest {
  @Prop({ required: true, unique: true })
  guestId: string;

  @Prop({ default: 'Guest' })
  name: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);