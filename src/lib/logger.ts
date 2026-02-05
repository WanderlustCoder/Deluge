type LogLevel = "error" | "warn" | "info";

interface LogMeta {
  userId?: string;
  route?: string;
  [key: string]: unknown;
}

export function logError(context: string, error: unknown, meta?: LogMeta) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const entry = {
    level: "error" as LogLevel,
    timestamp,
    context,
    message,
    ...(stack && { stack }),
    ...meta,
  };

  // In production this would go to a logging service (e.g. Sentry, Datadog)
  console.error(JSON.stringify(entry));
}

export function logWarn(context: string, message: string, meta?: LogMeta) {
  const entry = {
    level: "warn" as LogLevel,
    timestamp: new Date().toISOString(),
    context,
    message,
    ...meta,
  };

  console.warn(JSON.stringify(entry));
}

export function logInfo(context: string, message: string, meta?: LogMeta) {
  const entry = {
    level: "info" as LogLevel,
    timestamp: new Date().toISOString(),
    context,
    message,
    ...meta,
  };

  console.info(JSON.stringify(entry));
}
