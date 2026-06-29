import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProcessedEventDocument = ProcessedEvent & Document;

@Schema({ timestamps: true, collection: "processed_events" })
export class ProcessedEvent {
  @Prop({ required: true, unique: true, index: true })
  eventId!: string;

  @Prop({ required: true })
  eventName!: string;

  @Prop({ required: true })
  processedAt!: Date;
}

export const ProcessedEventSchema = SchemaFactory.createForClass(ProcessedEvent);
