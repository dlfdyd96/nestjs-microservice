import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { JwtMiddleware } from './jwt/jwt.middleware';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    JwtModule.forRoot({
      privateKey: process.env.JWT_PRIVATE_KEY,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/',
      method: RequestMethod.ALL,
    });
  }
}
