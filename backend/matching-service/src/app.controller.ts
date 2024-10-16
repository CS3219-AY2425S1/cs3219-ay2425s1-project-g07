import { Controller, Get, Post, Body, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@nestjs/swagger';
import { MatchingService, MatchStatus } from './services/matching.service';
import { MatchRequestDto, MatchResponse } from './dto/request.dto';

@Controller()
export class AppController {
  
  constructor(private readonly matchService: MatchingService) {}

  @ApiResponse({ status: 200 })
  @Get('test-send')
  async testSend() {
    await this.matchService.sendTestMessage('Hello KafkaJS user!');
    return 'Message sent!';
  }

  @ApiResponse({ status: 200 })
  @Post('match')
  @UsePipes(new ValidationPipe({ transform: true }))
  async match(@Body() body: MatchRequestDto): Promise<MatchResponse> {
    try {
      await this.matchService.addMatchRequest(body);

      return {
        message: `Match request received for ${body.userId} on time: ${body.timestamp}`,
      };
    } catch (error) {
      console.error('Error processing match request:', error);
      return {
        message: `Match request received for ${body.userId} on time: ${body.timestamp}`,
        error: error,
      };
    }
  }

  @ApiResponse({ status: 200 })
  @Post('cancel-match')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelMatch(@Body() body: MatchRequestDto): Promise<MatchResponse> {
    try {
      await this.matchService.addCancelRequest(body);

      return {
        message: `Match request cancelled for ${body.userId} on time: ${body.timestamp}`,
      };
    } catch (error) {
      console.error('Error processing cancel match request:', error);
      return {
        message: `Match request cancelled for ${body.userId} on time: ${body.timestamp}`,
        error: error,
      };
    }
  }

  @ApiResponse({ status: 200 })
  @Get('check-match')
  async checkMatch(@Query('userId') userId: string, @Res() res: Response) {
    const match = this.matchService.pollForMatch(userId);
    if (match && match.status === MatchStatus.MATCHED) {
      // Once a successful match request is found, remove the user from the pool
      this.matchService.removeFromUserPool(userId);
      return res.status(200).json(match);
    } else if (match && match.status === MatchStatus.CANCELLED) {
      // Once a match request is cancelled, remove the user from the pool
      this.matchService.removeFromUserPool(userId);
      return res.status(202).json({ message: 'Match request cancelled', topic: match.topic });
    } else if (match) {
      return res.status(202).json({ message: 'No match found yet', topic: match.topic });
    } else {
      return res.status(404).json({ message: 'No match requests found for this user.' });
    }
  }

}
