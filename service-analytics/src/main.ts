import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // RMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672"],
      queue: process.env.RMQ_QUEUE ?? "analytics.events",
      queueOptions: {
        durable: true,
        arguments: {
          "x-dead-letter-exchange":
            process.env.RMQ_DLX ?? "praieira.dlx",
          "x-dead-letter-routing-key":
            process.env.RMQ_DLQ ?? "analytics.events.dlq",
        },
      },
      noAck: false,
      persistent: true,
      prefetchCount: 10,
      exchange: process.env.RMQ_EXCHANGE ?? "praieira.events",
      exchangeType: "topic",
      wildcards: true,
      maxConnectionAttempts: -1,
    },
  });

  // HTTP
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
    .setTitle("Praieira App — Analytics Engine")
    .setDescription("Métricas e dashboards consumidos de eventos de negócio.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .addTag("Analytics")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();

  const port = parseInt(process.env.PORT ?? "3005", 10);
  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`service-analytics HTTP + RMQ running on port ${port}`);
  logger.log(`Swagger at http://localhost:${port}/api`);
}
bootstrap();
