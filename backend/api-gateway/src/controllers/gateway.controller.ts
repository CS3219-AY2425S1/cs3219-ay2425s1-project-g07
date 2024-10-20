import { Controller, All, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GatewayService } from '../services/gateway.service';

@Controller('api')
export class GatewayController {
  private readonly questionServiceDomain: string;
  private readonly userServiceDomain: string;
  constructor(
    private readonly gatewayService: GatewayService,
    private configService: ConfigService
  ){
    this.questionServiceDomain = this.configService.get<string>('QUESTION_SERVICE_DOMAIN');
    this.userServiceDomain = this.configService.get<string>('USER_SERVICE_DOMAIN');
  }

  @All('/')
  helloGateway(@Req() req: Request, @Res() res: Response) {
    res.status(200).json({ message: "Hello!" })
  }

  // Need auth in the future (with secret key)
  @All('question*')
  async handleQuestionRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.questionServiceDomain)
  }

  // authenticated alrdy
  @All('users*')
  async handleUserRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.gatewayService.handleRedirectRequest(req, res, this.userServiceDomain)
  }
}
