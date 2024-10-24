import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MatchingWebSocketGateway } from './matching.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const server = app.getHttpServer();
  const matchingGateway = app.get(MatchingWebSocketGateway);
  matchingGateway.init(server);
  await app.listen(process.env.MATCHING_WEBSOCKET_SERVICE_PORT ?? 8008);
}
bootstrap();
