import { QuestionHistory } from "@/types/History";
import axios from "axios";

const base_url = process.env.NEXT_PUBLIC_HISTORY_SERVICE_DOMAIN  || process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || "http://localhost:8090";

const axiosInstance = axios.create({ baseURL: base_url });

export const getQuestionHistory = async (
  studentId: string
): Promise<QuestionHistory[]> => {
  try {
    const response = await axiosInstance.get(
      `/history/questions/student/${studentId}`
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

export const addHistory = async (history: QuestionHistory) => {
  try {
    await axiosInstance.post("/history/questions", history);
  } catch (error) {
    console.error("Error adding history:", error);
    throw error;
  }
};
