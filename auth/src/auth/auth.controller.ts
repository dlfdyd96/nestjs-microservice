import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AuthController {
  private static readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-up' })
  signUp(@Payload() data: CreateUserDto) {
    return this.authService.signUp(data);
  }

  @MessagePattern({ cmd: 'sign-in' })
  signIn(data) {
    return this.authService.signIn(data);
  }
}
