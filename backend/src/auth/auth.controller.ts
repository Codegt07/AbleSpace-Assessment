import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  Headers,
  UnauthorizedException,
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

  @Post('google')
  googleLogin(
    @Body('code') code: string,
    @Headers('x-requested-with')
    requestedWith: string,
  ) {
    if (requestedWith !== 'XMLHttpRequest') {
      throw new UnauthorizedException(
        'Invalid Google login request',
      );
    }

    return this.authService.googleLogin(code);
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