export interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: string;
  result?: T;
  errorResponse?: ErrorResponse;
}

export interface ErrorResponse {
  path: string;
  errors: string[]
}
