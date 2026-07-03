import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  CatalogClient,
  PublicWorkerProfile,
} from "./catalog-client.interface";

@Injectable()
export class CatalogHttpClient
  implements CatalogClient
{
  private readonly logger =
    new Logger(CatalogHttpClient.name);

  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl =
      process.env.CATALOG_URL ??
      "http://localhost:3002";

    this.timeoutMs = parseInt(
      process.env
        .CATALOG_REQUEST_TIMEOUT_MS ??
        "3000",
      10,
    );
  }

  async getPublicWorkerProfile(
    id: string,
  ): Promise<PublicWorkerProfile> {
    const url =
      `${this.baseUrl}/catalog/workers/${id}`;

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs,
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        throw new NotFoundException(
          "Worker profile not found",
        );
      }

      if (!response.ok) {
        throw new ServiceUnavailableException(
          `Catalog returned status ${response.status}`,
        );
      }

      const body = (await response.json()) as
        | PublicWorkerProfile
        | {
            data: PublicWorkerProfile;
          };

      const profile =
        "data" in body
          ? body.data
          : body;

      if (
        !profile ||
        typeof profile.id !== "string"
      ) {
        throw new ServiceUnavailableException(
          "Invalid response from Catalog",
        );
      }

      return profile;
    } catch (error: any) {
      if (
        error instanceof
          NotFoundException ||
        error instanceof
          ServiceUnavailableException
      ) {
        throw error;
      }

      if (error?.name === "AbortError") {
        throw new ServiceUnavailableException(
          "Catalog request timed out",
        );
      }

      this.logger.error(
        `Catalog request failed: ${error.message}`,
      );

      throw new ServiceUnavailableException(
        "Catalog service unavailable",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
