// Centralized logging helpers for the admin portal

export interface LogContext {
  [key: string]: unknown;
}

export function logInfo(message: string, context?: LogContext): void {
  console.log(`[INFO] ${message}`, context || {});
}

export function logWarn(message: string, context?: LogContext): void {
  console.warn(`[WARN] ${message}`, context || {});
}

export function logError(message: string, error: Error, context?: LogContext): void {
  console.error(`[ERROR] ${message}`, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[DEBUG] ${message}`, context || {});
  }
}
