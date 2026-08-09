import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Guest, GuestDocument } from './schemas/guest.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,
  ) {}

  async createGuest() {
    const guest = await this.guestModel.create({
      guestId: randomUUID(),
      name: 'Guest',
    });

    return guest;
  }
}