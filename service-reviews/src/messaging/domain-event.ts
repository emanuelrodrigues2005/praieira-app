export interface DomainEvent<TPayload> {
  eventId: string;
  eventName: string;
  version: 1;
  occurredAt: string;
  correlationId: string;
  producer: string;
  actor?: {
    userId?: string;
    role?: "TOURIST" | "WORKER" | "CURATOR" | "ADMIN" | "SYSTEM";
  };
  payload: TPayload;
}

export interface ReviewSubmittedPayload {
  reviewId: string;
  workerProfileId: string;
  touristUserId: string;
  rating: number;
  hasComment: boolean;
  submittedAt: string;
}

export interface ReviewUpdatedPayload {
  reviewId: string;
  workerProfileId: string;
  touristUserId: string;
  rating: number;
  hasComment: boolean;
  updatedAt: string;
}

export interface ReviewRemovedPayload {
  reviewId: string;
  workerProfileId: string;
  touristUserId: string;
  removedAt: string;
}

export interface ReviewModeratedPayload {
  reviewId: string;
  workerProfileId: string;
  moderatedByUserId: string;
  reason: string;
  moderatedAt: string;
}

export interface ReviewReportedPayload {
  reportId: string;
  reviewId: string;
  workerProfileId: string;
  reportedByUserId: string;
  reason: string;
  reportedAt: string;
}

export interface ContactClickedPayload {
  interactionId: string;
  workerProfileId: string;
  touristUserId: string | null;
  channel: string;
  source: string | null;
  clickedAt: string;
}
