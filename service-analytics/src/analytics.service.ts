import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProfileView, ProfileViewDocument } from "./schemas/profile-view.schema";
import { ProcessedEvent, ProcessedEventDocument } from "./schemas/processed-event.schema";
import { WorkerDailyMetrics, WorkerDailyMetricsDocument } from "./schemas/worker-daily-metrics.schema";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(ProfileView.name)
    private readonly profileViewModel: Model<ProfileViewDocument>,
    @InjectModel(ProcessedEvent.name)
    private readonly processedEventModel: Model<ProcessedEventDocument>,
    @InjectModel(WorkerDailyMetrics.name)
    private readonly metricsModel: Model<WorkerDailyMetricsDocument>,
  ) {}

  // ── Idempotency check ──

  async isDuplicate(eventId: string): Promise<boolean> {
    const existing = await this.processedEventModel.findOne({ eventId });
    return !!existing;
  }

  async markProcessed(eventId: string, eventName: string): Promise<void> {
    await this.processedEventModel.create({
      eventId,
      eventName,
      processedAt: new Date(),
    });
  }

  // ── Profile View ──

  async handleProfileViewed(data: {
    eventId: string;
    profileId: string;
    viewerRole?: string;
    beach?: string;
    timestamp?: string;
  }) {
    // Persist raw view
    await this.profileViewModel.create({
      profileId: data.profileId,
      viewerRole: data.viewerRole ?? "TOURIST",
      beach: data.beach ?? "unknown",
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    });

    // Update daily metrics
    const date = this.today();
    const beach = data.beach ?? "unknown";

    await this.metricsModel.updateOne(
      { workerProfileId: data.profileId, date },
      {
        $inc: { profileViews: 1 },
        $setOnInsert: {
          workerProfileId: data.profileId,
          beach,
          date,
          whatsappClicks: 0,
          reviewsCount: 0,
          ratingSum: 0,
          ratingAverage: 0,
          uniqueViewers: 0,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );
  }

  // ── Review Submitted ──

  async handleReviewSubmitted(data: {
    eventId: string;
    reviewId: string;
    workerProfileId: string;
    rating: number;
  }) {
    const date = this.today();

    const result = await this.metricsModel.findOneAndUpdate(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: {
          reviewsCount: 1,
          ratingSum: data.rating,
        },
        $setOnInsert: {
          workerProfileId: data.workerProfileId,
          beach: "unknown",
          date,
          profileViews: 0,
          whatsappClicks: 0,
          uniqueViewers: 0,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true },
    );

    if (result) {
      const avg =
        result.reviewsCount > 0
          ? Math.round((result.ratingSum / result.reviewsCount) * 10) / 10
          : 0;
      await this.metricsModel.updateOne(
        { _id: result._id },
        { $set: { ratingAverage: avg } },
      );
    }
  }

  // ── Contact Clicked ──

  async handleContactClicked(data: {
    eventId: string;
    interactionId: string;
    workerProfileId: string;
    channel?: string;
  }) {
    const date = this.today();

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: { whatsappClicks: 1 },
        $setOnInsert: {
          workerProfileId: data.workerProfileId,
          beach: "unknown",
          date,
          profileViews: 0,
          reviewsCount: 0,
          ratingSum: 0,
          ratingAverage: 0,
          uniqueViewers: 0,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );
  }

  // ── Queries ──

  async getWorkerSummary(
    workerProfileId: string,
    from: string,
    to: string,
  ) {
    const metrics = await this.metricsModel
      .find({
        workerProfileId,
        date: { $gte: from, $lte: to },
      })
      .sort({ date: 1 });

    const profileViews = metrics.reduce((s, m) => s + m.profileViews, 0);
    const whatsappClicks = metrics.reduce((s, m) => s + m.whatsappClicks, 0);
    const reviewsCount = metrics.reduce((s, m) => s + m.reviewsCount, 0);
    const ratingSum = metrics.reduce((s, m) => s + m.ratingSum, 0);
    const averageRating =
      reviewsCount > 0 ? Math.round((ratingSum / reviewsCount) * 10) / 10 : 0;
    const contactConversionRate =
      profileViews > 0
        ? Math.round((whatsappClicks / profileViews) * 100) / 100
        : 0;

    return {
      workerProfileId,
      period: { from, to },
      profileViews,
      whatsappClicks,
      reviewsCount,
      averageRating,
      contactConversionRate,
    };
  }

  async getWorkerTimeseries(
    workerProfileId: string,
    from: string,
    to: string,
  ) {
    return this.metricsModel
      .find({
        workerProfileId,
        date: { $gte: from, $lte: to },
      })
      .sort({ date: 1 })
      .select("date profileViews whatsappClicks reviewsCount ratingAverage beach")
      .lean();
  }

  async getBeachSummary(beach: string, from: string, to: string) {
    const metrics = await this.metricsModel
      .find({
        beach,
        date: { $gte: from, $lte: to },
      });

    const profileViews = metrics.reduce((s, m) => s + m.profileViews, 0);
    const contactClicks = metrics.reduce((s, m) => s + m.whatsappClicks, 0);
    const reviewsCount = metrics.reduce((s, m) => s + m.reviewsCount, 0);
    const uniqueProfileIds = new Set(metrics.map((m) => m.workerProfileId));

    return {
      beach,
      period: { from, to },
      profileViews,
      contactClicks,
      reviewsCount,
      activeProfilesObserved: uniqueProfileIds.size,
    };
  }

  // ── Helpers ──

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
