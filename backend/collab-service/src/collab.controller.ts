import {
    Body,
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common';
import { CollabService } from './services/collab.service';

@Controller()
export class CollabController {
    
    constructor(private readonly collabService: CollabService) {}

    @Get('rooms')
    async getAllRooms() {
        return this.collabService.getAllRooms();
    }

    @Post('rooms/:id')
    async getRoomById(@Param('id') id: string, @Body() userId: { userId: string }) {
        return this.collabService.getRoom(id, userId.userId);
    }

}

