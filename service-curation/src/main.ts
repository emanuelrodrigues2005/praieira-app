import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { OutboxPublisherService } from "./messaging/outbox-publisher.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Connect curation.events microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672"],
      queue: "curation.events",
      queueOptions: {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "praieira.dlx",
          "x-dead-letter-routing-key": "curation.events.dlq",
        },
      },
      noAck: false,
      persistent: true,
      prefetchCount: 10,
    },
  });

  // 2. Connect notification.events microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672"],
      queue: "notification.events",
      queueOptions: {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "praieira.dlx",
          "x-dead-letter-routing-key": "notification.events.dlq",
        },
      },
      noAck: false,
      persistent: true,
      prefetchCount: 10,
    },
  });

  // CORS and Global validation
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

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("Praieira App — Curation & Notification Service")
    .setDescription("Moderação, curadoria de perfis de empreendedores e central de notificações.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .addTag("Curation")
    .addTag("Notifications")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Start RMQ consumers
  await app.startAllMicroservices();

  // Start local Outbox publisher loop
  const publisher = app.get(OutboxPublisherService);
  const pollInterval = parseInt(
    process.env.OUTBOX_POLL_INTERVAL_MS ?? "1000",
    10,
  );
  const batchSize = parseInt(process.env.OUTBOX_BATCH_SIZE ?? "20", 10);
  publisher.start(pollInterval, batchSize);

  const port = parseInt(process.env.PORT ?? "3004", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-curation running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api`);
}
bootstrap();
