import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto, UpdateQuestionDto, FilterQuestionsDto } from '../dto/question.dto';
import { Question, QuestionComplexity, QuestionTopic } from '../schemas/question.schema';

describe('QuestionController', () => {
  let controller: QuestionController;
  let questionService: QuestionService;

  const mockQuestionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getRandomQuestion: jest.fn(),
    filterQuestions: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: mockQuestionService,
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
    questionService = module.get<QuestionService>(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new question', async () => {
      const createQuestionDto: CreateQuestionDto = { 
        title: 'New Question',
        complexity: QuestionComplexity.EASY, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
        description: 'test description',
        link: 'test-link',
        solution: 'test-solution',
      };
      const createdQuestion = { ...createQuestionDto };
      mockQuestionService.create.mockResolvedValue(createdQuestion);
      const result = await controller.create(createQuestionDto);

      expect(result).toEqual(createdQuestion);
      expect(questionService.create).toHaveBeenCalledWith(createQuestionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of questions', async () => {
      const questions: Question[] = [
        { 
          title: 'New Question',
          complexity: QuestionComplexity.EASY, 
          topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
          description: 'test description',
          link: 'test-link',
          solution: 'test-solution',
        }
      ];
      mockQuestionService.findAll.mockResolvedValue(questions);
      const result = await controller.findAll();

      expect(result).toEqual(questions);
      expect(questionService.findAll).toHaveBeenCalled();
    });
  });

  describe('getRandomQuestion', () => {
    it('should return a random question based on filter criteria', async () => {
      const filterDto: FilterQuestionsDto = { 
        difficulty: QuestionComplexity.HARD, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY] 
      };
      const randomQuestion: Question = { 
        title: 'Random Question', 
        complexity: QuestionComplexity.HARD, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
        description: 'A hard question',
        link: 'hello.com',
        solution: 'test-solution',
      };
      mockQuestionService.getRandomQuestion.mockResolvedValue(randomQuestion);
      const result = await controller.getRandomQuestion(filterDto);

      expect(result).toEqual(randomQuestion);
      expect(questionService.getRandomQuestion).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('filterQuestions', () => {
    it('should return filtered questions', async () => {
      const filterDto: FilterQuestionsDto = { 
        difficulty: QuestionComplexity.HARD, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY] 
      };
      const filteredQuestions: Question[] = [{ 
        title: 'Random Question', 
        complexity: QuestionComplexity.HARD, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
        description: 'A hard question',
        link: 'hello.com',
        solution: 'test-solution',
      }];
      mockQuestionService.filterQuestions.mockResolvedValue(filteredQuestions);
      const result = await controller.filterQuestions(filterDto);

      expect(result).toEqual(filteredQuestions);
      expect(questionService.filterQuestions).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    // Tests that "find" by id make sures that the id is passed and called properly
    it('should return a question by id', async () => {
      const question: Question = { 
        title: 'Random Question', 
        complexity: QuestionComplexity.HARD, 
        topics: [QuestionTopic.ARRAY, QuestionTopic.BINARY],
        description: 'A hard question',
        link: 'hello.com',
        solution: 'test-solution',
      };
      mockQuestionService.findOne.mockResolvedValue(question);
      const result = await controller.findOne('126');

      expect(result).toEqual(question);
      expect(questionService.findOne).toHaveBeenCalledWith('126');
    });
  });

  describe('update', () => {
    it('should update a question by id', async () => {
      const updateDto: UpdateQuestionDto = { title: 'Updated Title', complexity: QuestionComplexity.HARD };
      const updatedQuestion: Question = { 
        title: 'Updated Title', 
        complexity: QuestionComplexity.HARD, 
        topics: [QuestionTopic.STACK],
        description: 'deleting question',
        link: 'test-link',
        solution: 'test-solution',
      };
      mockQuestionService.update.mockResolvedValue(updatedQuestion);
      const result = await controller.update('127', updateDto);

      expect(result).toEqual(updatedQuestion);
      expect(questionService.update).toHaveBeenCalledWith('127', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a question by id', async () => {
      const deletedQuestion: Question = { 
        title: 'To Be Deleted', 
        complexity: QuestionComplexity.EASY, 
        topics: [QuestionTopic.STACK],
        description: 'deleting question',
        link: 'test-link',
        solution: 'test-solution',
      };
      mockQuestionService.delete.mockResolvedValue(deletedQuestion);
      const result = await controller.delete('128');

      expect(result).toEqual(deletedQuestion);
      expect(questionService.delete).toHaveBeenCalledWith('128');
    });
  });
});
