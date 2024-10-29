export type QuestionHistory = {
  studentId: string;
  questionId: string;
  questionDifficulty: string;
  questionTopics: string[];
  collaboratorId: string;
  timeAttempted: Date;
  timeCreated: Date;
};
