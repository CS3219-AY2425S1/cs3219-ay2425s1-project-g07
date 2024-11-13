import { Module } from '@nestjs/common';
import { MatchingWebSocketController } from './app.controller';
import { MatchingWebSocketService } from './app.service';
import { MatchingWebSocketGateway } from './matching.gateway';
import { ConfigModule } from '@nestjs/config';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: "../../.env"
    })
  ],
  controllers: [MatchingWebSocketController],
  providers: [MatchingWebSocketGateway, MatchingWebSocketService],
})
export class AppModule {
  constructor() {
    const requiredVars = [
      'KAFKA_BROKER_URI',
      'MATCHING_WEBSOCKET_SERVICE_CONSUMER_GROUP_ID'
    ];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }
}
