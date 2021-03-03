import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { User } from './entities/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'createUser' })
  // @EventPattern({ cmd: 'create_user' })
  create(@Payload() createUserDto: CreateUserDto) {
    console.log(`왓다`);
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'findOne' })
  findOne(@Payload() id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'findByUsername' })
  findByUsername(@Payload() username: string): Promise<User> {
    return this.userService.findByUsername(username);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
