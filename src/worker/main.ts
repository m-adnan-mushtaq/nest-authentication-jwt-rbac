import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

/**
 * Standalone Worker Process
 * Runs as a separate process to handle background jobs
 *
 * Usage:
 *   npm run worker:start
 *   npm run worker:dev
 */
async function bootstrap() {
  const logger = new Logger('Worker');

  try {
    logger.log('🚀 Starting BullMQ Worker...');

    // Create application context (not HTTP server)
    const app = await NestFactory.createApplicationContext(WorkerModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    logger.log('✅ Worker initialized successfully');
    logger.log('📧 Email queue processor is ready');
    logger.log('💾 Database connection established');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    // Keep the process alive
    logger.log('⏳ Worker is running and processing jobs...');
  } catch (error) {
    logger.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

bootstrap();
