import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { USER_CLIENT } from './auth.constant';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';
import { SignInRequestDto } from './dto/sign-in.dto';
import { IUser } from './user.interface';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  private static readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_CLIENT)
    private readonly userClient: ClientProxy,
  ) {}

  async onApplicationBootStrap() {
    await this.userClient.connect();
  }

  async signUp(data) {
    AuthService.logger.debug(data);

    try {
      const { password, ...publicUserInfo } = await this.userClient
        .send({ cmd: 'createUser' }, data)
        .pipe(
          timeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              throw throwError(new RequestTimeoutException());
            }
            throw throwError(err);
          }),
        )
        .toPromise()
        .then()
        .catch((err) => {
          throw new Error(err);
        });

      AuthService.logger.debug(publicUserInfo);
      return publicUserInfo;
    } catch (error) {
      AuthService.logger.error(error);
      throw error;
    }
  }

  async signIn({ username, password: inputPassword }: SignInRequestDto) {
    AuthService.logger.debug(username);
    try {
      const { password, ...publicUserInfo } = await this.userClient
        .send<IUser>({ cmd: 'findByUsername' }, username)
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
      const checkPasswordResult = await this.checkPassword(
        inputPassword,
        password,
      );
      if (checkPasswordResult) {
        return publicUserInfo;
      } else {
        throw new ForbiddenException({
          code: `forbidden_exception`,
          message: [`비밀번호가 틀렸습니다.`],
        });
      }
    } catch (error) {
      AuthService.logger.error(error);
      return error;
    }
  }

  private async checkPassword(inputPassword: string, password: string) {
    try {
      return await compare(inputPassword, password);
    } catch (error) {
      AuthService.logger.error(error);
      throw new InternalServerErrorException({
        ...error.response,
      });
    }
  }
}
