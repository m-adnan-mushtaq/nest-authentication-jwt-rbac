import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger-setup';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { isDev, port, globalPrefix } from './common/constants/env';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
  });

  app.enableCors({ origin: '*' });

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: false,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  // logger interceptor for debugging and logging in dev mode

  app.useGlobalInterceptors(new LoggingInterceptor());

  // enableShutdownHooks for graceful shutdown on sigterm signal
  if (!isDev) {
    app.enableShutdownHooks();
  }

  // swagger setup
  if (isDev) setupSwagger(app);

  // Use Pino logger
  app.useLogger(app.get(Logger));

  await app.listen(port, '0.0.0.0', async () => {
    const url = await app.getUrl();
    const logger = app.get(Logger);

    logger.log(`Server is running at: ${url}/api on port ${port}`);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  });
}

bootstrap();
