import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Y from 'yjs';
import { Room, RoomResponse } from '../interfaces/room.interface';
import axios from 'axios';
import { Question } from '../interfaces/room.interface';

@Injectable()
export class CollabService {
  private rooms: Map<string, Room> = new Map(); // roomId -> Room
  private userRooms: Map<string, string> = new Map(); // userId -> roomId

  constructor(private configService: ConfigService) {
    this.cleanUpEmptyRooms();
    // Create a default room for testing
    this.createRoom('default', 'any', 'any');
  }

  async createRoom(roomId: string, topic: string, difficulty: string): Promise<RoomResponse> {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId);
      return {
        id: room.id,
        users: Array.from(room.users),
        question: room.question,
        doc: room.doc.guid
      };
    }

    const question = await this.getQuestion(topic, difficulty);
    if (!question) {
      return null
    }

    const room: Room = {
      id: roomId,
      users: new Set(),
      question: question,
      doc: new Y.Doc()
    };

    this.rooms.set(roomId, room);
    console.log("Room created: ", room.id);
    return {
        id: room.id,
        users: Array.from(room.users),
        question: room.question,
        doc: room.doc.guid
    };
  }

  joinRoom(roomId: string, userId: string): RoomResponse | null {
    const room = this.rooms.get(roomId);
    
    if (!room || room.users.size >= 2) {
      return null;
    }

    room.users.add(userId);
    this.rooms.set(roomId, room);
    this.userRooms.set(userId, roomId);
    return {
        id: room.id,
        users: Array.from(room.users),
        question: room.question,
        doc: room.doc.guid
    };
  }

  leaveRoom(userId: string): RoomResponse | null {
    const roomId = this.userRooms.get(userId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.users.delete(userId);
    this.rooms.set(roomId, room);
    this.userRooms.delete(userId);

    return {
        id: room.id,
        users: Array.from(room.users),
        question: room.question,
        doc: room.doc.guid
    };
  }

  getAllRooms(): RoomResponse[] {
    return Array.from(this.rooms.values()).map(room => ({
        id: room.id,
        users: Array.from(room.users),
        question: room.question,
        doc: room.doc.guid
    }));
  }

  getAvailableRooms() {
    return Array.from(this.rooms.values())
      .filter(room => room.users.size < 2)
      .map(room => ({
        id: room.id,
        users: Array.from(room.users),
        doc: room.doc.guid
      }));
  }

  getRoom(roomId: string): RoomResponse | null {
    const room = this.rooms.get(roomId);
    return room ? 
        {
            id: room.id,
            users: Array.from(room.users),
            question: room.question,
            doc: room.doc.guid
        } : null;
  }

  getRoomByClient(userId: string): RoomResponse | null {
    const roomId = this.userRooms.get(userId);
    if (roomId) {
        const room = this.rooms.get(roomId);
        return {
            id: room.id,
            users: Array.from(room.users),
            question: room.question,
            doc: room.doc.guid
        };
    }
    return null;
  }

  private cleanUpEmptyRooms() {
    setInterval(() => {
      this.rooms.forEach((room, roomId) => {
        if (room.users.size === 0 && roomId !== 'default') {
          console.log(`Cleaning up room ${roomId}`);
          this.rooms.delete(roomId);
        }
      });
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  }

  private async getQuestion(topic: string, difficulty: string): Promise<Question> {
    let queryTopic: string, queryDifficulty: string;
    if (topic != 'any') {
        queryTopic = topic;
    }
    if (difficulty != 'any') {
        queryDifficulty = difficulty;
    }
    const questionServiceUrl = this.configService.get('QUESTION_SERVICE_DOMAIN');
    const response = await axios.get(`${questionServiceUrl}/question/random`, {
      params: { topic: queryTopic, difficulty: queryDifficulty }
    });
    return response.data as Question;
  }

}
