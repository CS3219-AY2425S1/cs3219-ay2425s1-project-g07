import { Injectable, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Injectable()
export class GatewayService {

  async handleRedirectRequest(@Req() req: Request, @Res() res: Response, serviceDomain: string): Promise<void> {
    const url = `${serviceDomain}${req.originalUrl.replace("/api", "")}`;
    console.log(url)
    try {
      const response = await axios({
        method: req.method,
        url: url,
        headers: req.headers,
        data: req.body,
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json(error.response?.data || { 
        message: 'Service Unreachable Error',
        HTTP_METHOD: req.method,
        Target: url,
        Path: req.path
      });
    }
  }
}