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
npm i joi @nestjs/config @nestjs/mapped-types @nestjs/typeorm typeorm mysql2
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

### User CRUD

- nestjs crud

```sh
nest generate resource user
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
