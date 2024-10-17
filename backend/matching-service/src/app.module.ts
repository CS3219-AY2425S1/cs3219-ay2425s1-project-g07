import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MatchingService } from './services/matching.service';
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
  controllers: [AppController],
  providers: [MatchingService],
})
export class AppModule {
  constructor() {
    const requiredVars = [
      'KAFKA_BROKER_URI',
      'MATCHING_SERVICE_CONSUMER_GROUP_ID'
    ];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }
}
