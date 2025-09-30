// Structured Logger Utility
// REC-002: Replace console.error with structured logging

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error && {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      }),
    }

    console.error(this.formatMessage('error', message, errorContext))

    // In production, you could send to external service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: window.Sentry?.captureException(error);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logError = (
  message: string,
  error?: Error | any,
  context?: LogContext
) => logger.error(message, error, context)

export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context)

export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context)

export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context)
