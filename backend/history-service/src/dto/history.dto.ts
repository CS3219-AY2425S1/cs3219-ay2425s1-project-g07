import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly studentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly questionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly roomId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  questionTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly questionDifficulty: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  readonly questionTopics: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readonly collaboratorId?: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly timeAttempted: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly timeCreated: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly timeCompleted?: Date | null;
}

export class UpdateQuestionHistoryDto extends CreateQuestionHistoryDto {}

export class UpdateUserRecordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly oldUsername: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly newUsername: string;
}

export class CreateAttemptHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly studentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly questionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly roomId: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly timeAttempted: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly programmingLanguage: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly attemptCode: string;
}

export class UpdateAttemptHistoryDto extends CreateAttemptHistoryDto {}
