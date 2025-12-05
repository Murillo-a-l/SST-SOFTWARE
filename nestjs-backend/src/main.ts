import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Ocupalli API')
    .setDescription('Sistema de Saúde Ocupacional - Superior ao Sistema ESO')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('companies', 'Empresas/Empregadores')
    .addTag('workers', 'Trabalhadores')
    .addTag('jobs', 'Cargos')
    .addTag('employments', 'Vínculos trabalhador-cargo-empresa')
    .addTag('procedures', 'Procedimentos/Exames')
    .addTag('appointments', 'Agendamentos')
    .addTag('waiting-room', 'Sala de Espera')
    .addTag('documents', 'Documentos (ASO, Prontuário, etc)')
    .addTag('files', 'Upload de arquivos')
    .addTag('clinic-units', 'Unidades da clínica')
    .addTag('rooms', 'Salas/Consultórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('\n🚀 Ocupalli Backend rodando!');
  console.log(`📡 Server: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  console.log(`🎯 API Base: http://localhost:${port}/api/v1\n`);
}

bootstrap();
