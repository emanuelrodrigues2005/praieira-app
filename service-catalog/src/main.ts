import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:4200",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Praieira App — Catalog & Geo Service")
    .setDescription("Perfil comercial, serviços, geolocalização e busca.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = parseInt(process.env.PORT ?? "3002", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-catalog running on http://localhost:${port}`);
  logger.log(`Swagger at http://localhost:${port}/api`);
}
bootstrap();
