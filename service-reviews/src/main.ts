import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { OutboxPublisherService } from "./messaging/outbox-publisher.service";

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
    .setTitle("Praieira App — Interaction & Review Service")
    .setDescription(
      "Avaliações, contato e interações entre turistas e empreendedores.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .addTag("Reviews")
    .addTag("Interactions")
    .addTag("Moderation")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Start outbox publisher
  const publisher = app.get(OutboxPublisherService);
  const pollInterval = parseInt(
    process.env.OUTBOX_POLL_INTERVAL_MS ?? "1000",
    10,
  );
  const batchSize = parseInt(process.env.OUTBOX_BATCH_SIZE ?? "20", 10);
  publisher.start(pollInterval, batchSize);

  const port = parseInt(process.env.PORT ?? "3003", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-reviews running on http://localhost:${port}`);
  logger.log(`Swagger at http://localhost:${port}/api`);
}
bootstrap();
