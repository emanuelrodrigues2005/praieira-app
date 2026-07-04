export interface PublicWorkerProfile {
  id: string;
  name: string;
  publicationStatus:
    | "DRAFT"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED";
  isActive: boolean;
  whatsapp?: string;
  phone?: string;
}

export interface CatalogClient {
  getPublicWorkerProfile(id: string): Promise<PublicWorkerProfile>;
}

export const CATALOG_CLIENT = "CATALOG_CLIENT";
