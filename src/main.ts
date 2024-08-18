import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    snapshot: true,
  });
  app.setGlobalPrefix('api/auth');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Law Firm')
    .setDescription('The Law Firm API description')
    .setVersion('1.0')
    .addTag('law')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.startAllMicroservices();
  await app.enableCors();
  await app.listen(3000);
}
bootstrap();
