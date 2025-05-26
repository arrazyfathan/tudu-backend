export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return {
    status: "success",
    message,
    data,
  };
}

export function successResponsePaging<T, P>(
  message: string,
  data: T,
  paging: P,
): ApiResponsePaging<T, P> {
  return {
    status: "success",
    message,
    data,
    paging,
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

export interface ApiResponsePaging<T, P> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Record<string, string>;
  paging: P;
}

export type CommonResponse = {
  message: string;
};
