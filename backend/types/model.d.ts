export interface Item {
    PK: string;
    SK: string;
    Type: string;
    createdAt: string;
    [key: string]: any;
}

export interface User {
    userId: string;
    email?: string;
}

export interface UserProfile {
    name?: string;
    preferences?: Record<string, any>;
}

export interface Collection {
    collectionId: string;
    collectionName: string;
    items: string[];
}

export interface RequestHistory {
    requestId?: string;
    url: string;
    method: string;
    body?: any;
    response?: any;
}
