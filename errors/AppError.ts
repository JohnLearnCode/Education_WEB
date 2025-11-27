/**
 * Custom Application Error with status code
 * Base class for all application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid input/validation errors
 */
export class BadRequestError extends AppError {
  constructor(message: string, errorCode: string = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, errorCode: string = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string, errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string, errorCode: string = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

/**
 * 409 Conflict - Resource conflict (duplicate, etc)
 */
export class ConflictError extends AppError {
  constructor(message: string, errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends AppError {
  constructor(message: string, errorCode: string = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, errorCode);
  }
}