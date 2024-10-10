import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  getConfigAccessKeyId(): string {
    return this.configService.get<string>('config.accessKeyId');
  }

  getConfigSecretAccessKey(): string {
    return this.configService.get<string>('config.secretAccessKey');
  }

  getConfigQueueUrl(): string {
    return this.configService.get<string>('config.queueUrl');
  }
}
