export type AuthActionErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

export type ActionFieldErrors = Record<string, string[]>;

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  fieldErrors?: ActionFieldErrors;
  code?: AuthActionErrorCode;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export interface SafeUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export type LoginActionData = {
  user: SafeUser;
};

export type RegisterActionData = {
  user: SafeUser;
};

export type LoginActionResult = ActionResult<LoginActionData>;
export type RegisterActionResult = ActionResult<RegisterActionData>;
