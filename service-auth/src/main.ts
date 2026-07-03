import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";

import { OutboxPublisherService } from "./messaging/outbox-publisher.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:4200",
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("Praieira App — Auth & Profile Service")
    .setDescription("Gestão de identidades, sessões JWT e perfis de usuários.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .addTag("Authentication")
    .addTag("Profiles")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Start Outbox Daemon
  app.get(OutboxPublisherService).start(1000, 20);

  const port = parseInt(process.env.PORT ?? "3001", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-auth running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
