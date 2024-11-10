import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  QuestionHistory,
  QuestionHistoryDocument,
  AttemptHistory,
  AttemptHistoryDocument,
} from '../schemas/history.schema';
import {
  CreateQuestionHistoryDto,
  UpdateQuestionHistoryDto,
  CreateAttemptHistoryDto,
  UpdateAttemptHistoryDto,
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

  async findByStudentIdAndRoomId(
    studentId: string,
    roomId: string,
  ): Promise<QuestionHistory> {
    const questionHist = await this.questionHistoryModel
      .findOne({
        studentId,
        roomId,
      })
      .exec();

    if (!questionHist) {
      throw new NotFoundException(
        `QuestionHistory with roomID ${roomId} by student ${studentId} not found. Result ${questionHist}`,
      );
    }
    return questionHist;
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

@Injectable()
export class AttemptHistoryService {
  constructor(
    @InjectModel(AttemptHistory.name)
    private attemptHistoryModel: Model<AttemptHistoryDocument>,
  ) {}

  async create(
    createAttemptHistoryDto: CreateAttemptHistoryDto,
  ): Promise<AttemptHistory> {
    const createdAttemptHistory = new this.attemptHistoryModel(
      createAttemptHistoryDto,
    );
    try {
      return await createdAttemptHistory.save();
    } catch (error) {
      console.error('Error creating attempt history:', error);
      throw error;
    }
  }

  async findAll(): Promise<AttemptHistory[]> {
    return this.attemptHistoryModel.find().exec();
  }

  async findAllByStudentId(studentId: string): Promise<AttemptHistory[]> {
    return this.attemptHistoryModel.find({ studentId }).exec();
  }

  async findOne(id: string): Promise<AttemptHistory> {
    const attemptHistory = await this.attemptHistoryModel.findById(id).exec();
    if (!attemptHistory) {
      throw new NotFoundException(`AttemptHistory with ID ${id} not found`);
    }
    return attemptHistory;
  }

  async update(
    id: string,
    updateAttemptHistoryDto: UpdateAttemptHistoryDto,
  ): Promise<AttemptHistory> {
    return this.attemptHistoryModel
      .findByIdAndUpdate(id, updateAttemptHistoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<AttemptHistory> {
    return this.attemptHistoryModel.findByIdAndDelete(id).exec();
  }

  async findAllByStudentIdAndRoomId(
    studentId: string,
    roomId: string,
  ): Promise<AttemptHistory[]> {
    return this.attemptHistoryModel
      .find({ studentId, roomId })
      .sort({ timeAttempted: -1 })
      .exec();
  }

  async findAllByStudentIdAndQuestionId(
    studentId: string,
    questionId: string,
  ): Promise<AttemptHistory[]> {
    return this.attemptHistoryModel
      .find({ studentId, questionId })
      .sort({ timeAttempted: -1 })
      .exec();
  }
}
