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

  // ── Date helper ──

  private eventDate(timestamp: string | Date): string {
    const d = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return d.toISOString().slice(0, 10);
  }

  // ── Idempotency ──

  async isDuplicate(eventId: string): Promise<boolean> {
    const existing = await this.processedEventModel.findOne({ eventId });
    return !!existing;
  }

  async markProcessed(eventId: string, eventName: string): Promise<void> {
    try {
      await this.processedEventModel.create({
        eventId,
        eventName,
        processedAt: new Date(),
      });
    } catch (error: any) {
      if (error.code === 11000) {
        this.logger.debug(`Already processed: ${eventId}`);
      } else {
        throw error;
      }
    }
  }

  // ── Profile View ──

  async handleProfileViewed(data: {
    eventId: string;
    workerProfileId: string;
    viewerUserId?: string;
    viewerRole?: string;
    beach?: string;
    viewedAt?: string;
  }) {
    const date = data.viewedAt
      ? this.eventDate(data.viewedAt)
      : this.eventDate(new Date());
    const beach = data.beach ?? "unknown";

    // Persist raw view
    await this.profileViewModel.create({
      profileId: data.workerProfileId,
      viewerRole: data.viewerRole ?? "TOURIST",
      beach,
      timestamp: data.viewedAt ? new Date(data.viewedAt) : new Date(),
    });

    const update: any = {
      $inc: { profileViews: 1 },
      $addToSet: { appliedEventIds: data.eventId },
    };

    // Track unique viewers
    if (data.viewerUserId) {
      update.$addToSet = {
        ...update.$addToSet,
        uniqueViewerIds: data.viewerUserId,
      };
    }

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        ...update,
        $setOnInsert: {
          workerProfileId: data.workerProfileId,
          beach,
          date,
          contactIntentions: 0,
          whatsappClicks: 0,
          phoneClicks: 0,
          reviewsCount: 0,
          ratingSum: 0,
          ratingAverage: 0,
          uniqueViewers: 0,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );

    // Update uniqueViewers count
    if (data.viewerUserId) {
      const doc = await this.metricsModel.findOne({
        workerProfileId: data.workerProfileId,
        date,
      });
      if (doc) {
        await this.metricsModel.updateOne(
          { _id: doc._id },
          { $set: { uniqueViewers: doc.uniqueViewerIds?.length ?? 0 } },
        );
      }
    }
  }

  // ── Review Submitted ──

  async handleReviewSubmitted(data: {
    eventId: string;
    workerProfileId: string;
    rating: number;
    submittedAt?: string;
  }) {
    const date = data.submittedAt
      ? this.eventDate(data.submittedAt)
      : this.eventDate(new Date());

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: { reviewsCount: 1, ratingSum: data.rating },
        $addToSet: { appliedEventIds: data.eventId },
        $setOnInsert: {
          workerProfileId: data.workerProfileId,
          beach: "unknown",
          date,
          profileViews: 0,
          contactIntentions: 0,
          whatsappClicks: 0,
          phoneClicks: 0,
          uniqueViewers: 0,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );

    await this.recalculateAverage(data.workerProfileId, date);
  }

  // ── Review Updated ──

  async handleReviewUpdated(data: {
    eventId: string;
    workerProfileId: string;
    previousRating: number;
    rating: number;
    previousStatus: string;
    status: string;
    updatedAt?: string;
  }) {
    const date = data.updatedAt
      ? this.eventDate(data.updatedAt)
      : this.eventDate(new Date());

    // If the review was and still is publicly visible, adjust ratingSum
    if (
      data.previousStatus === "PUBLISHED" &&
      data.status === "PUBLISHED"
    ) {
      const diff = data.rating - data.previousRating;
      await this.metricsModel.updateOne(
        { workerProfileId: data.workerProfileId, date },
        {
          $inc: { ratingSum: diff },
          $addToSet: { appliedEventIds: data.eventId },
          $setOnInsert: {
            workerProfileId: data.workerProfileId,
            beach: "unknown",
            date,
            profileViews: 0,
            contactIntentions: 0,
            whatsappClicks: 0,
            phoneClicks: 0,
            reviewsCount: 0,
            ratingSum: 0,
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      );
      await this.recalculateAverage(data.workerProfileId, date);
    }
  }

  // ── Review Removed ──

  async handleReviewRemoved(data: {
    eventId: string;
    workerProfileId: string;
    rating: number;
    previousStatus: string;
    removedAt?: string;
  }) {
    if (data.previousStatus !== "PUBLISHED") return;

    const date = data.removedAt
      ? this.eventDate(data.removedAt)
      : this.eventDate(new Date());

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: { reviewsCount: -1, ratingSum: -data.rating },
        $addToSet: { appliedEventIds: data.eventId },
        $set: { updatedAt: new Date() },
      },
    );

    await this.recalculateAverage(data.workerProfileId, date);
  }

  // ── Review Moderated ──

  async handleReviewModerated(data: {
    eventId: string;
    workerProfileId: string;
    rating: number;
    previousStatus: string;
    status: string;
    moderatedAt?: string;
  }) {
    // Only adjust if transitioning from PUBLISHED to HIDDEN/REMOVED
    if (data.previousStatus !== "PUBLISHED") return;
    if (data.status !== "HIDDEN" && data.status !== "REMOVED") return;

    const date = data.moderatedAt
      ? this.eventDate(data.moderatedAt)
      : this.eventDate(new Date());

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: { reviewsCount: -1, ratingSum: -data.rating },
        $addToSet: { appliedEventIds: data.eventId },
        $set: { updatedAt: new Date() },
      },
    );

    await this.recalculateAverage(data.workerProfileId, date);
  }

  // ── Contact Clicked ──

  async handleContactClicked(data: {
    eventId: string;
    workerProfileId: string;
    channel?: string;
    clickedAt?: string;
  }) {
    const date = data.clickedAt
      ? this.eventDate(data.clickedAt)
      : this.eventDate(new Date());

    const inc: any = { contactIntentions: 1 };
    if (data.channel === "WHATSAPP") {
      inc.whatsappClicks = 1;
    } else if (data.channel === "PHONE") {
      inc.phoneClicks = 1;
    }

    await this.metricsModel.updateOne(
      { workerProfileId: data.workerProfileId, date },
      {
        $inc: inc,
        $addToSet: { appliedEventIds: data.eventId },
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

  // ── Recalculate ──

  private async recalculateAverage(
    workerProfileId: string,
    date: string,
  ) {
    const doc = await this.metricsModel.findOne({
      workerProfileId,
      date,
    });
    if (!doc) return;

    const count = Math.max(0, doc.reviewsCount);
    const sum = Math.max(0, doc.ratingSum);
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    await this.metricsModel.updateOne(
      { _id: doc._id },
      { $set: { ratingAverage: avg, reviewsCount: count, ratingSum: sum } },
    );
  }

  // ── Queries ──

  async getWorkerSummary(
    workerProfileId: string,
    from: string,
    to: string,
  ) {
    const metrics = await this.metricsModel
      .find({ workerProfileId, date: { $gte: from, $lte: to } })
      .sort({ date: 1 });

    const profileViews = metrics.reduce((s, m) => s + m.profileViews, 0);
    const uniqueViewers = metrics.reduce((s, m) => s + m.uniqueViewers, 0);
    const contactIntentions = metrics.reduce(
      (s, m) => s + m.contactIntentions,
      0,
    );
    const whatsappClicks = metrics.reduce((s, m) => s + m.whatsappClicks, 0);
    const phoneClicks = metrics.reduce((s, m) => s + m.phoneClicks, 0);
    const reviewsCount = metrics.reduce((s, m) => s + m.reviewsCount, 0);
    const ratingSum = metrics.reduce((s, m) => s + m.ratingSum, 0);
    const averageRating =
      reviewsCount > 0 ? Math.round((ratingSum / reviewsCount) * 10) / 10 : 0;
    const contactInterestRate =
      profileViews > 0
        ? Math.round((contactIntentions / profileViews) * 100) / 100
        : 0;

    return {
      workerProfileId,
      period: { from, to },
      profileViews,
      uniqueViewers,
      contactIntentions,
      whatsappClicks,
      phoneClicks,
      reviewsCount,
      averageRating,
      contactInterestRate,
      disclaimer:
        "Contatos representam intenções de contato e não vendas ou transações confirmadas.",
    };
  }

  async getWorkerTimeseries(
    workerProfileId: string,
    from: string,
    to: string,
  ) {
    return this.metricsModel
      .find({ workerProfileId, date: { $gte: from, $lte: to } })
      .sort({ date: 1 })
      .select(
        "date profileViews uniqueViewers contactIntentions whatsappClicks phoneClicks reviewsCount ratingAverage beach",
      )
      .lean();
  }

  async getBeachSummary(beach: string, from: string, to: string) {
    const metrics = await this.metricsModel.find({
      beach,
      date: { $gte: from, $lte: to },
    });

    const profileViews = metrics.reduce((s, m) => s + m.profileViews, 0);
    const contactClicks = metrics.reduce(
      (s, m) => s + m.contactIntentions,
      0,
    );
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
}
