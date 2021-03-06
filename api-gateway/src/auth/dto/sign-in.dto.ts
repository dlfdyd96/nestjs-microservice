import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class SignInRequestDto extends PartialType(
  OmitType(CreateUserDto, ['name'] as const),
) {}
