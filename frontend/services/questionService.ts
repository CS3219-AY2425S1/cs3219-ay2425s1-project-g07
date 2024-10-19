import axios from 'axios';
import { AxiosError } from 'axios';
import { Question } from '../types/Question';

export const fetchQuestions = async () => {
  try {
    const response = await axios.get<Question[]>('http://localhost:8001/question');
    return { data: response.data, error: null };
  } catch (err: AxiosError | any) {
    console.error('Error fetching questions:', err);
    return { data: null, error: err.response?.data }; 
  }
};

export const createQuestion = async (question: Question) => {
  return await axios.post<Question>('http://localhost:8001/question', question)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating question:', error);
      throw error;
    });
};

export const deleteQuestion = async (id: string) => {
  return await axios.delete(`http://localhost:8001/question/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting question:', error);
    });
};

export const updateQuestion = async (id: string, question: Question) => {
  return await axios.put<Question>(`http://localhost:8001/question/${id}`, question)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating question:', error);
      throw error;
    });
};

export const getQuestionById = async (id: string) => {
  return await axios.get<Question>(`http://localhost:8001/question/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching question by id:', error);
    });
};
