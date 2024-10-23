import * as Y from 'yjs';

export interface Room {
    id: string;
    users: Set<string>;
    questionId: string,
    doc: Y.Doc;
}

export class RoomResponse {
    id: string;
    users: string[];
    questionId: string;
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

