export interface PublicWorkerProfile {
  id: string;
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

export interface WorkerProfileDetails {
  id: string;
  name: string;
  category: string;
  beach: string;
  coverImage?: string;
}

export interface CatalogClient {
  getPublicWorkerProfile(id: string): Promise<PublicWorkerProfile>;
  getWorkerProfileDetails(id: string): Promise<WorkerProfileDetails>;
}

export const CATALOG_CLIENT = "CATALOG_CLIENT";
