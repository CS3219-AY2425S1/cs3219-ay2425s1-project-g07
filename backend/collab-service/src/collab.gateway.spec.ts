import { Test, TestingModule } from '@nestjs/testing';
import { CollabGateway } from './collab.gateway';
import { CollabService } from './services/collab.service';
import { Server } from 'http';
import * as WebSocket from 'ws';
import { Request } from 'express';

jest.mock('y-websocket/bin/utils', () => ({
  setupWSConnection: jest.fn(),
}));

describe('CollabGateway', () => {
  let collabGateway: CollabGateway;
  let collabService: CollabService;
  let mockServer: Server;
  let mockWs: WebSocket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollabGateway,
        { provide: CollabService, useValue: { joinRoom: jest.fn(), leaveRoom: jest.fn() } },
      ],
    }).compile();

    collabGateway = module.get<CollabGateway>(CollabGateway);
    collabService = module.get<CollabService>(CollabService);

    mockServer = {} as Server;
    collabGateway.setServer(mockServer);

    mockWs = {
      close: jest.fn(),
      on: jest.fn(),
      send: jest.fn(),
    } as any as WebSocket;
  });

  describe('initCollabServer', () => {
    it('should set up WebSocket server and connection handler', () => {
      const wssSpy = jest.spyOn(WebSocket, 'Server').mockImplementation(() => ({
        on: jest.fn(),
      }) as any);
      collabGateway.initCollabServer();
      expect(wssSpy).toHaveBeenCalledWith({ server: mockServer });
    });
  });

  describe('handleConnection', () => {
    let req: Request;
    const roomId = 'testRoom';
    const userId = 'testUser';

    beforeEach(() => {
      req = { url: `/code/${roomId}?userId=${userId}` } as any as Request;
    });

    it('should close the connection if roomId or userId is missing', () => {
      jest.spyOn(collabGateway, 'extractInfoFromUrl').mockReturnValue({ roomId: null, userId: null });
      collabGateway.handleConnection(mockWs, req);
      expect(mockWs.close).toHaveBeenCalled();
    });

    it('should send error and close the connection if room not found', () => {
      jest.spyOn(collabGateway, 'extractInfoFromUrl').mockReturnValue({ roomId, userId });
      (collabService.joinRoom as jest.Mock).mockReturnValue(null);

      collabGateway.handleConnection(mockWs, req);

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'error', message: 'Room not found or full' }));
      expect(mockWs.close).toHaveBeenCalled();
    });

    it('should setup Yjs websocket and join room on successful connection', () => {
      const mockRoom = { doc: {} };
      jest.spyOn(collabGateway, 'extractInfoFromUrl').mockReturnValue({ roomId, userId });
      (collabService.joinRoom as jest.Mock).mockReturnValue(mockRoom);

      collabGateway.handleConnection(mockWs, req);

      const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
      expect(setupWSConnection).toHaveBeenCalledWith(mockWs, req, mockRoom.doc, { room: roomId });
    });

    it('should handle WebSocket close event by leaving room', () => {
      jest.spyOn(collabGateway, 'extractInfoFromUrl').mockReturnValue({ roomId, userId });
      const mockRoom = { doc: {} };
      (collabService.joinRoom as jest.Mock).mockReturnValue(mockRoom);

      collabGateway.handleConnection(mockWs, req);

      const closeCallback = (mockWs.on as jest.Mock).mock.calls.find(
        ([event]) => event === 'close'
      )[1];

      closeCallback();

      expect(collabService.leaveRoom).toHaveBeenCalledWith(userId);
    });
  });

  describe('extractInfoFromUrl', () => {
    it('should correctly extract roomId and userId from URL', () => {
      const url = '/code/testRoom?userId=testUser';
      const result = collabGateway['extractInfoFromUrl'](url);
      expect(result).toEqual({ roomId: 'testRoom', userId: 'testUser' });
    });

    it('should return null for roomId and userId if URL does not match', () => {
      const url = '/invalid-url';
      const result = collabGateway['extractInfoFromUrl'](url);
      expect(result).toEqual({ roomId: null, userId: null });
    });
  });
});
