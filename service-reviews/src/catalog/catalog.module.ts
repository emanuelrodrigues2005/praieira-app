import { Module, Logger } from "@nestjs/common";
import { CatalogHttpClient } from "./catalog-http.client";
import { StubCatalogClient } from "./stub-catalog.client";
import { CATALOG_CLIENT } from "./catalog-client.interface";

const logger = new Logger("CatalogModule");

function createCatalogClient() {
  const mode = process.env.CATALOG_MODE ?? "stub";

  // Block stub in production
  if (mode === "stub" && process.env.NODE_ENV === "production") {
    throw new Error(
      "CATALOG_MODE=stub is not allowed in production. Set CATALOG_MODE=http.",
    );
  }

  if (mode === "stub") {
    logger.warn("Using StubCatalogClient (dev/test only)");
    return new StubCatalogClient();
  }

  if (mode === "http") {
    logger.log("Using CatalogHttpClient (real integration)");
    return new CatalogHttpClient();
  }

  throw new Error(
    `Invalid CATALOG_MODE: "${mode}". Must be "stub" or "http".`,
  );
}

@Module({
  providers: [
    {
      provide: CATALOG_CLIENT,
      useFactory: createCatalogClient,
    },
  ],
  exports: [CATALOG_CLIENT],
})
export class CatalogModule {}
