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

export interface WorkerProfileSubmittedPayload {
  workerProfileId: string;
  ownerUserId: string;
  name: string;
  category: string;
  beach: string;
  submittedAt: string;
}

export interface WorkerProfileApprovedPayload {
  curationRequestId: string;
  workerProfileId: string;
  reviewerId: string;
  notes: string;
  decidedAt: string;
}

export interface WorkerProfileRejectedPayload {
  curationRequestId: string;
  workerProfileId: string;
  reviewerId: string;
  reasonCode: string;
  notes: string;
  decidedAt: string;
}

export interface ReviewSubmittedPayload {
  reviewId: string;
  workerProfileId: string;
  touristUserId: string;
  rating: number;
  hasComment: boolean;
  submittedAt: string;
}

export interface NotificationRequestedPayload {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
}
