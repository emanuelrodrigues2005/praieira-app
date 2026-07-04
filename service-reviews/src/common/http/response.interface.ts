export interface SuccessResponse<T> {
  data: T;
  meta: {
    requestId: string;
  };
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

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}
