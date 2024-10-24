import * as Y from 'yjs';

export interface Room {
    id: string;
    users: Set<string>;
    doc: Y.Doc;
}

export class RoomResponse {
    id: string;
    users: string[];
    doc: string;
}
