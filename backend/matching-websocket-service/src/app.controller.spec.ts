import { Test, TestingModule } from '@nestjs/testing';
import { MatchingWebSocketController } from './app.controller';
import { MatchingWebSocketService } from './app.service';

describe('AppController', () => {
  let appController: MatchingWebSocketController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MatchingWebSocketController],
      providers: [MatchingWebSocketService],
    }).compile();

    appController = app.get<MatchingWebSocketController>(MatchingWebSocketController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
