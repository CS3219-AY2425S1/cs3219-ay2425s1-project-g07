import { Question } from './Question';

export type Room = {
    id: string,
    users: string[],
    question: Question,
    doc: string
}