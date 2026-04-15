/**
 * Standardized API error class with HTTP status codes
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getStatusCodeDefault(statusCode);
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getStatusCodeDefault(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return map[status] || 'INTERNAL_ERROR';
  }

  static badRequest(message: string) {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Authentication required') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Access denied') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT');
  }

  static validation(message: string) {
    return new AppError(message, 422, 'VALIDATION_ERROR');
  }

  static tooManyRequests(message: string = 'Too many requests. Please try again later.') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/**
 * Format a consistent API error response
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };
}

/**
 * Try-catch wrapper for API route handlers
 */
export function withErrorHandler(
  handler: (...args: any[]) => Promise<unknown>,
) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const { NextResponse } = await import('next/server');
      const formatted = formatErrorResponse(error);
      const statusCode = formatted.error.statusCode;
      return NextResponse.json(formatted, { status: statusCode });
    }
  };
}
