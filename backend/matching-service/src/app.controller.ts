import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { 
  SQSClient, 
  ReceiveMessageCommand, 
  SendMessageCommand, 
  ReceiveMessageCommandOutput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';

@Controller()
export class AppController {
  private readonly queueUrl: string;
  private readonly sqsClient: SQSClient;

  constructor(private readonly appService: AppService) {
    this.queueUrl = this.appService.getConfigQueueUrl();

    const configObject = {
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: this.appService.getConfigAccessKeyId(),
        secretAccessKey: this.appService.getConfigSecretAccessKey()
      },
    };

    this.sqsClient = new SQSClient(configObject);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send-message')
  async sendMessageToQueue(@Body('message') body: string): Promise<SendMessageCommandOutput> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: body,
        MessageAttributes: {},
      });
      const result = await this.sqsClient.send(command);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  @Get('poll-messages')
  async pollMessagesFromQueue(): Promise<ReceiveMessageCommandOutput> {
    try {
      const command = new ReceiveMessageCommand({
        MaxNumberOfMessages: 1,
        QueueUrl: this.queueUrl,
        WaitTimeSeconds: 10,
      });
      const result = await this.sqsClient.send(command);
      console.log(result);
      return result; 
    } catch (err) {
      console.error(err);
    }
  }
}
