import { Controller, All, Req, Res, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GatewayService } from '../services/gateway.service';

@Controller('api')
export class GatewayController {
  private readonly questionServiceDomain: string;
  private readonly userServiceDomain: string;
  private readonly matchingServiceDomain: string;

  constructor(
    private readonly gatewayService: GatewayService,
    private configService: ConfigService
  ){
    this.questionServiceDomain = this.configService.get<string>('QUESTION_SERVICE_DOMAIN');
    this.userServiceDomain = this.configService.get<string>('USER_SERVICE_DOMAIN');
    this.matchingServiceDomain = this.configService.get<string>('MATCHING_SERVICE_DOMAIN');
  }

  @All('/')
  helloGateway(@Req() req: Request, @Res() res: Response) {
    res.status(200).json({ message: "Hello!" })
  }

  // Question service
  @All('question*')
  async handleQuestionRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.questionServiceDomain)
  }

  // User service
  @All('users*')
  async handleUserRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.userServiceDomain)
  }
  @All('auth*') // somehow cannot stack (or reuse)
  async handleAuthRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.userServiceDomain)
  }

  // Matching service (can't stack...)
  @All('match*')
  async handleMatchingRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.matchingServiceDomain)
  }
  @Post('cancel-match*')
  async handleCancelMatchRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.matchingServiceDomain)
  }
  @Get('check-match*')
  async handleCheckMatchRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.matchingServiceDomain)
  }

}
