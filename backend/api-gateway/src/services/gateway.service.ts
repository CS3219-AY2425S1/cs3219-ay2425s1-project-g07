import { Injectable, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class GatewayService {

  async handleRedirectRequest(@Req() req: Request, @Res() res: Response, serviceDomain: string): Promise<void> {
    const url = `${serviceDomain}${req.originalUrl.replace("/api", "")}`;
    console.log(url)
    console.log(req.method)
    // NOTE: axios headers can't just take the req.headers as it is
    const headers = getHeaders(req.headers)
    try {
      const response = await axios({
        method: req.method,
        url: url,
        headers: headers,
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

function getHeaders(headers: IncomingHttpHeaders) {
  const axiosHeader = {}
  for (let key in headers) {
    const parts = key.split('-');
    const capitalizedParts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
    const newKey = capitalizedParts.join('');
    axiosHeader[newKey] = headers[key];
  }
  return axiosHeader
}