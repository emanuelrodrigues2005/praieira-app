import { Module } from "@nestjs/common";
import { InteractionsController } from "./interactions.controller";
import { InteractionsService } from "./interactions.service";
import { CatalogModule } from "../catalog/catalog.module";
import { MessagingModule } from "../messaging/messaging.module";

@Module({
  imports: [CatalogModule, MessagingModule],
  controllers: [InteractionsController],
  providers: [InteractionsService],
})
export class InteractionsModule {}
