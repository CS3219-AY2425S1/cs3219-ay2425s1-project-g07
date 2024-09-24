import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, Param, Put, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto, UpdateQuestionDto, FilterQuestionsDto } from '../dto/question.dto';
import { Question } from '../schemas/question.schema';

@ApiTags('question')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @ApiOperation({ summary: 'Create a new question' })
    @ApiResponse({ status: 201, type: Question })
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createQuestionDto: CreateQuestionDto): Promise<Question> {
        return this.questionService.create(createQuestionDto);
    }

    @ApiOperation({ summary: 'Get all questions' })
    @ApiResponse({ status: 200, type: [Question] })
    @Get()
    async findAll(): Promise<Question[]> {
        return this.questionService.findAll();
    }

    @ApiOperation({ summary: 'Get a random question based on filter criteria' })
    @ApiResponse({ status: 200, type: Question })
    @Get('random')
    @UsePipes(new ValidationPipe({ transform: true }))
    async getRandomQuestion(@Query() filterQuestionsDto: FilterQuestionsDto): Promise<Question | null> {
        return this.questionService.getRandomQuestion(filterQuestionsDto);
    }

    @ApiOperation({ summary: 'Filter questions by difficulty and topics' })
    @ApiResponse({ status: 200, type: [Question] })
    @Get('filter')
    @UsePipes(new ValidationPipe({ transform: true }))
    async filterQuestions(@Query() filterQuestionsDto: FilterQuestionsDto): Promise<Question[]> {
        return this.questionService.filterQuestions(filterQuestionsDto);
    }

    @ApiOperation({ summary: 'Get a question by id' })
    @ApiResponse({ status: 200, type: Question })
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Question> {
        return this.questionService.findOne(id);
    }

    @ApiOperation({ summary: 'Update a question by id' })
    @ApiResponse({ status: 200, type: Question })
    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto): Promise<Question> {
        return this.questionService.update(id, updateQuestionDto);
    }

    @ApiOperation({ summary: 'Delete a question by id' })
    @ApiResponse({ status: 200, type: Question })
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<Question> {
        return this.questionService.delete(id);
    }
}
