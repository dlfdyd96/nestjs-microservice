import {
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  RequestTimeoutException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';
import { IUser } from 'src/auth/user.interface';
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private static readonly logger = new Logger(JwtMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    // private readonly userService: UserService,
    @Inject('USER_CLIENT')
    private readonly userClient: ClientProxy,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const decodedToken = this.jwtService.verify(token.toString());

      if (
        typeof decodedToken === 'object' &&
        decodedToken.hasOwnProperty('id')
      ) {
        try {
          // const user = await this.userService.findById(decoded['id']);
          const userId: string = decodedToken['id'];
          const {
            password,
            ...publicUser // 비밀번호를 제외하고 공개할 나머지 정보를 반환하기위해
          } = await this.userClient
            .send<IUser>({ cmd: 'findOne' }, userId)
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

          JwtMiddleware.logger.debug(publicUser);
          req['user'] = publicUser;
        } catch (err) {
          JwtMiddleware.logger.debug(err);
          console.log(err);
          throw err;
        }
      }
    }
    JwtMiddleware.logger.debug(`Nest!`);
    next();
  }
}
