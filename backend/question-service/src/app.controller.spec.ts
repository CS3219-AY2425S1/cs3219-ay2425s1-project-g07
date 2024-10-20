import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './controllers/question.controller';
import { QuestionService } from './services/question.service';

describe('AppController', () => {
  let questionController: QuestionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [QuestionService],
    }).compile();

    questionController = app.get<QuestionController>(QuestionController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(questionController.getHello()).toBe('Hello World!');
    });
  });
});
