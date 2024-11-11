import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionHistory, AttemptHistory } from '../schemas/history.schema';
import {
  QuestionHistoryService,
  AttemptHistoryService,
} from '../services/history.services';
import {
  CreateQuestionHistoryDto,
  UpdateQuestionHistoryDto,
  CreateAttemptHistoryDto,
  UpdateAttemptHistoryDto,
} from '../dto/history.dto';

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

  @Get('student/:studentId/room/:roomId')
  async findByStudentIdAndRoomId(
    @Param('studentId') studentId: string,
    @Param('roomId') roomId: string,
  ): Promise<QuestionHistory> {
    return this.questionHistoryService.findByStudentIdAndRoomId(
      studentId,
      roomId,
    );
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

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateQuestionHistoryDto: UpdateQuestionHistoryDto,
  ): Promise<QuestionHistory> {
    return this.questionHistoryService.update(id, updateQuestionHistoryDto);
  }
}

@Controller('history/attempts')
@ApiTags('history/attempts')
export class AttemptHistoryController {
  constructor(private readonly attemptHistoryService: AttemptHistoryService) {}

  @Get('student/:studentId')
  async findAllByStudentId(
    @Param('studentId') studentId: string,
  ): Promise<AttemptHistory[]> {
    const attempts =
      await this.attemptHistoryService.findAllByStudentId(studentId);
    attempts.sort(
      (a, b) =>
        new Date(b.timeAttempted).getTime() -
        new Date(a.timeAttempted).getTime(),
    );
    return this.attemptHistoryService.findAllByStudentId(studentId);
  }

  @Get('student/:studentId/question/:questionId')
  async findAllByStudentIdAndQuestionId(
    @Param('studentId') studentId: string,
    @Param('questionId') questionId: string,
  ): Promise<AttemptHistory[]> {
    return this.attemptHistoryService.findAllByStudentIdAndQuestionId(
      studentId,
      questionId,
    );
  }

  @Get('student/:studentId/room/:roomId')
  async findAllByStudentIdAndRoomId(
    @Param('studentId') studentId: string,
    @Param('roomId') roomId: string,
  ): Promise<AttemptHistory[]> {
    return this.attemptHistoryService.findAllByStudentIdAndRoomId(
      studentId,
      roomId,
    );
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createAttemptHistoryDto: CreateAttemptHistoryDto,
  ): Promise<AttemptHistory> {
    return this.attemptHistoryService.create(createAttemptHistoryDto);
  }

  @Get()
  async findAll(): Promise<AttemptHistory[]> {
    return this.attemptHistoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AttemptHistory> {
    return this.attemptHistoryService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<AttemptHistory> {
    return this.attemptHistoryService.remove(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateAttemptHistoryDto: UpdateAttemptHistoryDto,
  ): Promise<AttemptHistory> {
    return this.attemptHistoryService.update(id, updateAttemptHistoryDto);
  }
}
