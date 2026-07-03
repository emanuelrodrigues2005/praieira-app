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

export interface ProfileViewedPayload {
  profileId: string;
  viewerRole: string;
  beach: string;
  timestamp: string;
}

export interface ProfileSubmittedPayload {
  profileId: string;
  ownerUserId: string;
  workerName: string;
  beach: string;
  category: string;
  submittedAt: string;
}

export interface ProfileApprovedPayload {
  profileId: string;
  reviewerId: string;
  reviewedAt: string;
}

export interface ProfileRejectedPayload {
  profileId: string;
  reviewerId: string;
  reasonCode: string;
  notes: string;
  reviewedAt: string;
}
