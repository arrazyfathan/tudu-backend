export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return {
    status: "success",
    message,
    data,
  };
}

export function errorResponse(message: string, errors?: Record<string, string>): ApiResponse<null> {
  return {
    status: "error",
    message,
    errors,
  };
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Record<string, string>; // optional for error responses
}
