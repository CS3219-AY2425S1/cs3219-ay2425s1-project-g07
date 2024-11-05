import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Y from 'yjs';
import { Room, RoomResponse } from '../interfaces/room.interface';
import axios from 'axios';
import { Question } from '../interfaces/room.interface';
import { Consumer, Kafka } from 'kafkajs';

type MatchMessage = {
  userId1: string;
  userId2: string;
  matchedTopic: string;
  matchedRoom: string;
}

@Injectable()
export class CollabService implements OnModuleInit {
  private rooms: Map<string, Room> = new Map(); // roomId -> Room
  private userRooms: Map<string, string> = new Map(); // userId -> roomId

  private readonly kafkaBrokerUri: string;
  private readonly consumerGroupId: string;
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(private configService: ConfigService) {
    this.cleanUpEmptyRooms();

    this.kafkaBrokerUri = this.getKafkaBrokerUri();
    this.consumerGroupId = this.getConsumerGroupId();
    this.kafka = new Kafka({
      clientId: 'collab-service',
      brokers: [this.kafkaBrokerUri],
    });
    this.consumer = this.kafka.consumer({ groupId: this.consumerGroupId });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.subscribeToTopics();
    // Consume message loop
    this.consumeMessages();
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({ topics: ['matches'] });
  }

  private consumeMessages() {
    this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const messageString = message.value.toString();
        const messageBody = JSON.parse(messageString);

        console.log(`Received message from topic ${topic}:`, messageBody);

        if (topic === 'matches') {
          const matchMessage = messageBody as MatchMessage;
          const [difficulty, topic] = matchMessage.matchedTopic.split('-');
          this.createRoom(matchMessage.matchedRoom, topic, difficulty, matchMessage.userId1, matchMessage.userId2);
        }
      },
    })
  }

  async createRoom(roomId: string, topic: string, difficulty: string, user1: string, user2: string): Promise<RoomResponse> {
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
      doc: new Y.Doc(),
      user1: user1,
      user2: user2
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
    
    if (!this.isValidRoomForUser(room, userId)) {
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

  getRoom(roomId: string, userId: string): RoomResponse | null {
    const room = this.rooms.get(roomId);

    if (!this.isValidRoomForUser(room, userId)) {
      console.log("Invalid room", room.id, "for", userId)
      return null;
    }

    return room ? 
        {
            id: room.id,
            users: Array.from(room.users),
            question: room.question,
            doc: room.doc.guid
        } : null;
  }

  isValidRoomForUser(room: Room, userId: string): boolean {
    return room && room.users.size < 2 && (room.user1 === userId || room.user2 === userId);
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

  private getKafkaBrokerUri(): string {
    return this.configService.get<string>('config.kafkaBrokerUri');
  }

  private getConsumerGroupId(): string {
    return this.configService.get<string>('config.consumerGroupId');
  }
}
