import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import {ConfigService} from 'nestjs-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger setting
  const options = new DocumentBuilder()
    .setTitle('ptarmigan REST-API')
    .setDescription('Lightning Network implementation ptarmigan REST-API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const config = ConfigService;
  Logger.log(config.get('ptarmigan.bitcoindPort'));
  Logger.log(config.get('ptarmigan.bitcoindHost'));
  Logger.log(config.get('ptarmigan.bitcoindUser'));
  Logger.log(config.get('ptarmigan.bitcoindPassword'));

  await app.listen(3000);
}
bootstrap();
