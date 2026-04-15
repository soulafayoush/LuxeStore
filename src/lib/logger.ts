/**
 * Structured logging utility for production and development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private format(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}${this.context ? ` [${this.context}]` : ''}: ${entry.message}`;
    if (entry.data) {
      return `${base} ${JSON.stringify(entry.data)}`;
    }
    return base;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error) {
    // In development, use console
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context: this.context,
        data,
        error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
      };

      switch (level) {
        case 'debug':
          console.debug(this.format(entry));
          break;
        case 'info':
          console.info(this.format(entry));
          break;
        case 'warn':
          console.warn(this.format(entry));
          break;
        case 'error':
          console.error(this.format(entry));
          break;
      }
    }

    // In production, you'd send to a logging service (e.g., Sentry, Datadog, CloudWatch)
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: Record<string, unknown>) {
    this.log('error', message, data, error);
  }

  child(context: string) {
    return new Logger(context);
  }
}

// Default logger instance
export const logger = new Logger();

// Pre-configured loggers for different modules
export const apiLogger = logger.child('API');
export const authLogger = logger.child('Auth');
export const checkoutLogger = logger.child('Checkout');
export const dbLogger = logger.child('Database');
