import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'trace',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @InjectPinoLogger(LoggerService.name)
    private readonly logger: PinoLogger,
  ) {}

  setContext(context: string): void {
    this.logger.setContext(context);
  }

  verbose(message: any, context?: string): void {
    if (context) {
      this.logger.trace({ context }, message);
    } else {
      this.logger.trace(message);
    }
  }

  debug(message: any, context?: string): void {
    if (context) {
      this.logger.debug({ context }, message);
    } else {
      this.logger.debug(message);
    }
  }

  log(message: any, context?: string): void {
    if (context) {
      this.logger.info({ context }, message);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: any, context?: string): void {
    if (context) {
      this.logger.warn({ context }, message);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: any, stack?: string, context?: string): void {
    const errorObj = stack ? { stack, context } : { context };
    this.logger.error(errorObj, message);
  }

  fatal(message: any, context?: string): void {
    if (context) {
      this.logger.fatal({ context }, message);
    } else {
      this.logger.fatal(message);
    }
  }
}
