import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let mockServer: Server;
  let mockClient: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    chatGateway = module.get<ChatGateway>(ChatGateway);

    // Mock Server and Socket
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any as Server;

    mockClient = {
      id: 'testClientId',
      join: jest.fn(),
    } as any as Socket;

    chatGateway.setServer(mockServer);
  });

  describe('afterInit', () => {
    it('should log initialization message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      chatGateway.afterInit(mockServer);
      expect(consoleSpy).toHaveBeenCalledWith('WebSocket server initialized');
    });
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      chatGateway.handleConnection(mockClient);
      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${mockClient.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      chatGateway.handleDisconnect(mockClient);
      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockClient.id}`);
    });
  });

  describe('handleJoinRoom', () => {
    it('should allow client to join specified room and log the event', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const roomId = 'testRoomId';

      chatGateway.handleJoinRoom(mockClient, roomId);

      expect(mockClient.join).toHaveBeenCalledWith(roomId);
      expect(consoleSpy).toHaveBeenCalledWith(`Client ${mockClient.id} joined room: ${roomId}`);
    });
  });

  describe('handleChatMessage', () => {
    it('should emit message to specified room and log the event', () => {
      const data = {
        roomId: 'testRoomId',
        message: { senderUsername: 'testUser', text: 'Hello, world!' },
      };
      const consoleSpy = jest.spyOn(console, 'log');

      chatGateway.handleChatMessage(data);

      expect(mockServer.to).toHaveBeenCalledWith(data.roomId);
      expect(mockServer.emit).toHaveBeenCalledWith('chat message', data.message);
      expect(consoleSpy).toHaveBeenCalledWith(`Message sent to room ${data.roomId}: ${data.message.text}`);
    });
  });
});
