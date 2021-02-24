import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private static readonly logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto) {
    try {
      const userEntity = await this.userRepository.create(createUserDto);
      const result = await this.userRepository.save(userEntity);

      UserService.logger.log(result);

      return result;
    } catch (error) {
      UserService.logger.log(error);
      throw error;
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    try {
      const result = this.userRepository.findOne(id);

      if (!result) {
        throw new EntityNotFoundError(User, id);
      }

      UserService.logger.log(result);

      return result;
    } catch (error) {
      UserService.logger.log(error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne(id);

      if (!user) {
        throw new EntityNotFoundError(User, id);
      }

      const result = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });

      UserService.logger.log(result);

      return result;
    } catch (error) {
      UserService.logger.log(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const user = this.userRepository.findOne(id);
      if (!user) {
        throw new EntityNotFoundError(User, id);
      }

      const result = await this.userRepository.delete(id);

      UserService.logger.log(result);

      return result;
    } catch (error) {
      UserService.logger.log(error);
      throw error;
    }
  }
}
