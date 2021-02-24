import { InternalServerErrorException } from '@nestjs/common';
import { hash } from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Primary Key

  @Column()
  username: string; // id(email 형식)

  @Column()
  name: string; // 사용자명

  @Column()
  password: string; // 비밀번호

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException({
        message: [`Hashing Error`],
      });
    }
  }
}
