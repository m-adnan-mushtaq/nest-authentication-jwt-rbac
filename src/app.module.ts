import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import typeorm from './config/databaseConfig';
import { SharedModule } from './shared/shared.module';
import { IdentityModule } from './modules/identity/identity.module';
import { RoleModule } from './modules/role/role.module';
import { ProductModule } from './modules/product/product.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from './common/constants/common';
config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      load: [typeorm],
    }),
    // Register BullMQ connection and queues (for adding jobs only - NO processors)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB') || 0,
        },
      }),
    }),
    // Register queues for adding jobs (processors are in worker process)
    BullModule.registerQueue({ name: QUEUES.EMAIL }),
    SharedModule, // QueueService is provided here for EmailService
    IdentityModule, // Combines Auth + User + Account
    RoleModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
