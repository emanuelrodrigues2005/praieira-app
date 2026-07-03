import { Module } from "@nestjs/common";
import { CurationController } from "./curation.controller";
import { CurationService } from "./curation.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CurationController],
  providers: [CurationService],
  exports: [CurationService],
})
export class CurationModule {}
