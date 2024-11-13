export type QuestionHistory = {
  studentId: string;
  questionId: string;
  roomId: string;
  questionTitle: string;
  questionDifficulty: string;
  questionTopics: string[];
  collaboratorId: string;
  timeAttempted: Date;
  timeCreated: Date;
};

export type AttemptHistory = {
  studentId: string;
  questionId: string;
  roomId: string;
  timeAttempted: Date;
  programmingLanguage: string;
  attemptCode: string;
};
