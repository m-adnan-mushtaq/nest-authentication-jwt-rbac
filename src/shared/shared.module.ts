import { Global, Module, Logger } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';
import { EmailModule } from './email/email.module';
import { CacheModule } from './cache/cache.module';
import { OtpModule } from './otp/otp.module';
import { QueueService } from './queue/queue.service';
import { AuditLogModule } from './audit-log/audit-log.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@/common/constants/common';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        const logger = new Logger('database-connection');
        logger.log('database-connection 👉' + '-' + dataSource.isInitialized);
        logger.log('database-name 👉' + '-' + process.env.DATABASE_NAME);
        return dataSource;
      },
    }),

    LoggerModule.forRoot(),
    CacheModule,
    TokenModule,
    EmailModule,
    OtpModule,
    AuditLogModule,
    BullModule.registerQueue({
      name:QUEUES.EMAIL
    })
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    QueueService, // Provide QueueService for adding jobs (requires BullModule from AppModule)
  ],
  exports: [TokenModule, EmailModule, CacheModule, OtpModule, QueueService],
})
export class SharedModule {}
