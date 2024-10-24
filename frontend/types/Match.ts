import { QuestionComplexity } from "./Question";
import { QuestionTopic } from "./Question";

export type MatchRequest = {
  userId: string;
  topic: QuestionTopic;
  difficulty: QuestionComplexity;
  timestamp: number;
};

export type MatchRequestResponse = {
  message: string;
  error?: string;
  expiry?: number;
};

export type MatchFoundResponse = {
  matchedWithUserId: string;
  matchedTopic: string;
  matchedRoom: string;
};

export type MatchResult = {
  result: 'success' | 'timeout' | 'error';
  error?: string;
  matchFound?: MatchFoundResponse;
}
