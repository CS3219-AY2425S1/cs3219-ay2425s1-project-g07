import { Test, TestingModule } from '@nestjs/testing';
import { CollabController } from './collab.controller';
import { CollabService } from './services/collab.service';

describe('CollabController', () => {
  let collabController: CollabController;
  let collabService: CollabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollabController],
      providers: [
        {
          provide: CollabService,
          useValue: {
            createRoom: jest.fn(),
            getAllRooms: jest.fn(),
            getRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    collabController = module.get<CollabController>(CollabController);
    collabService = module.get<CollabService>(CollabService);
  });

  describe('getAllRooms', () => {
    it('should call collabService.getAllRooms and return its result', async () => {
      const mockRooms = [
        { id: 'room1', users: [], question: { id: 'q1', text: 'Sample question', topic: 'science', difficulty: 'medium' }, doc: 'doc1' },
      ];
      (collabService.getAllRooms as jest.Mock).mockResolvedValue(mockRooms);

      const result = await collabController.getAllRooms();

      expect(collabService.getAllRooms).toHaveBeenCalled();
      expect(result).toEqual(mockRooms);
    });
  });

  describe('getRoomById', () => {
    it('should call collabService.getRoom with the correct roomId and return its result', async () => {
      const roomId = 'room1';
      const mockRoom = { id: roomId, users: [], question: { id: 'q2', text: 'Sample question 2', topic: 'math', difficulty: 'easy' }, doc: 'doc2' };
      
      (collabService.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      const result = await collabController.getRoomById(roomId, { userId: 'dummy'});

      expect(collabService.getRoom).toHaveBeenCalledWith(roomId, 'dummy');
      expect(result).toEqual(mockRoom);
    });
  });
});
