import { Module } from "@nestjs/common";
import { FavoritesController } from "./favorites.controller";
import { FavoritesService } from "./favorites.service";
import { CatalogModule } from "../catalog/catalog.module";
import { MessagingModule } from "../messaging/messaging.module";
import { CorrelationModule } from "../common/correlation/correlation.module";

@Module({
  imports: [
    CatalogModule,
    MessagingModule,
    CorrelationModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
