import { Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { CatalogModule } from "../catalog/catalog.module";
import { MessagingModule } from "../messaging/messaging.module";
import { CorrelationModule } from "../common/correlation/correlation.module";

@Module({
  imports: [
    CatalogModule,
    MessagingModule,
    CorrelationModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}