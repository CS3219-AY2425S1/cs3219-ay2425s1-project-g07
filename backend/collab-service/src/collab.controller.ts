import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CollabService } from './services/collab.service';

@Controller()
export class CollabController {
    
    constructor(private readonly collabService: CollabService) {}

    @Post('create-room')
    async createRoom(@Body() body: { roomId: string, topic: string, difficulty: string }) {
        return this.collabService.createRoom(body.roomId, body.topic, body.difficulty);
    }

    @Get('rooms')
    async getAllRooms() {
        return this.collabService.getAllRooms();
    }

    @Get('rooms/:id')
    async getRoomById(@Param('id') id: string) {
        return this.collabService.getRoom(id);
    }

}

