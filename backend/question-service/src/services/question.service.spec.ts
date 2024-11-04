import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { QuestionService } from './question.service';
import { Question, QuestionComplexity, QuestionDocument, QuestionTopic } from '../schemas/question.schema';
import { CreateQuestionDto, UpdateQuestionDto, FilterQuestionsDto } from '../dto/question.dto';

describe('QuestionService', () => {
  let service: QuestionService;

  const mockQuestion = {
    _id: '609e12345678901234567890',
    title: 'Sample Question',
    complexity: QuestionComplexity.EASY,
    topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
    description: 'description for testing',
  };

  // For most test cases except for creation
  const mockQuestionModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    save: jest.fn(),
    exec: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getModelToken(Question.name),
          useValue: mockQuestionModel,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);

    jest.clearAllMocks();
  });

  describe('create a new question with necessary fields', () => {
    it('should create a question', async () => {
      const createQuestionDto: CreateQuestionDto = { 
        title: 'New Question',
        complexity: QuestionComplexity.EASY,
        topics: [QuestionTopic.BINARY],
        description: "test-question",
        link: "test-link",
      };
      // modified service with a different mockQuestionModel
      const mockQuestionModel2 = jest.fn().mockImplementation((createQuestionDto) => ({
        ...createQuestionDto,
        save: jest.fn().mockResolvedValue({ ...mockQuestion, ...createQuestionDto }),
      }));
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          QuestionService,
          {
            provide: getModelToken(Question.name),
            useValue: mockQuestionModel2,
          },
        ],
      }).compile();
      service = module.get<QuestionService>(QuestionService);
      jest.spyOn(service, 'hasQuestionWithTitle').mockResolvedValue(false);
      const result = await service.create(createQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...createQuestionDto });
      expect(mockQuestionModel2).toHaveBeenCalledWith(createQuestionDto);
    });

    it('should throw ConflictException if title already exists', async () => {
      const createQuestionDto: CreateQuestionDto = { 
        title: 'Duplicate Title', 
        complexity: QuestionComplexity.EASY, 
        topics: [QuestionTopic.BINARY],
        description: "test-question",
        link: "test-link",
      };
      jest.spyOn(service, 'hasQuestionWithTitle').mockResolvedValue(true);

      await expect(service.create(createQuestionDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a question title', async () => {
      const updateQuestionDto: UpdateQuestionDto = { title: 'Updated title' };
      mockQuestionModel.exec = jest.fn().mockResolvedValue({
        ...mockQuestion,
        title: 'Updated title',
      });
      jest.spyOn(service, 'hasQuestionWithTitleExceptId').mockResolvedValue(false);
      const result = await service.update(mockQuestion._id, updateQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...updateQuestionDto });
      expect(mockQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(mockQuestion._id, updateQuestionDto, { new: true });
    });

    it('should update a question description', async () => {
      const updateQuestionDto: UpdateQuestionDto = { description: 'Updated description' };
      mockQuestionModel.exec = jest.fn().mockResolvedValue({
        ...mockQuestion,
        description: 'Updated description',
      });
      const result = await service.update(mockQuestion._id, updateQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...updateQuestionDto });
      expect(mockQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(mockQuestion._id, updateQuestionDto, { new: true });
    });

    it('should update a question topic', async () => {
      const updateQuestionDto: UpdateQuestionDto = { topics: [QuestionTopic.BINARY] };
      mockQuestionModel.exec = jest.fn().mockResolvedValue({
        ...mockQuestion,
        topics: [QuestionTopic.BINARY],
      });
      const result = await service.update(mockQuestion._id, updateQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...updateQuestionDto });
      expect(mockQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(mockQuestion._id, updateQuestionDto, { new: true });
    });

    it('should update a question complexity', async () => {
      const updateQuestionDto: UpdateQuestionDto = { complexity: QuestionComplexity.HARD };
      mockQuestionModel.exec = jest.fn().mockResolvedValue({
        ...mockQuestion,
        complexity: QuestionComplexity.HARD,
      });
      const result = await service.update(mockQuestion._id, updateQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...updateQuestionDto });
      expect(mockQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(mockQuestion._id, updateQuestionDto, { new: true });
    });

    it('should update a question link', async () => {
      const updateQuestionDto: UpdateQuestionDto = { link: "hello.com" };
      mockQuestionModel.exec = jest.fn().mockResolvedValue({
        ...mockQuestion,
        link: "hello.com",
      });
      const result = await service.update(mockQuestion._id, updateQuestionDto);

      expect(result).toEqual({ ...mockQuestion, ...updateQuestionDto });
      expect(mockQuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(mockQuestion._id, updateQuestionDto, { new: true });
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQuestionModel.exec = jest.fn().mockResolvedValue(null);

      await expect(service.update(mockQuestion._id, { title: 'Non-existent Question' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a question by ID', async () => {
      mockQuestionModel.exec = jest.fn().mockResolvedValue(mockQuestion);

      const result = await service.findOne(mockQuestion._id);

      expect(result).toEqual(mockQuestion);
      expect(mockQuestionModel.findById).toHaveBeenCalledWith(mockQuestion._id);
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQuestionModel.exec = jest.fn().mockResolvedValue(null);

      await expect(service.findOne(mockQuestion._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a question by ID', async () => {
      mockQuestionModel.exec = jest.fn().mockResolvedValue(mockQuestion);

      const result = await service.delete(mockQuestion._id);

      expect(result).toEqual(mockQuestion);
      expect(mockQuestionModel.findByIdAndDelete).toHaveBeenCalledWith(mockQuestion._id);
    });

    it('should throw NotFoundException if question not found', async () => {
      mockQuestionModel.exec = jest.fn().mockResolvedValue(null);

      await expect(service.delete(mockQuestion._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterQuestions', () => {
    it('should filter questions by criteria', async () => {
      const filterQuestionsDto: FilterQuestionsDto = { difficulty: QuestionComplexity.EASY, topics: [QuestionTopic.BINARY] };
      const filter = { complexity: QuestionComplexity.EASY, topics: { $in: [QuestionTopic.BINARY] } };
      mockQuestionModel.exec = jest.fn().mockResolvedValue([mockQuestion]);

      const result = await service.filterQuestions(filterQuestionsDto);

      expect(result).toEqual([mockQuestion]);
      expect(mockQuestionModel.find).toHaveBeenCalledWith(filter);
    });
  });

  describe('getRandomQuestion', () => {
    it('should return a random question matching criteria', async () => {
      const filterQuestionsDto: FilterQuestionsDto = { difficulty: QuestionComplexity.EASY, topics: [QuestionTopic.BINARY] };
      const filter = { complexity: QuestionComplexity.EASY, topics: { $in: [QuestionTopic.BINARY] } };
      mockQuestionModel.exec = jest.fn().mockResolvedValue([mockQuestion]);

      const result = await service.getRandomQuestion(filterQuestionsDto);

      expect(result).toEqual(mockQuestion);
      expect(mockQuestionModel.aggregate).toHaveBeenCalledWith([{ $match: filter }, { $sample: { size: 1 } }]);
    });
  });
});
