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

  @Column({ nullable: true })
  avatar: string; // 프로필 이미지 (nullable)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: string;
}
