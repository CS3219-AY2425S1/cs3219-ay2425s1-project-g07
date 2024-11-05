import * as Y from 'yjs';

export interface Room {
    id: string;
    users: Set<string>;
    question: Question;
    doc: Y.Doc;
    user1: string;
    user2: string;
}

export class RoomResponse {
    id: string;
    users: string[];
    question: Question;
    doc: string;
}

export interface Question {
    _id: string;
    topics: string[];
    complexity: string;
    title: string,
    description: string,
    link: string
}

