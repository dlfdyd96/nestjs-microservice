import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      options: {
        port: +process.env.NODE_PORT,
      },
      transport: Transport.TCP,
    },
  );
  await app.listen(() => console.log('Auth Microservice is Listening!!\n'));
}
bootstrap();
