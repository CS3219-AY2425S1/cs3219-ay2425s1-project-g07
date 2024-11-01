import { Controller, All, Req, Res, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GatewayService } from '../services/gateway.service';

@Controller('api')
export class GatewayController {
  private readonly questionServiceDomain: string;
  private readonly userServiceDomain: string;
  private readonly matchingWebsocketServiceDomain: string;
  private readonly collabServiceDomain: string;
  private readonly historyServiceDomain: string;

  constructor(
    private readonly gatewayService: GatewayService,
    private configService: ConfigService
  ){
    this.questionServiceDomain = this.configService.get<string>('QUESTION_SERVICE_DOMAIN');
    this.userServiceDomain = this.configService.get<string>('USER_SERVICE_DOMAIN');
    this.matchingWebsocketServiceDomain = this.configService.get<string>('MATCHING_WEBSOCKET_SERVICE_DOMAIN');
    this.collabServiceDomain = this.configService.get<string>('COLLAB_SERVICE_DOMAIN');
    this.historyServiceDomain = this.configService.get<string>('HISTORY_SERVICE_DOMAIN');
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

  // Collab service http endpoints
  @All('create-room')
  async handleCreateRoomRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.collabServiceDomain)
  }
  @All('rooms*')
  async handleRoomRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.collabServiceDomain)
  }

  // History service
  @All('history*')
  async handleHistoryRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.historyServiceDomain)
  }

  // For Collab websocket (not working)
  @All('collab*')
  redirectToBackend(@Res() res: Response) {
    // redirect works on browser (to be tested)
    res.redirect(this.collabServiceDomain);
  }
  // Matching websocket service (not working)
  @All('match*')
  redirectToMatchSocketBackend(@Res() res: Response) {
    res.redirect(this.matchingWebsocketServiceDomain);
  }

}
