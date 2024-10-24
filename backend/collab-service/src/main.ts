import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CollabGateway } from './collab.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const server = app.getHttpServer();
  const collabGateway = app.get(CollabGateway);
  collabGateway.setServer(server);
  await app.listen(8007);
}
bootstrap();
