/**
 * Custom Error Classes
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code: string = "NOT_FOUND") {
    super(message, 404, code, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", code: string = "UNAUTHORIZED") {
    super(message, 401, code, true);
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;
  constructor(
    message: string = "Validation failed",
    fields?: Record<string, string>,
    code: string = "VALIDATION_ERROR"
  ) {
    super(message, 400, code, true);
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", code: string = "CONFLICT") {
    super(message, 409, code, true);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;
  constructor(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    code: string = "RATE_LIMITED"
  ) {
    super(message, 429, code, true);
    this.retryAfter = retryAfter;
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", code: string = "FORBIDDEN") {
    super(message, 403, code, true);
  }
}
