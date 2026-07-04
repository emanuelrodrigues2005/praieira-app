import { Module } from "@nestjs/common";
import { CurationController } from "./curation.controller";
import { CurationService } from "./curation.service";
import { PrismaModule } from "../prisma/prisma.module";
import { CorrelationModule } from "../common/correlation/correlation.module";

@Module({
  imports: [PrismaModule, CorrelationModule],
  controllers: [CurationController],
  providers: [CurationService],
  exports: [CurationService],
})
export class CurationModule {}
