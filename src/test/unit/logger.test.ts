import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
  });

  it('should create a child logger with context', () => {
    const child = logger.child('TestContext');
    expect(child).toBeDefined();
  });

  it('should log info messages', () => {
    logger.info('test message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('test error', new Error('test'));
    expect(console.error).toHaveBeenCalled();
  });

  it('should log warn messages', () => {
    logger.warn('test warning');
    expect(console.warn).toHaveBeenCalled();
  });
});
