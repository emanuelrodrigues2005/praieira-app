import { Injectable, Logger } from "@nestjs/common";
import { CatalogClient, PublicWorkerProfile } from "./catalog-client.interface";

@Injectable()
export class CatalogHttpClient implements CatalogClient {
  private readonly logger = new Logger(CatalogHttpClient.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl = process.env.CATALOG_URL ?? "http://localhost:3002";
    this.timeoutMs = parseInt(
      process.env.CATALOG_REQUEST_TIMEOUT_MS ?? "3000",
      10,
    );
  }

  async getPublicWorkerProfile(id: string): Promise<PublicWorkerProfile> {
    const url = `${this.baseUrl}/catalog/workers/${id}`;
    this.logger.debug(`Fetching worker profile: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("WORKER_PROFILE_NOT_FOUND");
        }
        throw new Error(
          `Catalog returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as PublicWorkerProfile;
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new Error("Catalog request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
