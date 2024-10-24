import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollabController } from './collab.controller';
import { CollabService } from './services/collab.service';
import { CollabGateway } from './collab.gateway';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: "../../.env"
    })
  ],
  controllers: [CollabController],
  providers: [CollabGateway, CollabService]
})
export class AppModule {}
