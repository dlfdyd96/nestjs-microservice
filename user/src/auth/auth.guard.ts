import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject('AUTH_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const res = await this.client
        .send(
          { role: 'auth', cmd: 'check' }, // Auth Microservice의 @messagePattern이 얘를 Key 값으로 받는다.
          { jwt: req.headers['authorization']?.split(' ')[1] },
        )
        .pipe(timeout(5000))
        .toPromise<boolean>();

      return res;
    } catch (error) {
      AuthGuard.logger.log(error);
      return false;
    }
  }
}
