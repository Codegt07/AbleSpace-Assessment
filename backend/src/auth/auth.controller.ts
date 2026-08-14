import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('guest')
  createGuest() {
    return this.authService.createGuest();
  }

  @Patch('profile')
  updateProfile(
    @Query('guestId') guestId: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      username?: string;
      title?: string;
      avatar?: string;
    },
  ) {
    return this.authService.updateProfile(
      guestId,
      body,
    );
  }
}