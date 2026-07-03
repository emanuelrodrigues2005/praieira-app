import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Transport } from "@nestjs/microservices";
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
    .setTitle("Praieira App — Catalog & Geo Service")
    .setDescription("Perfil comercial, serviços, geolocalização e busca.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Connect RMQ microservice consumer for curation events
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672",
      ],
      queue:
        process.env.CATALOG_CURATION_QUEUE ?? "catalog.curation.events",
      queueOptions: { durable: true },
      exchange:
        process.env.RMQ_EXCHANGE ?? "praieira.events",
      exchangeType: "topic",
      bindingKeys: [
        "worker.profile.approved.v1",
        "worker.profile.rejected.v1",
      ],
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  // Start outbox publisher
  const publisher = app.get(OutboxPublisherService);
  const pollInterval = parseInt(
    process.env.OUTBOX_POLL_INTERVAL_MS ?? "1000",
    10,
  );
  const batchSize = parseInt(process.env.OUTBOX_BATCH_SIZE ?? "20", 10);
  publisher.start(pollInterval, batchSize);

  const port = parseInt(process.env.PORT ?? "3002", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-catalog running on http://localhost:${port}`);
  logger.log(`Swagger at http://localhost:${port}/api`);
}
bootstrap();
