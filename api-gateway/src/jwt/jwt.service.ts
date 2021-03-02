import { Inject, Injectable, Logger } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { CONFIG_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interface';

@Injectable()
export class JwtService {
  private static readonly logger = new Logger(JwtService.name);
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: JwtModuleOptions,
  ) {}

  generate(userId: string): string {
    const token = sign({ id: userId }, this.options.privateKey);
    JwtService.logger.log(token);
    return token;
  }

  verify(token: string) {
    return verify(token, this.options.privateKey);
  }
}
