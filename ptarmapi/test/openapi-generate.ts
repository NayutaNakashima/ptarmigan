import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

NestFactory.create(AppModule).then(app => {
  const options = new DocumentBuilder()
  .setTitle('ptarmigan rest-api')
  .setDescription('Lightning Network implimentation ptarmigan REST-API')
  .setVersion('1.0')
  .addTag('', '')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  fs.writeFileSync('./docs/openapi.json', JSON.stringify(document), 'UTF-8');
});
