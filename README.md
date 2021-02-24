# NestJS Microservice Authentication

따흐흑 너무 어려워

## Setting Up Microservice

```sh
mkdir nestjs-msa
nest new auth
nest new user
```

<hr>

## User Microservice

### Setting Up

- install package

```sh
cd user
npm i joi @nestjs/config @nestjs/mapped-types @nestjs/typeorm typeorm mysql2 bcrypt
npm i class-validator class-transformer

npm i --D @types/bcrypt
```

- env file

```env
# File Should exist on Project Root Directory
# File Name : `.env`

NODE_PORT=3000

# MySQL Database Hostname
MYSQL_HOST=127.0.0.1

# MySQL Database Port
MYSQL_PORT=10310

# MySQL Database username
MYSQL_USERNAME=ilyong

# MySQL Database Password
MYSQL_PASSWORD=ilyong

# MySQL Database Schema Name
MYSQL_DATABASE=ilyong
```

- AppModule

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_PORT: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.string().required(),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- main

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(3000);
}
bootstrap();
```

### User CRUD

- nestjs crud

```sh
nest generate resource user
```

- user entity

```ts
@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
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
```

- TypeORM

```ts
@Module({
  imports: [
    // ...
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      synchronize: true,
      logging: true,
      charset: "utf8mb4_unicode_ci",
      timezone: "+09:00",
      entities: [User],
    }),
    // ...
  ],
  // ...
})
export class AppModule {}
```

- Create User DTO

```ts
export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
```

- Update User DTO

```ts
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["username"] as const)
) {}
```

- User Service

```ts

```

<hr>

## Authentication Microservice

### Setting Up

- install package

```sh
npm i joi @nestjs/config
```

- env file

```env
NODE_PORT=3000
```

- AppModule

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_PORT: Joi.string().required(),
      }),
    }),
  ],
```
