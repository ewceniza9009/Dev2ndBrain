export const IconType = {
  Circle: 'circle',
  Square: 'square',
} as const;

export const IconColor = {
  Primary: '#14B8A6',
  Secondary: '#FFD700',
} as const;

export interface Note {
  id?: number;
  uuid: string;
  title: string;
  content: string;
  tags: string[];
  linkedNoteIds: string[];
  iconType?: typeof IconType[keyof typeof IconType];
  iconColor?: typeof IconColor[keyof typeof IconColor];
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Snippet {
  id?: number;
  title: string;
  language: string;
  code: string;
  tags: string[];
  gistId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id?: number;
  deckId: number;
  question: string;
  answer: string;
  nextReview: Date;
  easeFactor: number;
  repetitions: number;
  interval: number;
}

export interface Deck {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatarUrl: string;
  name: string;
}

export interface EncryptedData {
  iv: string;
  encryptedToken: string;
}