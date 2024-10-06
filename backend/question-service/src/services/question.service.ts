import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateQuestionDto, UpdateQuestionDto, FilterQuestionsDto } from '../dto/question.dto';
import { Question, QuestionDocument } from '../schemas/question.schema';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name)
        private questionModel: Model<QuestionDocument> 
    ) {}

    async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
        if (await this.hasQuestionWithTitle(createQuestionDto.title)) {
            throw new ConflictException(`Question with title already exists`);
        }
        const createdQuestion = new this.questionModel(createQuestionDto);
        return createdQuestion.save();
    }

    async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
        this.validateMongoId(id);
        if (updateQuestionDto.title && await this.hasQuestionWithTitleExceptId(updateQuestionDto.title, id)) {
            throw new ConflictException(`Question with title already exists`);
        }
        const updatedQuestion = await this.questionModel.findByIdAndUpdate(id, updateQuestionDto, { new: true }).exec();
        if (!updatedQuestion) {
            throw new NotFoundException(`Question with id ${id} not found`);
        }
        return updatedQuestion;
    }

    async findAll(): Promise<Question[]> {
        return this.questionModel.find();
    }

    async findOne(id: string): Promise<Question> {
        this.validateMongoId(id);
        const question = await this.questionModel.findById(id).exec();
        if (!question) {
            throw new NotFoundException(`Question with id ${id} not found`);
        }
        return question;
    }

    async delete(id: string): Promise<Question> {
        this.validateMongoId(id);
        const question = await this.questionModel.findByIdAndDelete(id).exec();
        if (!question) {
            throw new NotFoundException(`Question with id ${id} not found`);
        }
        return question;
    }

    async filterQuestions(filterQuestionsDto: FilterQuestionsDto): Promise<Question[]> {
        const { difficulty, topics } = filterQuestionsDto;
        const filter: any = {};
        if (difficulty) {
          filter.complexity = difficulty;
        }
        if (topics && topics.length > 0) {
          filter.topics = { $in: topics };
        }
        return this.questionModel.find(filter).exec();
    }

    async getRandomQuestion(filterQuestionsDto: FilterQuestionsDto): Promise<Question | null> {
        const { difficulty, topics } = filterQuestionsDto;
        const filter: any = {};
        if (difficulty) {
          filter.complexity = difficulty;
        }
        if (topics && topics.length > 0) {
          filter.topics = { $in: topics };
        }
        // Use MongoDB's aggregation pipeline to match filters and return one random question
        const result = await this.questionModel.aggregate([
          { $match: filter },          // Step 1: Apply filtering
          { $sample: { size: 1 } },    // Step 2: Randomly sample one question
        ]).exec();
    
        return result.length > 0 ? result[0] : []; // Return the random question or empty array if none found
    }

    async hasQuestionWithTitle(title: string): Promise<boolean> {
        const res = await this.questionModel.findOne({
          title: title
        }).exec();

        return res !== null && res !== undefined;
    }

    async hasQuestionWithTitleExceptId(title: string, id: string): Promise<boolean> {
        const res = await this.questionModel.findOne({
            title: title,
            _id: { $ne: id }
        }).exec();

        return res !== null && res !== undefined;
    }

    validateMongoId(id: string) {
        if (!isValidObjectId(id)) {
          throw new NotFoundException(`Question with id ${id} not found`);
        }
    }

      // TODO: Link the question service to the user service
      //       to keep track of the questions attempted by the user

}
