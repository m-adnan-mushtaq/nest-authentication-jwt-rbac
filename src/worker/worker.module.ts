import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerQueueModule } from './queue/queue.module';
import { MailerModule } from '@nestjs-modules/mailer';
import typeorm from '../config/databaseConfig';
import { DataSource } from 'typeorm';

/**
 * Worker Module - Standalone Process
 * Separate process for processing background jobs
 * Has its own TypeORM and Mailer connections
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      load: [typeorm],
    }),
    // Separate TypeORM connection for worker
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        console.log("Worker DB Connection Initialized:", dataSource.isInitialized);
        return dataSource;
      },
    }),
    // MailerModule for email sending in processors
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST,
          port:
            configService.get<number>('SMTP_PORT') ||
            Number(process.env.SMTP_PORT),
          secure: false,
          auth: {
            user:
              configService.get<string>('SMTP_USERNAME') ||
              process.env.SMTP_USERNAME,
            pass:
              configService.get<string>('SMTP_PASSWORD') ||
              process.env.SMTP_PASSWORD,
          },
        },
        defaults: {
          from: configService.get<string>('SMTP_FROM') || 'noreply@evantas.com',
        },
      }),
    }),
    // Queue module with processors
    WorkerQueueModule,
  ],
  providers: [],
})
export class WorkerModule {}
