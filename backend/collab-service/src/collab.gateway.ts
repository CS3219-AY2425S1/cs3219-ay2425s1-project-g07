import { Injectable, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { Server } from 'http';
import * as WebSocket from 'ws';
import { CollabService } from './services/collab.service';
const ywsUtils = require('y-websocket/bin/utils');
const setupWSConnection = ywsUtils.setupWSConnection;

@Injectable()
export class CollabGateway implements OnModuleInit {

  private server: Server;

  constructor(private readonly collabService: CollabService) {}

  onModuleInit() {
      this.initCollabServer();
  }

  initCollabServer() {
    const wss = new WebSocket.Server({ server: this.server });
    wss.on('connection', (ws: WebSocket, req: Request) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws: WebSocket, req: Request) {
    const { roomId, userId } = this.extractInfoFromUrl(req.url);
    if (!roomId || !userId) {
      ws.close();
      return;
    }

    // Join the room
    const room = this.collabService.joinRoom(roomId, userId);
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found or full' }));
      ws.close();
      return;
    }
    console.log(`User ${userId} joined room ${roomId}`);

    ws.on('close', () => {
      console.log(`User ${userId} left room ${roomId}`);
      this.collabService.leaveRoom(userId);
    })

    // Setup Yjs websocket
    const ydoc = room.doc;
    if (!ydoc) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      return;
    }
    setupWSConnection(ws, req, ydoc, { room: roomId });
  }

  setServer(server: Server) {
    this.server = server;
  }

  extractInfoFromUrl(url: string): { roomId: string, userId: string } {
    const match = url.match(/\/code\/(.*)$/);
    if (!match) {
      return { roomId: null , userId: null };
    }
    const [roomId, userIdParam] = match[1].split('?');
    const userId = userIdParam.split('=')[1];
    return { roomId, userId };
  }

}
