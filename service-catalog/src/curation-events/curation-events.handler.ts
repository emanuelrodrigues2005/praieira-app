import { Injectable, Logger } from "@nestjs/common";
import { EventPattern, Payload, Ctx, RmqContext } from "@nestjs/microservices";
import { PrismaService } from "../prisma/prisma.service";
import { DomainEvent, ProfileApprovedPayload, ProfileRejectedPayload } from "../messaging/domain-event";

@Injectable()
export class CurationEventsHandler {
  private readonly logger = new Logger(CurationEventsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern("worker.profile.approved.v1")
  async handleProfileApproved(
    @Payload() event: DomainEvent<ProfileApprovedPayload>,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { profileId, reviewerId, reviewedAt } = event.payload;

      const profile = await this.prisma.workerProfile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        this.logger.warn(`Profile ${profileId} not found for approval event — skipping`);
        channel.ack(originalMsg);
        return;
      }

      if (profile.status !== "PENDING") {
        this.logger.warn(
          `Profile ${profileId} has status ${profile.status}, expected PENDING — skipping approval`,
        );
        channel.ack(originalMsg);
        return;
      }

      await this.prisma.workerProfile.update({
        where: { id: profileId },
        data: {
          status: "APPROVED",
          reviewedBy: reviewerId,
          reviewedAt: new Date(reviewedAt),
        },
      });

      this.logger.log(`Profile ${profileId} approved by ${reviewerId}`);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error processing approval event: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("worker.profile.rejected.v1")
  async handleProfileRejected(
    @Payload() event: DomainEvent<ProfileRejectedPayload>,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { profileId, reviewerId, notes, reviewedAt } = event.payload;

      const profile = await this.prisma.workerProfile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        this.logger.warn(`Profile ${profileId} not found for rejection event — skipping`);
        channel.ack(originalMsg);
        return;
      }

      if (profile.status !== "PENDING") {
        this.logger.warn(
          `Profile ${profileId} has status ${profile.status}, expected PENDING — skipping rejection`,
        );
        channel.ack(originalMsg);
        return;
      }

      await this.prisma.workerProfile.update({
        where: { id: profileId },
        data: {
          status: "REJECTED",
          rejectedReason: notes,
          reviewedBy: reviewerId,
          reviewedAt: new Date(reviewedAt),
        },
      });

      this.logger.log(`Profile ${profileId} rejected by ${reviewerId}`);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error processing rejection event: ${error.message}`);
      channel.nack(originalMsg, false, true);
    }
  }
}
