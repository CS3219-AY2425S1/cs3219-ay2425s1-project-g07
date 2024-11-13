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

  describe('handleJoinRoom', () => {
    it('should allow client to join specified room and log the event', () => {
      const roomId = 'testRoomId';
      chatGateway.handleJoinRoom(mockClient, roomId);
      expect(mockClient.join).toHaveBeenCalledWith(roomId);
    });
  });

  describe('handleChatMessage', () => {
    it('should emit message to specified room and log the event', () => {
      const data = {
        roomId: 'testRoomId',
        message: { senderUsername: 'testUser', text: 'Hello, world!' },
      };
      chatGateway.handleChatMessage(data);
      expect(mockServer.to).toHaveBeenCalledWith(data.roomId);
      expect(mockServer.emit).toHaveBeenCalledWith('chat message', data.message);
    });
  });
});
