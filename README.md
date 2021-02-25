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

- User Module

```ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

- User Service

```ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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
```

- User Controller

```ts
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
```

### Setting Up For Microservice

- install package

```sh
npm i @nestjs/microservices
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

  // connect #Auth microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "localhost",
      port: 4010,
    },
  });

  app.startAllMicroservicesAsync();
  await app.listen(3010); // 포트도 변경됨! 주의 ㅎㅎ;
}
bootstrap();
```

- fix: User Controller

```ts
// ...
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller("user")
export class UserController {
  // ...

  // @Get(':id')
  @MessagePattern({ role: "user", cmd: "get" })
  findOne(@Payload() id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  // ...
}
```

### User Guard

- auth guard

```sh
nest generate guard auth auth
```

- Auth Guard

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject("AUTH_CLIENT")
    private readonly client: ClientProxy
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const res = await this.client
        .send(
          { role: "auth", cmd: "check" }, // Auth Microservice의 @messagePattern이 얘를 Key 값으로 받는다.
          { jwt: req.headers["authorization"]?.split(" ")[1] }
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
```

- AuthGuard 사용하기

```ts
@Controller("user")
export class UserController {
  // ...

  @UseGuards(AuthGuard)
  @Get("me")
  async getMe(): Promise<string> {
    return `GetMe!`;
  }
}
```

- Error 발생
  아래와 같은 에러가 나오니 User Module에 AuthGuard에 사용한 `ClientModule`을 inject해줍시다.

```sh
[Nest] 8746   - 2021. 02. 25. 오후 2:18:07   [ExceptionHandler] Nest can't resolve dependencies of the AuthGuard (?). Please make sure that the argument AUTH_CLIENT at index [0] is available in the UserModule context.

Potential solutions:
- If AUTH_CLIENT is a provider, is it part of the current UserModule?
- If AUTH_CLIENT is exported from a separate @Module, is that module imported within UserModule?
  @Module({
    imports: [ /* the Module containing AUTH_CLIENT */ ]
  })
 +5ms
Error: Nest can't resolve dependencies of the AuthGuard (?). Please make sure that the argument AUTH_CLIENT at index [0] is available in the UserModule context.

Potential solutions:
- If AUTH_CLIENT is a provider, is it part of the current UserModule?
- If AUTH_CLIENT is exported from a separate @Module, is that module imported within UserModule?
  @Module({
    imports: [ /* the Module containing AUTH_CLIENT */ ]
  })

```

- User Module에 ClientModule 추가

```ts
@Module({
  imports: [
    // ...
    ClientsModule.register([
      {
        name: "AUTH_CLIENT",
        transport: Transport.TCP,
        options: {
          host: "localhost",
          port: 4000,
        },
      },
    ]),
  ],

  // ...
})
export class UserModule {}
```

이제 Auth Microservice를 만들어 봅시다.

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
