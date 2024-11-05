import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { createClient, RedisClientType } from 'redis';
import axios from 'axios';
import {
  MatchFoundResponse,
  MatchRequest,
  MatchRequestResponse,
} from './dto/request.dto';

enum MessageAction {
  REQUEST_MATCH = 'REQUEST_MATCH',
  CANCEL_MATCH = 'CANCEL_MATCH'
}

type MatchMessage = {
  userId1: string;
  userId2: string;
  matchedTopic: string;
  matchedRoom: string;
}

type MatchTimeoutMessage = {
  userId: string;
  timestamp: number;
}

@Injectable()
export class MatchingWebSocketService implements OnModuleInit {
  private readonly REQUEST_TIMEOUT_MS = 30000; // epoch time 30s
  private readonly kafkaBrokerUri: string;
  private readonly consumerGroupId: string;
  private readonly redisDomain: string;
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private readonly redisClient: RedisClientType;

  private readonly socketIdReqMap: {
    [socketId: string]: {
      kafkaTopic: string;
      userId: string;
      timestamp: number
    }
  } = {};

  private readonly userSocketMap: {
    [userId: string]: {
      socketId: string,
      onMatch: (matchFound: MatchFoundResponse) => void,
      onMatchTimeout: () => void,
    }
  } = {};

  constructor(private configService: ConfigService) {
    this.kafkaBrokerUri = this.getKafkaBrokerUri();
    this.consumerGroupId = this.getConsumerGroupId();
    this.redisDomain = this.getRedisDomain();
    this.kafka = new Kafka({
      clientId: 'matching-websocket-service',
      brokers: [this.kafkaBrokerUri],
    });

    // allowAutoTopicCreation: true // it is true by default
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: this.consumerGroupId });

    this.redisClient = createClient({
      url: this.redisDomain
    });
    this.redisClient.on('error', (err) => {
      console.log(`Redis error: ${err}`);
    }).connect().then(() => console.log('Connected to Redis'));
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    await this.subscribeToTopics();
    // Consume message loop
    this.consumeMessages();
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({ topics: ['matches', 'match-timeouts'] });
  }

  private consumeMessages() {
    this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const messageString = message.value.toString();
        const messageBody = JSON.parse(messageString);

        console.log(`Received message from topic ${topic}:`, messageBody);

        if (topic === 'match-timeouts') {
          this.handleMatchTimeoutMessage(messageBody);
        } else if (topic === 'matches') {
          this.handleMatchMessage(messageBody);
        }
      },
    })
  }

  private handleMatchTimeoutMessage(messageBody: MatchTimeoutMessage) {
    // Notify user of timeout
    if (messageBody.userId in this.userSocketMap) {
      const entry = this.userSocketMap[messageBody.userId];
      delete this.userSocketMap[messageBody.userId];
      delete this.socketIdReqMap[entry.socketId];
      this.removeUserFromMatch(messageBody.userId);
      entry.onMatchTimeout();
    }
  }

  private async handleMatchMessage(messageBody: MatchMessage) {
    // Create a collab room for the matched users
    // const [difficulty, topic] = messageBody.matchedTopic.split('-');
    // try {
    //   await this.createCollabRoom(messageBody.matchedRoom, topic, difficulty);
    // } catch (e) {
    //   console.error(`Failed to create collab room: ${e}`);
    // }
    // Notify both users of match using userID to socket mapping
    if (messageBody.userId1 in this.userSocketMap) {
      const res = this.userSocketMap[messageBody.userId1];
      delete this.userSocketMap[messageBody.userId1];
      delete this.socketIdReqMap[res.socketId];
      this.removeUserFromMatch(messageBody.userId1);
      res.onMatch({
        matchedWithUserId: messageBody.userId2,
        matchedTopic: messageBody.matchedTopic,
        matchedRoom: messageBody.matchedRoom
      });
    }
    if (messageBody.userId2 in this.userSocketMap) {
      const res = this.userSocketMap[messageBody.userId2];
      delete this.userSocketMap[messageBody.userId2];
      delete this.socketIdReqMap[res.socketId];
      this.removeUserFromMatch(messageBody.userId2);
      res.onMatch({
        matchedWithUserId: messageBody.userId1,
        matchedTopic: messageBody.matchedTopic,
        matchedRoom: messageBody.matchedRoom
      });
    }
  }

  async addMatchRequest(socketId: string, req: MatchRequest,
                        onMatch: (matchFound: MatchFoundResponse) => void,
                        onMatchTimeout: () => void): Promise<MatchRequestResponse> {
    // Perform atomic set on Redis to see if user is already in the pool
    // If an existing entry exists for the user, return an error
    if (await this.userAlreadyInMatch(req.userId)) {
      return {
        message: 'Failed to match',
        error: 'You are already in the match queue'
      }
    }

    const kafkaTopic = `${req.difficulty}-${req.topic}`;
    const currentTime = Date.now();
    const expiryTime = currentTime + this.REQUEST_TIMEOUT_MS;
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{value: JSON.stringify({
          action: MessageAction.REQUEST_MATCH,
          userId: req.userId,
          timestamp: currentTime,
          expiryTime: expiryTime
        })}]
    });

    this.socketIdReqMap[socketId] = {
      kafkaTopic: kafkaTopic,
      userId: req.userId,
      timestamp: currentTime
    }
    this.userSocketMap[req.userId] = {
      socketId: socketId,
      onMatch: onMatch,
      onMatchTimeout: onMatchTimeout,
    };

    return {
      message: `Match Request received for ${req.userId} at ${currentTime}`,
      expiry: expiryTime,
    }
  }

  async cancelMatchRequest(socketId: string): Promise<MatchRequestResponse> {
    if (!(socketId in this.socketIdReqMap)) {
      return {
        message: 'Failed to cancel match',
        error: 'No existing match request found for the user'
      }
    }

    const req = this.socketIdReqMap[socketId];
    delete this.socketIdReqMap[socketId];
    delete this.userSocketMap[req.userId];
    await this.producer.send({
      topic: req.kafkaTopic,
      messages: [{value: JSON.stringify({
          action: MessageAction.CANCEL_MATCH,
          userId: req.userId,
          timestamp: req.timestamp
        })}]
    });
    this.removeUserFromMatch(req.userId);

    return {
      message: `Match Request cancelled for ${req.userId} at ${req.timestamp}`,
    }
  }

  private getKafkaBrokerUri(): string {
    return this.configService.get<string>('config.kafkaBrokerUri');
  }

  private getConsumerGroupId(): string {
    return this.configService.get<string>('config.consumerGroupId');
  }

  private getRedisDomain(): string {
    return this.configService.get<string>('config.redisDomain');
  }

  private async userAlreadyInMatch(userId: string): Promise<boolean> {
    const result = await this.redisClient.set(userId, "", {
      NX: true, // Set only if key does not exist
      EX: Math.ceil(this.REQUEST_TIMEOUT_MS / 1000 + 1),
    });

    return result === null || result === undefined;
  }

  private removeUserFromMatch(userId: string) {
    this.redisClient.del(userId);
  }
}
