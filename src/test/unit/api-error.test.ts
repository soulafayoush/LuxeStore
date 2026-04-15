import { describe, it, expect } from 'vitest';
import { AppError, formatErrorResponse } from '@/lib/api-error';

describe('AppError', () => {
  it('should create an error with default values', () => {
    const error = new AppError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('should create a badRequest error', () => {
    const error = AppError.badRequest('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('should create an unauthorized error', () => {
    const error = AppError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create a notFound error', () => {
    const error = AppError.notFound('Product not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create a validation error', () => {
    const error = AppError.validation('Email is invalid');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should create a tooManyRequests error', () => {
    const error = AppError.tooManyRequests();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('TOO_MANY_REQUESTS');
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError correctly', () => {
    const error = AppError.notFound('Product not found');
    const formatted = formatErrorResponse(error);
    expect(formatted.success).toBe(false);
    expect(formatted.error?.statusCode).toBe(404);
    expect(formatted.error?.code).toBe('NOT_FOUND');
  });

  it('should format generic Error correctly', () => {
    const error = new Error('Generic error');
    const formatted = formatErrorResponse(error);
    expect(formatted.success).toBe(false);
    expect(formatted.error?.code).toBe('INTERNAL_ERROR');
  });

  it('should handle unknown errors', () => {
    const formatted = formatErrorResponse('string error');
    expect(formatted.success).toBe(false);
    expect(formatted.error?.code).toBe('INTERNAL_ERROR');
  });
});
