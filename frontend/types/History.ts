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
