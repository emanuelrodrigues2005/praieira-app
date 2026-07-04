import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import {
  CatalogClient,
  PublicWorkerProfile,
  WorkerProfileDetails,
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
  private readonly details: WorkerProfileDetails;

  constructor() {
    this.profile = {
      id:
        process.env.STUB_WORKER_PROFILE_ID ??
        "10000000-0000-4000-8000-000000000001",
      name:
        process.env.STUB_WORKER_NAME ??
        "Estabelecimento Teste",
      status:
        (process.env
          .STUB_WORKER_PROFILE_STATUS as PublicWorkerProfile["status"]) ??
        "APPROVED",
      isActive: process.env.STUB_WORKER_PROFILE_ACTIVE !== "false",
      whatsapp: process.env.STUB_WORKER_WHATSAPP ?? "5581999999999",
      phone: process.env.STUB_WORKER_PHONE ?? "5581812345678",
    };

    this.details = {
      id: this.profile.id,
      name: process.env.STUB_WORKER_PROFILE_NAME ?? "Barraca do João",
      category: process.env.STUB_WORKER_PROFILE_CATEGORY ?? "Alimentação",
      beach: process.env.STUB_WORKER_PROFILE_BEACH ?? "Porto de Galinhas",
      coverImage: process.env.STUB_WORKER_PROFILE_COVER_IMAGE ?? undefined,
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

    if (this.profile.status !== "APPROVED") {
      throw new UnprocessableEntityException(
        "Worker profile is not available for reviews",
      );
    }

    if (this.profile.isActive === false) {
      throw new UnprocessableEntityException("Worker profile is not active");
    }

    return this.profile;
  }

  async getWorkerProfileDetails(
    id: string,
  ): Promise<WorkerProfileDetails> {
    if (id !== this.details.id) {
      throw new NotFoundException("Worker profile not found");
    }

    return this.details;
  }
}
