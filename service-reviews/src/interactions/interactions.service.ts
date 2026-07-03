import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CATALOG_CLIENT, CatalogClient } from "../catalog/catalog-client.interface";
import { CreateContactInteractionDto } from "./dto/create-contact-interaction.dto";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CorrelationService } from "../common/correlation/correlation.service";

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_CLIENT) private readonly catalogClient: CatalogClient,
    private readonly correlationService: CorrelationService,
  ) {}

  async registerContact(
    workerProfileId: string,
    dto: CreateContactInteractionDto,
    user: AuthenticatedUser | null,
  ) {
    // Get contact URL from catalog
    let contactUrl: string;
    try {
      const profile =
        await this.catalogClient.getPublicWorkerProfile(workerProfileId);
      if (!profile) {
        throw new NotFoundException("Worker profile not found");
      }
      if (!profile.isActive) {
        throw new UnprocessableEntityException("Worker profile is not active");
      }

      contactUrl = this.buildContactUrl(dto.channel, profile);
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      this.logger.error(
        `Catalog service unavailable for contact: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        "Catalog service unavailable. Contact information could not be validated.",
      );
    }

    const correlationId = this.correlationService.getCorrelationId();

    const interaction = await this.prisma.$transaction(async (tx) => {
      const i = await tx.interaction.create({
        data: {
          type: "CONTACT",
          channel: dto.channel,
          source: dto.source ?? null,
          workerProfileId,
          touristUserId: user?.sub ?? null,
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "contact.clicked.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-reviews",
          actor: user
            ? ({ userId: user.sub, role: user.role } as any)
            : undefined,
          payload: {
            interactionId: i.id,
            workerProfileId: i.workerProfileId,
            touristUserId: i.touristUserId,
            channel: i.channel,
            source: i.source,
            clickedAt: i.createdAt.toISOString(),
          } as any,
          attempts: 0,
        },
      });

      return i;
    });

    return {
      interactionId: interaction.id,
      workerProfileId: interaction.workerProfileId,
      channel: interaction.channel,
      contactUrl,
      disclaimer:
        "Esta ação registra uma intenção de contato e não representa venda ou transação confirmada.",
      createdAt: interaction.createdAt.toISOString(),
    };
  }

  private buildContactUrl(
    channel: string,
    profile: { whatsapp?: string; phone?: string },
  ): string {
    if (channel === "WHATSAPP") {
      const number = profile.whatsapp;
      if (!number) {
        throw new UnprocessableEntityException(
          "Worker profile does not have WhatsApp configured",
        );
      }
      const sanitized = number.replace(/\D/g, "");
      return `https://wa.me/${sanitized}`;
    }

    if (channel === "PHONE") {
      const number = profile.phone;
      if (!number) {
        throw new UnprocessableEntityException(
          "Worker profile does not have phone configured",
        );
      }
      const sanitized = number.replace(/\D/g, "");
      return `tel:+${sanitized}`;
    }

    throw new UnprocessableEntityException("Invalid contact channel");
  }
}
