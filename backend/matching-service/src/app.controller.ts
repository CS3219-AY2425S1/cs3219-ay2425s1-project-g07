import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './services/matching.service';

@Controller()
export class AppController {
  
  constructor(private readonly matchService: MatchingService) {}

  @ApiResponse({ status: 200 })
  @Get('test-send')
  async testSend() {
    await this.matchService.sendTestMessage('Hello KafkaJS user!');
    return 'Message sent!';
  }
}
