import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { createClient, RedisClientType } from 'redis';
import axios from 'axios';
import { MatchingWebSocketService } from './app.service';
import { MatchRequest, MatchRequestResponse, QuestionComplexity, QuestionTopic } from './dto/request.dto';

jest.mock('kafkajs');
jest.mock('redis', () => ({ 
    createClient: jest.fn() 
}));
jest.mock('axios');

describe('MatchingWebSocketService', () => {
  let service: MatchingWebSocketService;
  let configService: ConfigService;
  let kafka: Kafka;
  let producer: Producer;
  let consumer: Consumer;
  let redisClient: RedisClientType;

  beforeEach(async () => {
    configService = new ConfigService();
    producer = { connect: jest.fn(), send: jest.fn(), disconnect: jest.fn() } as any;
    consumer = { connect: jest.fn(), subscribe: jest.fn(), run: jest.fn(), disconnect: jest.fn() } as any;
    kafka = { producer: () => producer, consumer: () => consumer } as any;
    redisClient = {
      on: jest.fn().mockReturnThis(),
      connect: jest.fn().mockReturnThis(),
      then: jest.fn(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn(),
    } as any;
    
    (Kafka as jest.Mock).mockImplementation(() => kafka);
    (createClient as jest.Mock).mockReturnValue(redisClient);

    service = new MatchingWebSocketService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMatchRequest', () => {
    it('should send a match request to Kafka and set up mappings', async () => {
      const socketId = 'socket1';
      const reqTime = Date.now();
      const req: MatchRequest = { userId: 'user123', difficulty: QuestionComplexity.EASY, topic: QuestionTopic.MATH, timestamp: reqTime };
      const onMatch = jest.fn();
      const onMatchTimeout = jest.fn();

      redisClient.set = jest.fn().mockResolvedValue('OK');
      const result: MatchRequestResponse = await service.addMatchRequest(socketId, req, onMatch, onMatchTimeout);

      expect(producer.send).toHaveBeenCalledWith({
        topic: 'easy-math',
        messages: [
          {
            value: expect.stringContaining('"action":"REQUEST_MATCH"'),
          },
        ],
      });
      expect(result).toHaveProperty('message', `Match Request received for ${req.userId} at ${reqTime}`);
      expect(service['socketIdReqMap'][socketId]).toBeDefined();
      expect(service['userSocketMap'][req.userId]).toBeDefined();
    });
  });

  describe('cancelMatchRequest', () => {
    it('should cancel a match request and delete mappings', async () => {
      const socketId = 'socket1';
      const reqTime = Date.now();
      service['socketIdReqMap'][socketId] = { kafkaTopic: 'easy-math', userId: 'user123', timestamp: reqTime };
      service['userSocketMap']['user123'] = { socketId, onMatch: jest.fn(), onMatchTimeout: jest.fn() };
      const result = await service.cancelMatchRequest(socketId);

      expect(producer.send).toHaveBeenCalledWith({
        topic: 'easy-math',
        messages: [
          {
            value: expect.stringContaining('"action":"CANCEL_MATCH"'),
          },
        ],
      });
      expect(result).toHaveProperty('message', `Match Request cancelled for user123 at ${reqTime}`);
      expect(service['socketIdReqMap'][socketId]).toBeUndefined();
      expect(service['userSocketMap']['user123']).toBeUndefined();
    });
  });

  describe('handleMatchMessage', () => {
    it('should handle a match message and notify users', async () => {
      const matchMessage = {
        userId1: 'user123',
        userId2: 'user456',
        matchedTopic: 'easy-math',
        matchedRoom: 'test-room',
      };
      const onMatch1 = jest.fn();
      const onMatch2 = jest.fn();
      service['userSocketMap']['user123'] = { socketId: 'socket1', onMatch: onMatch1, onMatchTimeout: jest.fn() };
      service['userSocketMap']['user456'] = { socketId: 'socket2', onMatch: onMatch2, onMatchTimeout: jest.fn() };
      await (service as any).handleMatchMessage(matchMessage);

      expect(onMatch1).toHaveBeenCalledWith({
        matchedWithUserId: 'user456',
        matchedTopic: 'easy-math',
        matchedRoom: 'test-room',
      });
      expect(onMatch2).toHaveBeenCalledWith({
        matchedWithUserId: 'user123',
        matchedTopic: 'easy-math',
        matchedRoom: 'test-room',
      });
    });
  });

  describe('handleMatchTimeoutMessage', () => {
    it('should handle a timeout message and call onMatchTimeout', () => {
      const timeoutMessage = { userId: 'user123', timestamp: Date.now() };
      const onMatchTimeout = jest.fn();
      service['userSocketMap']['user123'] = { socketId: 'socket1', onMatch: jest.fn(), onMatchTimeout };
      (service as any).handleMatchTimeoutMessage(timeoutMessage);

      expect(onMatchTimeout).toHaveBeenCalled();
      expect(service['userSocketMap']['user123']).toBeUndefined();
      expect(service['socketIdReqMap']['socket1']).toBeUndefined();
    });
  });

  describe('userAlreadyInMatch', () => {
    it('should return true if user is already in match queue', async () => {
      redisClient.set = jest.fn().mockResolvedValue(null);
      const result = await (service as any).userAlreadyInMatch('user123');

      expect(result).toBe(true);
    });

    it('should return false if user is not in match queue', async () => {
      redisClient.set = jest.fn().mockResolvedValue('OK');
      const result = await (service as any).userAlreadyInMatch('user123');

      expect(result).toBe(false);
    });
  });

  describe('createCollabRoom', () => {
    it('should send a request to create a collaboration room', async () => {
      configService.get = jest.fn().mockReturnValue('http://collab-service');
      axios.post = jest.fn().mockResolvedValue({ data: { success: true } });
      redisClient.connect = jest.fn().mockReturnThis()
      const result = await (service as any).createCollabRoom('test-room', 'math', 'easy');

      expect(axios.post).toHaveBeenCalledWith('http://collab-service/create-room', {
        roomId: 'test-room',
        topic: 'math',
        difficulty: 'easy',
      });
      expect(result).toEqual({ success: true });
    });
  });
});
