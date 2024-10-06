import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    IsArray,
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    ArrayNotEmpty,
} from 'class-validator';
import { QuestionComplexity, QuestionTopic } from '../schemas/question.schema';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(QuestionTopic, { each: true })
    readonly topics: QuestionTopic[];

    @ApiProperty()
    @IsEnum(QuestionComplexity)
    readonly complexity: QuestionComplexity;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly link: string;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) { }

export class FilterQuestionsDto {
    @ApiProperty()
    @IsEnum(QuestionComplexity)
    @IsOptional()
    readonly difficulty?: QuestionComplexity;

    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    @IsEnum(QuestionTopic, { each: true })
    readonly topics: QuestionTopic[];
}
