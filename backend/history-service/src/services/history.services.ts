import { Injectable, NotFoundException } from '@nestjs/common';
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
    const createdQuestionHistory = new this.questionHistoryModel(
      createQuestionHistoryDto,
    );
    return createdQuestionHistory.save();
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
