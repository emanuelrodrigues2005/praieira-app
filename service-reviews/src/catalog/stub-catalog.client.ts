import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import {
  CatalogClient,
  PublicWorkerProfile,
} from "./catalog-client.interface";

/**
 * TEMPORARY — Stub catalog for development and testing.
 * Returns only the single profile configured via environment variables.
 * Never use in production.
 */
@Injectable()
export class StubCatalogClient implements CatalogClient {
  private readonly logger = new Logger(StubCatalogClient.name);
  private readonly profile: PublicWorkerProfile;

  constructor() {
    this.profile = {
      id:
        process.env.STUB_WORKER_PROFILE_ID ??
        "10000000-0000-4000-8000-000000000001",
      publicationStatus:
        (process.env
          .STUB_WORKER_PROFILE_STATUS as PublicWorkerProfile["publicationStatus"]) ??
        "APPROVED",
      isActive: process.env.STUB_WORKER_PROFILE_ACTIVE !== "false",
      whatsapp: process.env.STUB_WORKER_WHATSAPP ?? "5581999999999",
      phone: process.env.STUB_WORKER_PHONE ?? "5581812345678",
    };

    this.logger.warn(
      "⚠️  StubCatalogClient is active — only for dev/test. Do NOT use in production.",
    );
  }

  async getPublicWorkerProfile(
    id: string,
  ): Promise<PublicWorkerProfile> {
    if (id !== this.profile.id) {
      throw new NotFoundException("Worker profile not found");
    }

    if (this.profile.publicationStatus !== "APPROVED") {
      throw new UnprocessableEntityException(
        "Worker profile is not available for reviews",
      );
    }

    if (!this.profile.isActive) {
      throw new UnprocessableEntityException("Worker profile is not active");
    }

    return this.profile;
  }
}
