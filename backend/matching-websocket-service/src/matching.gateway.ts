import { Injectable } from '@nestjs/common';
import { Server } from 'http';
import { Server as WebSocketServer, Socket } from 'socket.io';
import { MatchingWebSocketService } from './app.service';
import { MatchFoundResponse, MatchRequest } from './dto/request.dto';

@Injectable()
export class MatchingWebSocketGateway {
  constructor(private readonly matchingWebSocketService: MatchingWebSocketService) {}

  init(server: Server) {
    const io = new WebSocketServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    io.on('connection', (client) => this.onConnect(client));
  }

  private onConnect(client: Socket) {
    const onMatchRequest = async (matchRequest: MatchRequest) => {
      const matchResponse = await this.matchingWebSocketService.addMatchRequest(client.id, matchRequest,
        (matchFound: MatchFoundResponse) => {
          client.emit('matchFound', matchFound);
          client.disconnect();
        },
        () => {
          client.emit('noMatchFound');
          client.disconnect();
        }
      )
      client.emit('matchRequestResponse', matchResponse);
      if (matchResponse.error) {
        client.disconnect();
      }
    }

    const onMatchCancel = async () => {
      await this.matchingWebSocketService.cancelMatchRequest(client.id)
      client.emit('matchCancelResponse', { message: 'Match request cancelled' });
      client.disconnect();
    }

    console.log('Client connected to Matching WebSocket');
    client.on('disconnect', () => this.onDisconnect(client));
    client.on('matchCancel', onMatchCancel);
    client.once('matchRequest', onMatchRequest);
  }

  private async onDisconnect(client: Socket) {
    console.log('Client disconnected');
    await this.matchingWebSocketService.cancelMatchRequest(client.id)
  }
}