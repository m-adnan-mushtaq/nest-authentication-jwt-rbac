import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

@Module({})
export class LoggerModule {
  static forRoot() {
    return {
      global: true,
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const isDev = configService.get('NODE_ENV') !== 'production';

            return {
              pinoHttp: {
                level: configService.get('app.logger.level', 'info'),
                transport: isDev
                  ? {
                      target: 'pino-pretty',
                      options: {
                        colorize: true,
                        levelFirst: true,
                        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                        ignore: 'pid,hostname',
                        singleLine: false,
                        messageFormat: '{msg}',
                      },
                    }
                  : undefined,
                formatters: {
                  level: (label: string) => ({ level: label }),
                },
                customProps: () => ({
                  context: 'HTTP',
                }),
                autoLogging: true,
                serializers: {
                  req: (req) => ({
                    method: req.method,
                    url: req.url,
                  }),
                  res: (res) => ({
                    statusCode: res.statusCode,
                  }),
                },
              },
            };
          },
        }),
      ],
      providers: [LoggerService],
      exports: [PinoLoggerModule, LoggerService],
    };
  }
}
