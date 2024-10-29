import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class QuestionHistory {
  @Prop()
  studentId: string;

  @Prop()
  questionId: string;

  @Prop()
  questionDifficulty: string;

  @Prop()
  questionTopics: string[];

  @Prop()
  collaboratorId: string;

  @Prop()
  timeAttempted: Date;

  @Prop()
  timeCreated: Date;
}

export type QuestionHistoryDocument = QuestionHistory & Document;

export const QuestionHistorySchema =
  SchemaFactory.createForClass(QuestionHistory);
