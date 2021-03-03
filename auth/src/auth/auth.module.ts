import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { USER_CLIENT } from './auth.constant';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USER_CLIENT,
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: configService.get('USER_SERVICE_PORT'),
          },
        }),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
