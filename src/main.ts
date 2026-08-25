import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ?? 3307;
  await app.listen(port);
  console.log(`marketplace-intake-crm listening on :${port}`);
}
bootstrap();
