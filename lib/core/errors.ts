export class CacheError extends Error {
  code: string;
  status: number;
  details: Record<string, unknown> | undefined;

  constructor(
    code: string,
    message: string,
    status = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "CacheError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isCacheError(error: unknown): error is CacheError {
  return error instanceof CacheError;
}

export function createValidationError(message: string) {
  return new CacheError("validation_error", message, 400);
}

export function createNotFoundError(message: string) {
  return new CacheError("not_found", message, 404);
}

export function createPermissionError(message: string) {
  return new CacheError("permission_denied", message, 403);
}
