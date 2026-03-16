import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from '../processors/email.processor';
import { QUEUES } from '@/common/constants/common';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    // Register all queues that have processors
    BullModule.registerQueue({ name: QUEUES.EMAIL }),
  ],
  providers: [
    // Register all processors
    EmailProcessor,
  ],
})
export class WorkerQueueModule {}
