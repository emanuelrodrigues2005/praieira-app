import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProfileView, ProfileViewDocument } from "./schemas/profile-view.schema";
import { ProcessedEvent, ProcessedEventDocument } from "./schemas/processed-event.schema";
import { WorkerDailyMetrics, WorkerDailyMetricsDocument } from "./schemas/worker-daily-metrics.schema";

type MetricCounter =
  | "profileViews"
  | "contactIntentions"
  | "whatsappClicks"
  | "phoneClicks"
  | "reviewsCount"
  | "ratingSum";

const METRIC_COUNTERS: MetricCounter[] = [
  "profileViews",
  "contactIntentions",
  "whatsappClicks",
  "phoneClicks",
  "reviewsCount",
  "ratingSum",
];

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

  // ── Atomic metric application ──

  private async applyMetricEvent(params: {
    eventId: string;
    workerProfileId: string;
    date: string;
    beach?: string;
    increments?: Partial<Record<MetricCounter, number>>;
    uniqueViewerId?: string;
  }): Promise<void> {
    const increments = params.increments ?? {};

    const currentEventIds = {
      $ifNull: ["$appliedEventIds", []],
    };

    const alreadyApplied = {
      $in: [params.eventId, currentEventIds],
    };

    const setStage: Record<string, unknown> = {
      workerProfileId: {
        $ifNull: ["$workerProfileId", params.workerProfileId],
      },
      date: {
        $ifNull: ["$date", params.date],
      },
      beach: {
        $cond: [
          {
            $or: [
              { $eq: [{ $ifNull: ["$beach", "unknown"] }, "unknown"] },
              { $eq: [{ $ifNull: ["$beach", null] }, null] },
            ],
          },
          params.beach ?? "unknown",
          "$beach",
        ],
      },
      appliedEventIds: {
        $cond: [
          alreadyApplied,
          currentEventIds,
          { $concatArrays: [currentEventIds, [params.eventId]] },
        ],
      },
      uniqueViewerIds: {
        $ifNull: ["$uniqueViewerIds", []],
      },
      updatedAt: "$$NOW",
    };

    for (const counter of METRIC_COUNTERS) {
      const delta = increments[counter] ?? 0;

      setStage[counter] = {
        $cond: [
          alreadyApplied,
          { $ifNull: [`$${counter}`, 0] },
          {
            $max: [
              0,
              {
                $add: [
                  { $ifNull: [`$${counter}`, 0] },
                  delta,
                ],
              },
            ],
          },
        ],
      };
    }

    if (params.uniqueViewerId) {
      const currentViewers = { $ifNull: ["$uniqueViewerIds", []] };

      setStage.uniqueViewerIds = {
        $cond: [
          alreadyApplied,
          currentViewers,
          { $setUnion: [currentViewers, [params.uniqueViewerId]] },
        ],
      };
    }

    const pipeline = [
      { $set: setStage },
      {
        $set: {
          uniqueViewers: { $size: { $ifNull: ["$uniqueViewerIds", []] } },
          ratingAverage: {
            $cond: [
              { $gt: ["$reviewsCount", 0] },
              { $round: [{ $divide: ["$ratingSum", "$reviewsCount"] }, 1] },
              0,
            ],
          },
        },
      },
    ];

    await this.metricsModel.updateOne(
      {
        workerProfileId: params.workerProfileId,
        date: params.date,
      },
      pipeline as any,
      { upsert: true },
    );
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

    // Persist raw view with eventId for idempotency
    await this.profileViewModel.updateOne(
      { eventId: data.eventId },
      {
        $setOnInsert: {
          eventId: data.eventId,
          profileId: data.workerProfileId,
          viewerRole: data.viewerRole ?? "TOURIST",
          beach,
          timestamp: data.viewedAt
            ? new Date(data.viewedAt)
            : new Date(),
        },
      },
      { upsert: true },
    );

    await this.applyMetricEvent({
      eventId: data.eventId,
      workerProfileId: data.workerProfileId,
      date,
      beach,
      increments: {
        profileViews: 1,
      },
      uniqueViewerId: data.viewerUserId,
    });
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

    await this.applyMetricEvent({
      eventId: data.eventId,
      workerProfileId: data.workerProfileId,
      date,
      increments: {
        reviewsCount: 1,
        ratingSum: data.rating,
      },
    });
  }

  // ── Review Updated ──

  async handleReviewUpdated(data: {
    eventId: string;
    workerProfileId: string;
    previousRating: number;
    rating: number;
    previousStatus: string;
    status: string;
    originalSubmittedAt?: string;
    updatedAt?: string;
  }) {
    const date = data.originalSubmittedAt
      ? this.eventDate(data.originalSubmittedAt)
      : this.eventDate(new Date());

    if (
      data.previousStatus === "PUBLISHED" &&
      data.status === "PUBLISHED"
    ) {
      await this.applyMetricEvent({
        eventId: data.eventId,
        workerProfileId: data.workerProfileId,
        date,
        increments: {
          ratingSum: data.rating - data.previousRating,
        },
      });
    }
  }

  // ── Review Removed ──

  async handleReviewRemoved(data: {
    eventId: string;
    workerProfileId: string;
    rating: number;
    previousStatus: string;
    originalSubmittedAt?: string;
    removedAt?: string;
  }) {
    if (data.previousStatus !== "PUBLISHED") return;

    const date = data.originalSubmittedAt
      ? this.eventDate(data.originalSubmittedAt)
      : this.eventDate(new Date());

    await this.applyMetricEvent({
      eventId: data.eventId,
      workerProfileId: data.workerProfileId,
      date,
      increments: {
        reviewsCount: -1,
        ratingSum: -data.rating,
      },
    });
  }

  // ── Review Moderated ──

  async handleReviewModerated(data: {
    eventId: string;
    workerProfileId: string;
    rating: number;
    previousStatus: string;
    status: string;
    originalSubmittedAt?: string;
    moderatedAt?: string;
  }) {
    if (data.previousStatus !== "PUBLISHED") return;
    if (data.status !== "HIDDEN" && data.status !== "REMOVED") return;

    const date = data.originalSubmittedAt
      ? this.eventDate(data.originalSubmittedAt)
      : this.eventDate(new Date());

    await this.applyMetricEvent({
      eventId: data.eventId,
      workerProfileId: data.workerProfileId,
      date,
      increments: {
        reviewsCount: -1,
        ratingSum: -data.rating,
      },
    });
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

    const increments: Partial<Record<MetricCounter, number>> = {
      contactIntentions: 1,
    };

    if (data.channel === "WHATSAPP") {
      increments.whatsappClicks = 1;
    }

    if (data.channel === "PHONE") {
      increments.phoneClicks = 1;
    }

    await this.applyMetricEvent({
      eventId: data.eventId,
      workerProfileId: data.workerProfileId,
      date,
      increments,
    });
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
