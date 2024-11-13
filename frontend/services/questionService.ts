import axios from 'axios';
import { AxiosError } from 'axios';
import { Question } from '../types/Question';

const baseDomain = process.env.NEXT_PUBLIC_QUESTION_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || "http://localhost:8001"

export const fetchQuestions = async () => {
  try {
    const response = await axios.get<Question[]>(`${baseDomain}/question`);
    return { data: response.data, error: null };
  } catch (err: AxiosError | any) {
    console.error('Error fetching questions:', err);
    return { data: null, error: err.response?.data }; 
  }
};

export const createQuestion = async (question: Question) => {
  return await axios.post<Question>(`${baseDomain}/question`, question)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating question:', error);
      throw error;
    });
};

export const deleteQuestion = async (id: string) => {
  return await axios.delete(`${baseDomain}/question/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting question:', error);
    });
};

export const updateQuestion = async (id: string, question: Question) => {
  return await axios.put<Question>(`${baseDomain}/question/${id}`, question)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating question:', error);
      throw error;
    });
};

export const getQuestionById = async (id: string) => {
  return await axios.get<Question>(`${baseDomain}/question/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching question by id:', error);
    });
};
