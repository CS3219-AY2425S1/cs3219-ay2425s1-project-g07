import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QuestionHistoryService, AttemptHistoryService } from './history.services';
import { Model } from 'mongoose';
import { QuestionHistory, AttemptHistory } from '../schemas/history.schema';

const mockQuestionHistory = {
  studentId: 'testStudentId',
  questionId: 'test question content',
  roomId: 'testRoomId',
  questionTitle: 'test title',
  questionDifficulty: 'easy',
  questionTopics: ['math'],
  collaboratorId: 'anotherStudentId',
  timeAttempted: new Date(),
  timeCreated: new Date(),
};

const mockAttemptHistory = {
  studentId: 'testStudentId',
  questionId: 'testQuestionId',
  roomId: 'testRoomId',
  timeAttempted: new Date(),
  programmingLanguage: 'python',
  attemptCode: 'attempt',
};

describe('QuestionHistoryService', () => {
  let service: QuestionHistoryService;
  let model: Model<QuestionHistory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionHistoryService,
        {
          provide: getModelToken('QuestionHistory'),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            constructor: jest.fn(), 
          },
        },
      ],
    }).compile();

    service = module.get<QuestionHistoryService>(QuestionHistoryService);
    model = module.get<Model<QuestionHistory>>(getModelToken('QuestionHistory'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new collaboration history', async () => {
      // empty... not sure how to mock the collaboration history creation
      // with functions, i.e. the impl of collaboration history create 
      // a little hard to mock
    });
  });

  describe('findAll', () => {
    it('should return an array of question histories', async () => {
      (model.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockQuestionHistory]),
      });
      const result = await service.findAll();
      expect(result).toEqual([mockQuestionHistory]);
    });
  });

  describe('findOne', () => {
    it('should return a question history if it exists', async () => {
      (model.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuestionHistory),
      });
      const result = await service.findOne('testId');
      expect(result).toEqual(mockQuestionHistory);
    });

    it('should throw NotFoundException if question history not found', async () => {
      (model.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne('testId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a question history and return the updated document', async () => {
      const updatedQuestionHistory = { ...mockQuestionHistory, question: 'New question' };
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedQuestionHistory),
      });
      const result = await service.update('testId', updatedQuestionHistory);
      expect(result).toEqual(updatedQuestionHistory);
    });
  });

  describe('remove', () => {
    it('should delete a question history by id', async () => {
      (model.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuestionHistory),
      });
      const result = await service.remove('testId');
      expect(result).toEqual(mockQuestionHistory);
    });
  });
});

describe('AttemptHistoryService', () => {
  let service: AttemptHistoryService;
  let model: Model<AttemptHistory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptHistoryService,
        {
          provide: getModelToken('AttemptHistory'),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttemptHistoryService>(AttemptHistoryService);
    model = module.get<Model<AttemptHistory>>(getModelToken('AttemptHistory'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new attempt history', async () => {
      // empty... not sure how to mock the attempt history creation
      // with functions, i.e. the impl of attempt history create 
      // a little hard to mock
    });
  });

  describe('findAll', () => {
    it('should return an array of attempt histories', async () => {
      (model.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAttemptHistory]),
      });
      const result = await service.findAll();
      expect(result).toEqual([mockAttemptHistory]);
    });
  });

  describe('findOne', () => {
    it('should return an attempt history if it exists', async () => {
      (model.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttemptHistory),
      });
      const result = await service.findOne('testId');
      expect(result).toEqual(mockAttemptHistory);
    });

    it('should throw NotFoundException if attempt history not found', async () => {
      (model.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne('testId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an attempt history and return the updated document', async () => {
      const updatedAttemptHistory = { ...mockAttemptHistory, answer: 'new answer' };
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedAttemptHistory),
      });
      const result = await service.update('testId', updatedAttemptHistory);
      expect(result).toEqual(updatedAttemptHistory);
    });
  });

  describe('remove', () => {
    it('should delete an attempt history by id', async () => {
      (model.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAttemptHistory),
      });
      const result = await service.remove('testId');
      expect(result).toEqual(mockAttemptHistory);
    });
  });
});
