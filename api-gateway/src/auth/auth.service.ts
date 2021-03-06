import {
  Inject,
  Injectable,
  Logger,
  Req,
  RequestTimeoutException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';
import { SignInRequestDto } from './dto/sign-in.dto';
import { Request } from 'express';
import { IUser } from './user.interface';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class AuthService {
  private static readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('AUTH_CLIENT')
    private readonly authClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  signUp(data: CreateUserDto) {
    return this.authClient
      .send({ cmd: 'sign-up' }, data)
      .pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(new RequestTimeoutException());
          }
          return throwError(err);
        }),
      )
      .toPromise();
  }

  async signIn(data: SignInRequestDto) {
    try {
      const user = await this.authClient
        .send<IUser>({ cmd: 'sign-in' }, data)
        .pipe(
          timeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(new RequestTimeoutException());
            }
            return throwError(err);
          }),
        )
        .toPromise();
      const token = this.jwtService.generate(user.id); // 토큰을 발급해서 줍니다.
      return token;
    } catch (error) {
      AuthService.logger.error(error);
      throw error;
    }
  }
}
