import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './controllers/gateway.controller';
import { GatewayService } from './services/gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class AppModule {}
