import { Module } from "@nestjs/common";
import { CatalogHttpClient } from "./catalog-http.client";
import { CATALOG_CLIENT } from "./catalog-client.interface";

@Module({
  providers: [
    CatalogHttpClient,
    { provide: CATALOG_CLIENT, useClass: CatalogHttpClient },
  ],
  exports: [CATALOG_CLIENT],
})
export class CatalogModule {}
