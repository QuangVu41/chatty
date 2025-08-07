import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

const dirname = path.resolve();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   credentials: true,
  // });
  if (configService.get('NODE_ENV') === 'production')
    app.useStaticAssets(path.join(dirname, '../frontend/dist'));

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
