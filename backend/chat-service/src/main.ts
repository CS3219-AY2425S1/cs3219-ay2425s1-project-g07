import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChatGateway } from './chat.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const server = app.getHttpServer();
  const chatGateway = app.get(ChatGateway);
  chatGateway.setServer(server);
  await app.listen(8009);
}
bootstrap();
