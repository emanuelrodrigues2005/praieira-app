export interface User {
  sub: string;
  role: 'TOURIST' | 'WORKER' | 'CURATOR' | 'ADMIN';
  email: string;
  name?: string;
}

export interface WorkerProfile {
  id: string;
  ownerUserId: string;
  name: string;
  description?: string | null;
  category: string;
  phone?: string | null;
  whatsapp?: string | null;
  latitude: number;
  longitude: number;
  beach: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectedReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  category: string;
  latitude: number;
  longitude: number;
  beach: string;
  isAvailable: boolean;
  workerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  workerProfileId: string;
  touristUserId: string;
  rating: number;
  comment?: string | null;
  status: 'PUBLISHED' | 'HIDDEN' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    requestId: string;
  };
}

export interface SuccessResponse<T> {
  data: T;
  meta: {
    requestId: string;
  };
}
