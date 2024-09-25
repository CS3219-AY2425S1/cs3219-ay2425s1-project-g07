import axios from 'axios';
import { Question } from '../types/Question';

export const fetchQuestions = async () => {
  return await axios.get<Question[]>('http://localhost:8000/api/question')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching questions:', error);
      return [];
    });
};

export const createQuestion = async (question: Question) => {
  return await axios.post<Question>('http://localhost:8000/api/question', question)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating question:', error);
    });
};

export const deleteQuestion = async (id: string) => {
  return await axios.delete(`http://localhost:8000/api/question/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting question:', error);
    });
};