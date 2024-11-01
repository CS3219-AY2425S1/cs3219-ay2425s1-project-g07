import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionHistory } from 'src/schemas/history.schema';
import { QuestionHistoryService } from 'src/services/history.services';
import {
  CreateQuestionHistoryDto,
  UpdateQuestionHistoryDto,
} from 'src/dto/history.dto';

@Controller('history/questions')
@ApiTags('history/questions')
export class QuestionHistoryController {
  constructor(
    private readonly questionHistoryService: QuestionHistoryService,
  ) {}

  @Get('student/:studentId')
  async findAllByStudentId(
    @Param('studentId') studentId: string,
  ): Promise<QuestionHistory[]> {
    return this.questionHistoryService.findAllByStudentId(studentId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createQuestionHistoryDto: CreateQuestionHistoryDto,
  ): Promise<QuestionHistory> {
    return this.questionHistoryService.create(createQuestionHistoryDto);
  }

  @Get()
  async findAll(): Promise<QuestionHistory[]> {
    return this.questionHistoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<QuestionHistory> {
    return this.questionHistoryService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<QuestionHistory> {
    return this.questionHistoryService.remove(id);
  }
}
