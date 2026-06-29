import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WorkerDailyMetricsDocument = WorkerDailyMetrics & Document;

@Schema({ timestamps: true, collection: "worker_daily_metrics" })
export class WorkerDailyMetrics {
  @Prop({ required: true })
  workerProfileId: string;

  @Prop({ required: true })
  beach: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ default: 0 })
  profileViews: number;

  @Prop({ default: 0 })
  uniqueViewers: number;

  @Prop({ default: 0 })
  contactIntentions: number;

  @Prop({ default: 0 })
  whatsappClicks: number;

  @Prop({ default: 0 })
  phoneClicks: number;

  @Prop({ default: 0 })
  reviewsCount: number;

  @Prop({ default: 0 })
  ratingSum: number;

  @Prop({ default: 0 })
  ratingAverage: number;

  @Prop({ type: [String], default: [] })
  appliedEventIds: string[];

  @Prop({ type: [String], default: [] })
  uniqueViewerIds: string[];

  @Prop()
  updatedAt: Date;
}

export const WorkerDailyMetricsSchema = SchemaFactory.createForClass(WorkerDailyMetrics);

WorkerDailyMetricsSchema.index({ workerProfileId: 1, date: 1 }, { unique: true });
WorkerDailyMetricsSchema.index({ beach: 1, date: 1 });
