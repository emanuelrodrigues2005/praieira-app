import { Module } from "@nestjs/common";
import { CurationEventsHandler } from "./curation-events.handler";

@Module({
  providers: [CurationEventsHandler],
})
export class CurationEventsModule {}
