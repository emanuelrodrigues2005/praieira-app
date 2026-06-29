export interface PublicWorkerProfile {
  id: string;
  publicationStatus: "APPROVED";
  isActive: boolean;
  whatsapp?: string;
  phone?: string;
}

export interface CatalogClient {
  getPublicWorkerProfile(id: string): Promise<PublicWorkerProfile>;
}

export const CATALOG_CLIENT = "CATALOG_CLIENT";
