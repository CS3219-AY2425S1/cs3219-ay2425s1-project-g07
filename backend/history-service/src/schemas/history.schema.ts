import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class QuestionHistory {
  @Prop()
  studentId: string;

  @Prop()
  questionId: string;

  @Prop()
  roomId: string;

  @Prop()
  questionTitle: string;

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

@Schema()
export class AttemptHistory {
  @Prop()
  studentId: string;

  @Prop()
  questionId: string;

  @Prop()
  roomId: string;

  @Prop()
  timeAttempted: Date;

  @Prop()
  programmingLanguage: string;

  @Prop()
  attemptCode: string;
}

export type AttemptHistoryDocument = AttemptHistory & Document;

export const AttemptHistorySchema =
  SchemaFactory.createForClass(AttemptHistory);
