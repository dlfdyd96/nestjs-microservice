import {
  Inject,
  Injectable,
  Req,
  RequestTimeoutException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';
import { SignInRequestDto } from './dto/sign-in.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_CLIENT')
    private readonly authClient: ClientProxy,
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

  signIn(data: SignInRequestDto) {
    return this.authClient
      .send({ cmd: 'sign-in' }, data)
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
}
