// Typed domain errors. Services throw AppError; the global error plugin maps
// it to a fail() envelope with the HTTP status resolved from appErrorMeta.
export const appErrorMeta = {
  BAD_REQUEST: { status: 400, message: "Bad request" },
  PROFILE_ALREADY_EXISTS: { status: 409, message: "Profile already exists" },
  CONFLICT: { status: 409, message: "Conflict" },
  NOT_FOUND: { status: 404, message: "Not found" },
  FORBIDDEN: { status: 403, message: "Forbidden" },
  INTERNAL: { status: 500, message: "Internal server error" },
} as const;

export type ErrorCode = keyof typeof appErrorMeta;

export interface AppErrorOptions {
  code: ErrorCode;
  message?: string;
  issues?: unknown[];
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly issues?: unknown[];

  constructor({ code, message, issues }: AppErrorOptions) {
    super(message ?? appErrorMeta[code].message);
    this.name = "AppError";
    this.code = code;
    this.status = appErrorMeta[code].status;
    this.issues = issues;
  }
}

export function appError(options: AppErrorOptions): AppError {
  return new AppError(options);
}
