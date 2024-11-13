import { Controller, Get } from '@nestjs/common';
import { MatchingWebSocketService } from './app.service';

@Controller()
export class MatchingWebSocketController {
  constructor(private readonly appService: MatchingWebSocketService) {}

  @Get()
  getHello(): string {
    return "Hello";
  }
}
