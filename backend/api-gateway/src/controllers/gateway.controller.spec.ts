import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from '../services/gateway.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

describe('GatewayController', () => {
  let gatewayController: GatewayController;
  let gatewayService: GatewayService;
  let configService: ConfigService;

  const mockGatewayService = {
    handleRedirectRequest: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const configMap = {
        QUESTION_SERVICE_DOMAIN: 'http://question-service',
        USER_SERVICE_DOMAIN: 'http://user-service',
        COLLAB_SERVICE_DOMAIN: 'http://collab-service',
        HISTORY_SERVICE_DOMAIN: 'http://history-service',
      };
      return configMap[key];
    }),
  };

  const mockReq = {} as Request;
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        { provide: GatewayService, useValue: mockGatewayService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gatewayController = module.get<GatewayController>(GatewayController);
    gatewayService = module.get<GatewayService>(GatewayService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should handle question service requests', async () => {
    await gatewayController.handleQuestionRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://question-service'
    );
  });

  it('should handle user service requests', async () => {
    await gatewayController.handleUserRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://user-service'
    );
  });

  it('should handle auth service requests', async () => {
    await gatewayController.handleAuthRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://user-service'
    );
  });

  it('should handle create-room requests for collab service', async () => {
    await gatewayController.handleCreateRoomRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://collab-service'
    );
  });

  it('should handle room-related requests for collab service', async () => {
    await gatewayController.handleRoomRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://collab-service'
    );
  });

  it('should handle history service requests', async () => {
    await gatewayController.handleHistoryRequest(mockReq, mockRes);
    expect(gatewayService.handleRedirectRequest).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      'http://history-service'
    );
  });
});
