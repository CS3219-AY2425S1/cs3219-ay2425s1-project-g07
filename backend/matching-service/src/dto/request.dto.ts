import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsEnum,
} from 'class-validator';

// Copied from question-service
enum QuestionTopic {
    ARRAY = 'array',
    BINARY = "binary",
    BINARY_SEARCH = "binary_search",
    BINARY_SEARCH_TREE = "binary_search_tree",
    BINARY_TREE = "binary_tree",
    DYNAMIC_PROGRAMMING = "dynamic_programming",
    GRAPH = "graph",
    GREEDY = "greedy",
    HASH_TABLE = "hash_table",
    HEAP = "heap",
    LINKED_LIST = "linked_list",
    MATH = "math",
    MATRIX = "matrix",
    QUEUE = "queue",
    RECURSION = "recursion",
    SORTING = "sorting",
    STACK = "stack",
    STRING = "string",
    TRIE = "trie"
}

enum QuestionComplexity {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export class MatchRequestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly userId: string;

    @ApiProperty()
    @IsEnum(QuestionTopic)
    @IsNotEmpty()
    readonly topic: QuestionTopic;

    @ApiProperty()
    @IsEnum(QuestionComplexity)
    @IsNotEmpty()
    readonly difficulty: QuestionComplexity;

    @ApiProperty()
    @IsNumber() // can be string if we want
    @IsNotEmpty()
    readonly timestamp: number;
}


