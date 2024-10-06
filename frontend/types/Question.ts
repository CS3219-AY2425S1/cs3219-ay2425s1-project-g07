
export enum QuestionComplexity {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum QuestionTopic {
    ARRAY = 'array',
    BINARY = "binary",
    BINARY_SEARCH = "binary_search",
    BINARY_SEARCH_TREE = "binary_search_tree",
    BINARY_TREE = "binary_tree",
    DYNAMIC_PROGRAMMING = "dynamic_programming",
    GRAPH = "graph",
    GREEDY = "greedy",
    HASH_TABLE = "hash_table",
    HEAP = "heap",
    LINKED_LIST = "linked_list",
    MATH = "math",
    MATRIX = "matrix",
    QUEUE = "queue",
    RECURSION = "recursion",
    SORTING = "sorting",
    STACK = "stack",
    STRING = "string",
    TRIE = "trie"
}

export type Question = {
    _id?: string; // TODO: Remove optional 
    title: string;
    description: string;
    topics: QuestionTopic[];
    complexity: QuestionComplexity;
    link: string;
}
