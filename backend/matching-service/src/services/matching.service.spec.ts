import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService, MatchStatus, Message, MessageAction } from './matching.service';
import { QuestionComplexity, QuestionTopic } from '../dto/request.dto';
import { ConfigService } from '@nestjs/config';
import { Producer, Consumer } from 'kafkajs';

// mock the kafkajs module
jest.mock('kafkajs',() => ({
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined), // Mock connect
        send: jest.fn().mockResolvedValue(undefined), // Mock send
      }),
      consumer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined), // Mock connect
        run: jest.fn().mockResolvedValue(undefined), // Mock run
        subscribe: jest.fn().mockResolvedValue(undefined),
      }),
    })),
}));
// mock the crypto module used for roomId generation
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

describe('MatchingService', () => {
  let service: MatchingService;
  let producer: Producer;
  let consumer: Consumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'config.kafkaBrokerUri') return 'kafka://localhost:9092';
              if (key === 'config.consumerGroupId') return 'matching-service-group';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    producer = service['producer'];
    consumer = service['consumer'];
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // To clear any existing intervals
    await service.onModuleDestroy();
  })

  describe('subscribeToTopics', () => {
    it('should subscribe to all topics based on complexities and topics', async () => {
      const subscribeSpy = jest.spyOn(consumer, 'subscribe').mockResolvedValue(undefined);
      await service.subscribeToTopics();
      const expectedArray = [];
      for (const complexity of Object.values(QuestionComplexity)) {
        for (const topic of Object.values(QuestionTopic)) {
          expectedArray.push(`${complexity}-${topic}`);
        }
      }

      expect(subscribeSpy).toHaveBeenCalledWith({
        topics: expectedArray,
        fromBeginning: false,
      });
    });
  });

  describe('handleMatchRequest', () => {
    it('should add user to the queue if no matching user found', async () => {
      const kafkaTopic = 'easy-math';
      const matchRequest: Message = {
        action: MessageAction.REQUEST_MATCH,
        userId: 'user123',
        timestamp: Date.now(),
        expiryTime: Date.now() + 300000,
      };
      jest.spyOn(service['requestQueue'], 'retrieve').mockResolvedValue(undefined);
      const enqueueSpy = jest.spyOn(service['requestQueue'], 'enqueue').mockResolvedValue(undefined);
      await service['handleMatchRequest'](kafkaTopic, matchRequest);

      expect(enqueueSpy).toHaveBeenCalledWith({
        userId: 'user123',
        status: MatchStatus.PENDING,
        topic: kafkaTopic,
        matchedWithUserId: '',
        matchedTopic: '',
        matchedRoom: '',
        createTime: matchRequest.timestamp,
        expiryTime: matchRequest.expiryTime,
      });
    });

    it('should send a match event if a matching user is found', async () => {
      const kafkaTopic = 'easy-math';
      const matchRequest: Message = {
        action: MessageAction.REQUEST_MATCH,
        userId: 'user123',
        timestamp: Date.now(),
        expiryTime: Date.now() + 300000,
      };
      const matchingUser = {
        userId: 'user456',
        status: MatchStatus.PENDING,
        topic: kafkaTopic,
        matchedWithUserId: 'user123',
        matchedTopic: 'easy-math',
        matchedRoom: 'testing-room',
        createTime: Date.now(),
        expiryTime: Date.now() + 300000,
      };
      jest.spyOn(service['requestQueue'], 'retrieve').mockResolvedValue(matchingUser);
      const sendSpy = jest.spyOn(producer, 'send').mockResolvedValue(undefined);
      await service['handleMatchRequest'](kafkaTopic, matchRequest);

      expect(sendSpy).toHaveBeenCalledWith({
        topic: 'matches',
        messages: [
          {
            value: JSON.stringify({
              userId1: 'user123',
              userId2: 'user456',
              matchedTopic: kafkaTopic,
              matchedRoom: 'mocked-uuid',
            }),
          },
        ],
      });
    });
  });

  describe('handleCancelRequest', () => {
    it('should remove user from the queue when cancel request is received', async () => {
      const cancelRequest: Message = {
        action: MessageAction.CANCEL_MATCH,
        userId: 'user123',
        timestamp: Date.now(),
      };
      const cleanSpy = jest.spyOn(service['requestQueue'], 'clean').mockResolvedValue(undefined);
      await service['handleCancelRequest']('easy-math', cancelRequest);

      expect(cleanSpy).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('consumeMessages', () => {
    it('should handle REQUEST_MATCH action', async () => {
      const message = {
        topic: 'easy-math',
        value: JSON.stringify({ action: MessageAction.REQUEST_MATCH, userId: 'user123', timestamp: Date.now() }),
      };
      const handleMatchRequestSpy = jest.spyOn(service, 'handleMatchRequest').mockResolvedValue(undefined);
      (consumer.run as jest.Mock).mockImplementation(({ eachMessage }) => {
        return eachMessage({ topic: 'easy-math', message });
      });
      await service['consumeMessages']();

      expect(handleMatchRequestSpy).toHaveBeenCalledWith('easy-math', JSON.parse(message.value));
    });

    it('should handle CANCEL_MATCH action', async () => {
      const message = {
        topic: 'easy-math',
        value: JSON.stringify({ action: MessageAction.CANCEL_MATCH, userId: 'user123', timestamp: Date.now() }),
      };
      const handleCancelRequestSpy = jest.spyOn(service, 'handleCancelRequest').mockResolvedValue(undefined);
      (consumer.run as jest.Mock).mockImplementation(({ eachMessage }) => {
        return eachMessage({ topic: 'easy-math', message });
      });
      await service['consumeMessages']();

      expect(handleCancelRequestSpy).toHaveBeenCalledWith('easy-math', JSON.parse(message.value));
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear interval on module destroy', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(service['intervalId']);
    });
  });
});
