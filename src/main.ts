import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/nin-face-match-bulk-job')
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
