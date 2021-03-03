import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/guard/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInRequestDto } from './dto/sign-in.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  signUp(@Body() data: CreateUserDto) {
    return this.authService.signUp(data);
  }

  @Post('/login')
  signIn(@Body() data: SignInRequestDto) {
    return this.authService.signIn(data);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request) {
    return req['user'];
  }
}
