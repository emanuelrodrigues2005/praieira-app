import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { OutboxRepository } from "./outbox.repository";
import { OutboxPublisherService } from "./outbox-publisher.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: "RMQ_CLIENT",
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              process.env.RMQ_URL ??
                "amqp://guest:guest@localhost:5672",
            ],
            exchange:
              process.env.RMQ_EXCHANGE ??
              "praieira.events",
            exchangeType: "topic",
            wildcards: true,
            persistent: true,
          },
        }),
      },
    ]),
  ],
  providers: [
    OutboxRepository,
    OutboxPublisherService,
  ],
  exports: [
    OutboxRepository,
    OutboxPublisherService,
  ],
})
export class MessagingModule {}
