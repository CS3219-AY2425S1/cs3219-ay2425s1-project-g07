import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { randomUUID } from 'crypto';
import { Queue } from 'src/utils/queue';
import { QuestionComplexity, QuestionTopic, MatchResponse, MatchRequestDto } from 'src/dto/request.dto';

export enum MatchStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
}

type UserEntry = {
  userId: string;
  status: MatchStatus;
  topic: string;
  matchedWithUserId: string;
  matchedTopic: string;
  matchedRoom: string;
  createTime: number;
  expiryTime: number;
}

enum MessageAction {
  REQUEST_MATCH = 'REQUEST_MATCH',
  CANCEL_MATCH = 'CANCEL_MATCH'
}

type Message = {
  action: MessageAction;
  userId: string;
  timestamp: number;
  expiryTime?: number;
}

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly REQUEST_TIMEOUT = 30000; // epoch time 30s
  private readonly CLEAN_TIMEOUT = 3000;
  private readonly kafkaBrokerUri: string;
  private readonly consumerGroupId: string;
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  private requestQueue: Queue<UserEntry>;
  private intervalId: NodeJS.Timeout;
  private userPool: { [userId: string]: UserEntry } = {}; // In-memory store for user pool

  constructor(private configService: ConfigService) {
    this.kafkaBrokerUri = this.getKafkaBrokerUri();
    this.consumerGroupId = this.getConsumerGroupId();
    this.requestQueue = new Queue();
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

    this.intervalId = setInterval(async () => {
      const currentTime = Date.now();
      // only keep expiry more than currentTime
      var cleanedEntry = await this.requestQueue.clean((userEntry) => userEntry.expiryTime <= currentTime);
      for (let entry of cleanedEntry) {
        if (this.userPool[entry.userId] === entry) {
          this.removeFromUserPool(entry.userId);
        }
        // else might be updated already
      }
    }, this.CLEAN_TIMEOUT);
  }

  async onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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

  async addMatchRequest(req: MatchRequestDto): Promise<MatchResponse> {
    var kafkaTopic = `${req.difficulty}-${req.topic}`;
    // console.log("Topic is: ", kafkaTopic);
    // Add message
    const currentTime = Date.now();
    const expiryTime = currentTime + this.REQUEST_TIMEOUT;
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{value: JSON.stringify({
        action: MessageAction.REQUEST_MATCH,
        userId: req.userId,
        timestamp: currentTime,
        expiryTime: expiryTime
      })}]
    });
    return {
      message: `Match Request received for ${req.userId} at ${currentTime}`,
    }
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

  private matchTopics(kafkaTopic1: string, kafkaTopic2: string): boolean {
    if (kafkaTopic1 === kafkaTopic2) {
      return true;
    }

    const questionDifficulty1 = kafkaTopic1.split('-')[0];
    const questionTopic1 = kafkaTopic1.split('-')[1];

    const questionDifficulty2 = kafkaTopic2.split('-')[0];
    const questionTopic2 = kafkaTopic2.split('-')[1];

    if (questionDifficulty1 === QuestionComplexity.ANY || questionDifficulty2 === QuestionComplexity.ANY) {
      return questionTopic1 === questionTopic2 
        || questionTopic1 === QuestionTopic.ANY 
        || questionTopic2 === QuestionTopic.ANY;
    }

    if (questionTopic1 === QuestionTopic.ANY || questionTopic2 === QuestionTopic.ANY) {
      // No need to check for any, because it would be caught in the guard clause above
      return questionDifficulty1 === questionDifficulty2;
    }

    return false;
  }

  // Only called when matched
  private getMatchedTopic(kafkaTopic1: string, kafkaTopic2: string): string {
    if (kafkaTopic1 === kafkaTopic2) {
      return kafkaTopic1;
    }
    // based off topic1, get as specific as possible
    var matchedDifficulty = kafkaTopic1.split('-')[0];
    var matchedTopic = kafkaTopic1.split('-')[1];

    const questionDifficulty2 = kafkaTopic2.split('-')[0];
    const questionTopic2 = kafkaTopic2.split('-')[1];

    if (questionDifficulty2 !== QuestionComplexity.ANY) {
      // matchedDifficulty is either the same as questionDifficulty2 or is ANY
      matchedDifficulty = questionDifficulty2;
    }
    if (questionTopic2 !== QuestionTopic.ANY) {
      matchedTopic = questionTopic2;
    }
     
    return `${matchedDifficulty}-${matchedTopic}`;
  }

  private async handleMatchRequest(kafkaTopic: string, matchRequest: Message) {
      const requesterUserId = matchRequest.userId;
      const currTime = Date.now();

      // Check if this is a duplicate request
      if (this.userPool[requesterUserId] 
        && this.userPool[requesterUserId].status !== MatchStatus.CANCELLED // not cancelled (deprecated, keep first)
        && this.userPool[requesterUserId].expiryTime > currTime // not expired
      ) {
        console.log(`Duplicate match request received for ${requesterUserId}`);
        return;
      }

      console.log(`Received match request: ${matchRequest} on topic: ${kafkaTopic}`);

      // Check if a matching user exists in the Queue
      // atomic retrieve (and popped from queue)
      const matchingUser: UserEntry | undefined = await this.requestQueue.retrieve((userInQueue: UserEntry) => {
        return this.matchTopics(userInQueue.topic, kafkaTopic)
          && userInQueue.status == MatchStatus.PENDING // Ensure the user is waiting for a match
          && userInQueue.userId !== requesterUserId
          && userInQueue.expiryTime >= currTime // give some leeway
      })

      var existingMatch: string | undefined = matchingUser ? matchingUser.userId : undefined;

      if (existingMatch) {
        // Pair the users if match is found
        const matchedTopic = this.getMatchedTopic(this.userPool[existingMatch].topic, kafkaTopic);
        const roomId = randomUUID();
        this.userPool[existingMatch].matchedWithUserId = requesterUserId;
        this.userPool[existingMatch].status = MatchStatus.MATCHED;
        this.userPool[existingMatch].matchedRoom = roomId;
        this.userPool[existingMatch].matchedTopic = matchedTopic;

        this.userPool[requesterUserId] = {
          userId: requesterUserId,
          status: MatchStatus.MATCHED,
          topic: kafkaTopic,
          matchedWithUserId: existingMatch,
          matchedTopic: matchedTopic,
          matchedRoom: roomId,
          createTime: matchRequest.timestamp,
          expiryTime: matchRequest.expiryTime,
        };
        console.log(`Match found for ${requesterUserId} and ${existingMatch} in topic: ${kafkaTopic}`);
      } else {
        const userEntry: UserEntry = {
          userId: requesterUserId,
          status: MatchStatus.PENDING,
          topic: kafkaTopic,
          matchedWithUserId: '',
          matchedTopic: '',
          matchedRoom: '',
          createTime: matchRequest.timestamp,
          expiryTime: matchRequest.expiryTime,
        }
        await this.requestQueue.enqueue(userEntry)
        this.userPool[requesterUserId] = userEntry
      }

      console.log(JSON.stringify(this.userPool, null, 2));
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
      // removes all instances (though only 1 should exist)
      this.requestQueue.clean((userEntry: UserEntry) =>  userEntry.userId === requesterUserId);
      this.removeFromUserPool(requesterUserId);
      console.log(`Match request cancelled for ${requesterUserId} in topic: ${topic}`);
    }

    console.log(JSON.stringify(this.userPool, null, 2));
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
    })
  }

  removeFromUserPool(userId: string) {
    delete this.userPool[userId];
    console.log(JSON.stringify(this.userPool, null, 2));
  }

  pollForMatch(userId: string): UserEntry | null {
    return this.userPool[userId] || null;
  }

}
