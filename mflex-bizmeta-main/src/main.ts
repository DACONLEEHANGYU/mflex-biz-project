import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 모든 출처 허용 (개발용);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
