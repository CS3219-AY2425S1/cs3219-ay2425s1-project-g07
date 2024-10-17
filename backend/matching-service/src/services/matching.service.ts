import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { QuestionComplexity, QuestionTopic, MatchRequestDto } from 'src/dto/request.dto';

export enum MatchStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
}

type UserEntry = {
  status: MatchStatus;
  topic: string;
  matchedWithUserId: string;
}

enum MessageAction {
  REQUEST_MATCH = 'REQUEST_MATCH',
  CANCEL_MATCH = 'CANCEL_MATCH'
}

type Message = {
  action: MessageAction;
  userId: string;
  timestamp: number;
}

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly kafkaBrokerUri: string;
  private readonly consumerGroupId: string;
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private userPool: { [userId: string]: UserEntry } = {}; // In-memory store for user pool

  constructor(private configService: ConfigService) {
    this.kafkaBrokerUri = this.getKafkaBrokerUri();
    this.consumerGroupId = this.getConsumerGroupId();

    this.kafka = new Kafka({
      clientId: 'matching-service',
      brokers: [this.kafkaBrokerUri],
    });

    // allowAutoTopicCreation: true // it is true by default
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: this.consumerGroupId });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.subscribeToTopics();
    // Consume message loop
    await this.consumeMessages();
  }

  getKafkaBrokerUri(): string {
    return this.configService.get<string>('config.kafkaBrokerUri');
  }

  getConsumerGroupId(): string {
    return this.configService.get<string>('config.consumerGroupId');
  }

  async testReceiveLoop() {
    await this.consumer.subscribe({ topics: ['test-topic'], fromBeginning: false });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Message received:");
        console.log({
          topic: topic,
          partition: partition,
          value: message.value.toString(),
        });
        const offset = parseInt(message.offset)
        console.log(`Committing offset ${offset + 1}`);
        await this.consumer.commitOffsets([
          { topic: topic, partition: partition, offset: (offset + 1).toString() }
        ]);
      }
    });
  }
  
  // purely for testing
  async sendTestMessage(msg: string) {
    await this.producer.send({
      topic: 'test-topic',
      messages: [{ value: msg }],
    });
  }

  async subscribeToTopics() {
    const allTopics = []
    for (const complexity of Object.values(QuestionComplexity)) {
      for (const topic of Object.values(QuestionTopic)) {
      allTopics.push(`${complexity}-${topic}`);
      }
    }
    await this.consumer.subscribe({ topics: allTopics, fromBeginning: false });
  }

  async addMatchRequest(req: MatchRequestDto) {
    var kafkaTopic = `${req.difficulty}-${req.topic}`;
    console.log("Topic is: ", kafkaTopic);
    // Add message
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{value: JSON.stringify({
        action: MessageAction.REQUEST_MATCH,
        userId: req.userId,
        timestamp: req.timestamp
      })}]
    });
  }

  async addCancelRequest(req: MatchRequestDto) {
    var kafkaTopic = `${req.difficulty}-${req.topic}`;
    console.log("Topic is: ", kafkaTopic);
    // Add message
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{value: JSON.stringify({
        action: MessageAction.CANCEL_MATCH,
        userId: req.userId,
        timestamp: req.timestamp
      })}]
    });
  }

  private async handleMatchRequest(topic: string, matchRequest: Message) {
      const requesterUserId = matchRequest.userId;

      // Check if this is a duplicate request
      if (this.userPool[requesterUserId]) {
        console.log(`Duplicate match request received for ${requesterUserId}`);
        return;
      }

      console.log(`Received match request: ${matchRequest} on topic: ${topic}`);

      // Check if a matching user exists
      const existingMatch = Object.keys(this.userPool).find(
        (userId) => this.userPool[userId].topic === topic // Find a user with the same topic
          && this.userPool[userId].status == MatchStatus.PENDING // Ensure the user is waiting for a match
          && userId !== requesterUserId // Ensure the user is not the requester
      );

      if (existingMatch) {
        // Pair the users if match is found
        this.userPool[existingMatch].matchedWithUserId = requesterUserId;
        this.userPool[existingMatch].status = MatchStatus.MATCHED;
        this.userPool[requesterUserId] = {
          status: MatchStatus.MATCHED,
          topic: topic,
          matchedWithUserId: existingMatch,
        };
        console.log(`Match found for ${requesterUserId} and ${existingMatch} in topic: ${topic}`);
      } else {
        this.userPool[requesterUserId] = {
          status: MatchStatus.PENDING,
          topic: topic,
          matchedWithUserId: '',
        }
      }
  }

  private async handleCancelRequest(topic: string, cancelRequest: Message) {
    const requesterUserId = cancelRequest.userId;

    if (!this.userPool[requesterUserId]) {
      console.log(`Cannot cancel. No match request found for ${requesterUserId}`);
      return;
    }

    console.log(`Received cancel request: ${cancelRequest} on topic: ${topic}`);

    if (this.userPool[requesterUserId].status === MatchStatus.MATCHED) {
      console.log(`Cannot cancel. Match already found for ${requesterUserId}`);
      return;
    } else {
      this.userPool[requesterUserId].status = MatchStatus.CANCELLED;
      this.userPool[requesterUserId].matchedWithUserId = '';
      console.log(`Match request cancelled for ${requesterUserId} in topic: ${topic}`);
    }
  }

  private async consumeMessages() {
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const messageString = message.value.toString();
        const messageBody: Message = JSON.parse(messageString);

        if (messageBody.action === MessageAction.REQUEST_MATCH) {
          this.handleMatchRequest(topic, messageBody);
        } else if (messageBody.action === MessageAction.CANCEL_MATCH) {
          this.handleCancelRequest(topic, messageBody);
        }
      },
    });
  }

  removeFromUserPool(userId: string) {
    delete this.userPool[userId];
  }

  pollForMatch(userId: string): UserEntry | null {
    return this.userPool[userId] || null;
  }

}
