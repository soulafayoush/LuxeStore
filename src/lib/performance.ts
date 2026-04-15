/**
 * Performance monitoring utilities
 * In production, integrate with a real APM (e.g., Vercel Analytics, Datadog)
 */

export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  static end(label: string): number | null {
    const start = this.marks.get(label);
    if (!start) return null;
    const duration = performance.now() - start;
    this.marks.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
