export interface UserInfo {
  name: string;
  appearance: string;
  age: number;
  background: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastUpdate: number;
  userInfo: UserInfo;
  inventory: string[];
  customCharacters?: CustomSideCharacter[];
  notebookEvents?: string[];
}

export interface SideCharacter {
  name: string;
  description: string;
  role: string;
  gender: string;
}

export interface CustomSideCharacter extends SideCharacter {
  birthDate: string;
  appearance: string;
  personality: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  price: string;
}
