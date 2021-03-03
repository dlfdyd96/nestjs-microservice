export interface IUser {
  id: string; // Primary Key

  username: string; // id(email 형식)

  name: string; // 사용자명

  password?: string; // 비밀번호

  avatar: string; // 프로필 이미지 (nullable)

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;

  version: string;
}
