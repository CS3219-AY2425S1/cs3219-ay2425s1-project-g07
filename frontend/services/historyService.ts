import { QuestionHistory } from "@/types/History";
import axios from "axios";

const base_url = "http://localhost:8090/";

const axiosInstance = axios.create({ baseURL: base_url });

export const getQuestionHistory = async (
  studentId: string
): Promise<QuestionHistory[]> => {
  try {
    const response = await axiosInstance.get(
      `history/questions/student/${studentId}`
    );

    const questionHistory = response.data.map((item: any) => ({
      ...item,
      timeAttempted: new Date(item.timeAttempted),
      timeCreated: new Date(item.timeCreated),
    }));

    return questionHistory as QuestionHistory[];
  } catch (error) {
    console.error("Error getting history:", error);
    throw error;
  }
};

export const getEasyQuestions = async (
  studentId: string
): Promise<QuestionHistory[]> => {
  try {
    const response = await axiosInstance.get(
      `history/questions/student/${studentId}`
    );

    const questionHistory = response.data.map((item: any) => ({
      ...item,
      timeAttempted: new Date(item.timeAttempted),
      timeCreated: new Date(item.timeCreated),
    }));

    return questionHistory as QuestionHistory[];
  } catch (error) {
    console.error("Error getting history:", error);
    throw error;
  }
};
