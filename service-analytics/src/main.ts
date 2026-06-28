import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import * as http from "http";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672"],
        queue: "analytics_queue",
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();

  // HTTP mínimo (Node.js nativo, zero dependência extra) para health check
  const port = Number(process.env.PORT) || 3005;
  http
    .createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ status: "ok", service: "service-analytics" }),
      );
    })
    .listen(port, () => {
      console.log(`Health HTTP listening on port ${port}`);
    });
}
bootstrap();
