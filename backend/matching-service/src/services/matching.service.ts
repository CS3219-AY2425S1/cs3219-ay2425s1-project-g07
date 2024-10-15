import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { QuestionComplexity, QuestionTopic, MatchRequestDto } from 'src/dto/request.dto';

type UserEntry = {
  matched: boolean;
  topic: string;
  matchedWithUserId: string;
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
    var msg = `${req.userId}-${req.timestamp}`;
    console.log("Topic is: ", kafkaTopic);
    // Add message
    await this.producer.send({
      topic: kafkaTopic,
      messages: [{value: msg}]
    });
  }

  private async consumeMessages() {
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const matchRequest = message.value.toString();
        const matchRequestUserId = matchRequest.split('-')[0];

        // Check if this is a duplicate request
        if (this.userPool[matchRequestUserId]) {
          console.log(`Duplicate request received for ${matchRequestUserId}`);
          return;
        }

        console.log(`Received message: ${matchRequest} from topic: ${topic}`);

        // Check if a matching user exists
        const existingMatch = Object.keys(this.userPool).find(
          (userId) => this.userPool[userId].topic === topic && !this.userPool[userId].matched && userId !== matchRequestUserId
        );

        if (existingMatch) {
          // Pair the users if match is found
          this.userPool[existingMatch].matchedWithUserId = matchRequestUserId;
          this.userPool[existingMatch].matched = true;
          this.userPool[matchRequestUserId] = {
            matched: true,
            topic: topic,
            matchedWithUserId: existingMatch,
          };
          console.log(`Match found for ${matchRequestUserId} and ${existingMatch} in topic: ${topic}`);
        } else {
          this.userPool[matchRequestUserId] = {
            matched: false,
            topic: topic,
            matchedWithUserId: '',
          }
        }
      }
    })
  }

  removeFromUserPool(userId: string) {
    delete this.userPool[userId];
  }

  pollForMatch(userId: string): UserEntry | null {
    return this.userPool[userId] || null;
  }

}
