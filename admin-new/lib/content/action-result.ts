export type ContentErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export type ContentActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code: ContentErrorCode;
      fieldErrors?: Record<string, string[]>;
    };
