import { CollabService } from './collab.service';
import { ConfigService } from '@nestjs/config';
import { Question } from 'src/interfaces/room.interface';
import axios from 'axios';

jest.mock('axios');

describe('CollabService', () => {
  let collabService: CollabService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    const mockQuestion: Question = {
        _id: '1',
        title: 'mock question',
        description: 'What is 2 + 2?',
        topics: ['math'],
        complexity: 'easy',
        link: 'test-link',
    };
    
    jest.spyOn(configService, 'get').mockReturnValue('http://mocked-question-service.com');
    collabService = new CollabService(configService);
    jest.spyOn(collabService, 'getQuestion').mockReturnValue(Promise.resolve(mockQuestion));
  });

  afterEach(() => {
    collabService.clearIntervals();
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a new room and return room details', async () => {
      collabService.clearIntervals();
      collabService = new CollabService(configService);
      const mockQuestion = { text: 'Sample question', topic: 'math', difficulty: 'easy' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockQuestion });

      const roomId = 'room123';
      const topic = 'math';
      const difficulty = 'easy';

      const result = await collabService.createRoom(roomId, topic, difficulty);

      expect(result).toEqual({
        id: roomId,
        users: [],
        question: mockQuestion,
        doc: expect.any(String),
      });
      expect(collabService['rooms'].has(roomId)).toBe(true);
    });

    it('should return existing room details if room already exists', async () => {
      const roomId = 'existingRoom';
      collabService.clearIntervals();
      collabService = new CollabService(configService);
      const room = await collabService.createRoom(roomId, 'math', 'easy');
      
      const result = await collabService.createRoom(roomId, 'math', 'easy');
      
      expect(result).toEqual(room);
      expect(axios.get).toHaveBeenCalledTimes(1); // Only one call to axios
    });

    it('should return null if no question is found', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: null });
      jest.spyOn(collabService, 'getQuestion').mockReturnValue(null);
      const result = await collabService.createRoom('room123', 'math', 'easy');

      expect(result).toBeNull();
    });
  });

  describe('joinRoom', () => {
    it('should add a user to an existing room', async () => {
      const roomId = 'roomToJoin';
      await collabService.createRoom(roomId, 'math', 'easy');
      const userId = 'user1';

      const result = collabService.joinRoom(roomId, userId);

      expect(result).toEqual({
        id: roomId,
        users: [userId],
        question: expect.any(Object),
        doc: expect.any(String),
      });
      expect(collabService['userRooms'].get(userId)).toBe(roomId);
    });

    it('should return null if room is full', async () => {
      const roomId = 'fullRoom';
      await collabService.createRoom(roomId, 'math', 'easy');
      collabService.joinRoom(roomId, 'user1');
      collabService.joinRoom(roomId, 'user2');

      const result = collabService.joinRoom(roomId, 'user3');

      expect(result).toBeNull();
    });
  });

  describe('leaveRoom', () => {
    it('should remove a user from the room', async () => {
      const roomId = 'roomToLeave';
      const userId = 'userToLeave';
      await collabService.createRoom(roomId, 'math', 'easy');
      collabService.joinRoom(roomId, userId);

      const result = collabService.leaveRoom(userId);

      expect(result.users).not.toContain(userId);
      expect(collabService['userRooms'].has(userId)).toBe(false);
    });

    it('should return null if the user is not in a room', () => {
      const result = collabService.leaveRoom('nonExistentUser');
      expect(result).toBeNull();
    });
  });

  describe('getAllRooms', () => {
    it('should return a list of all rooms', async () => {
      await collabService.createRoom('room1', 'math', 'easy');
      await collabService.createRoom('room2', 'science', 'hard');

      const result = collabService.getAllRooms();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('room1');
      expect(result[1].id).toBe('room2');
    });
  });

  describe('getAvailableRooms', () => {
    it('should return only rooms with less than 2 users', async () => {
      await collabService.createRoom('availableRoom1', 'math', 'easy');
      await collabService.createRoom('availableRoom2', 'science', 'hard');
      collabService.joinRoom('availableRoom1', 'user1');
      collabService.joinRoom('availableRoom2', 'user1');
      collabService.joinRoom('availableRoom2', 'user2'); // Room with 2 users should be excluded

      const result = collabService.getAvailableRooms();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('availableRoom1');
    });
  });

  describe('getRoom', () => {
    it('should return a room by its ID', async () => {
      await collabService.createRoom('roomById', 'math', 'easy');

      const result = collabService.getRoom('roomById');

      expect(result).toEqual({
        id: 'roomById',
        users: [],
        question: expect.any(Object),
        doc: expect.any(String),
      });
    });

    it('should return null if room does not exist', () => {
      const result = collabService.getRoom('nonExistentRoom');
      expect(result).toBeNull();
    });
  });

  describe('getRoomByClient', () => {
    it('should return a room associated with a user ID', async () => {
      await collabService.createRoom('roomForUser', 'math', 'easy');
      collabService.joinRoom('roomForUser', 'user1');

      const result = collabService.getRoomByClient('user1');

      expect(result).toEqual({
        id: 'roomForUser',
        users: ['user1'],
        question: expect.any(Object),
        doc: expect.any(String),
      });
    });

    it('should return null if user is not associated with a room', () => {
      const result = collabService.getRoomByClient('userWithoutRoom');
      expect(result).toBeNull();
    });
  });
});
