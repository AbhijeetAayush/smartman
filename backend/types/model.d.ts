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