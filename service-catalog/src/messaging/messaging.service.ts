import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProfileViewedPayload } from "./domain-event";

@Injectable()
export class MessagingService {
  constructor(
    @Inject("RMQ_CLIENT") private readonly rmqClient: ClientProxy,
  ) {}

  emitProfileViewed(payload: ProfileViewedPayload): void {
    this.rmqClient.emit("profile.viewed.v1", payload);
  }
}
