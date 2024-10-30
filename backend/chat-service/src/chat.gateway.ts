import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Message {
	senderUsername: string;
	text: string;
}

@WebSocketGateway({
	cors: {
		origin: '*', 
	},
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('WebSocket server initialized');
	}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('join room')
	handleJoinRoom(client: Socket, roomId: string) {
		client.join(roomId);
		console.log(`Client ${client.id} joined room: ${roomId}`);
	}

	@SubscribeMessage('chat message')
	handleChatMessage(@MessageBody() data: { roomId: string; message: Message }) {
		this.server.to(data.roomId).emit('chat message', data.message);
		console.log(`Message sent to room ${data.roomId}: ${data.message.text}`);
	}

	setServer(server: Server) {
		this.server = server;
	}
}
