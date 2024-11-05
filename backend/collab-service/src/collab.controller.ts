import { Controller, Get, Param } from '@nestjs/common';
import { CollabService } from './services/collab.service';

@Controller()
export class CollabController {
    
    constructor(private readonly collabService: CollabService) {}

    @Get('rooms')
    async getAllRooms() {
        return this.collabService.getAllRooms();
    }

    @Get('rooms/:id')
    async getRoomById(@Param('id') id: string) {
        return this.collabService.getRoom(id);
    }

}

