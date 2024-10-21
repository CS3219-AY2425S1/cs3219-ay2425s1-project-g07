import { QuestionComplexity } from "./Question";
import { QuestionTopic } from "./Question";

//declaring an any value separately to increase decoupling as the any value is only
//specific to matching service and not Question Service.
export const ANY_TOPIC = "any";

export type MatchRequest = {
  userId: string;
  topic: QuestionTopic | typeof ANY_TOPIC;
  difficulty: QuestionComplexity;
  timestamp: number;
};

export type MatchResponse = {
  message: string;
  error?: string;
};

export type MatchStatus = "PENDING" | "MATCHED" | "CANCELLED" | "NONE";

//TODO: request to standarise the responses to be sent by the backend

export type CheckMatchResponse = {
  userId: string;
  status: MatchStatus;
  topic: string;
  matchedWithUserId: string;
  matchedTopic: string;
  matchedRoom: string;
  createTime: number;
  expiryTime: number;
};

export type CheckMatchResponseError = {
  status: "NONE";
  message: string;
};
