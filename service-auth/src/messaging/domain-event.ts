export interface DomainEvent<T> {
  eventId: string;
  eventName: string;
  version: number;
  occurredAt: string;
  correlationId: string;
  producer: string;
  actor?: {
    userId?: string;
    role?: string;
  };
  payload: T;
}
