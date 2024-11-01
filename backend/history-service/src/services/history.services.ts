import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  QuestionHistory,
  QuestionHistoryDocument,
} from '../schemas/history.schema';
import {
  CreateQuestionHistoryDto,
  UpdateQuestionHistoryDto,
} from 'src/dto/history.dto';
import { Model } from 'mongoose';

@Injectable()
export class QuestionHistoryService {
  constructor(
    @InjectModel(QuestionHistory.name)
    private questionHistoryModel: Model<QuestionHistoryDocument>,
  ) {}

  async create(
    createQuestionHistoryDto: CreateQuestionHistoryDto,
  ): Promise<QuestionHistory> {
    const { roomId, studentId } = createQuestionHistoryDto;

    // Check for existing record with the same roomId and studentId
    const existingRecord = await this.questionHistoryModel
      .findOne({ roomId, studentId })
      .exec();
    if (existingRecord) {
      throw new ConflictException('Duplicate roomId and studentId combination');
    }

    const createdQuestionHistory = new this.questionHistoryModel(
      createQuestionHistoryDto,
    );
    try {
      return await createdQuestionHistory.save();
    } catch (error) {
      console.error('Error creating question history:', error);
      throw error;
    }
  }

  async findAll(): Promise<QuestionHistory[]> {
    return this.questionHistoryModel.find().exec();
  }

  async findAllByStudentId(studentId: string): Promise<QuestionHistory[]> {
    return this.questionHistoryModel.find({ studentId }).exec();
  }

  async findOne(id: string): Promise<QuestionHistory> {
    const questionHistory = await this.questionHistoryModel.findById(id).exec();
    if (!questionHistory) {
      throw new NotFoundException(`QuestionHistory with ID ${id} not found`);
    }
    return questionHistory;
  }

  async update(
    id: string,
    updateQuestionHistoryDto: UpdateQuestionHistoryDto,
  ): Promise<QuestionHistory> {
    return this.questionHistoryModel
      .findByIdAndUpdate(id, updateQuestionHistoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<QuestionHistory> {
    return this.questionHistoryModel.findByIdAndDelete(id).exec();
  }
}
