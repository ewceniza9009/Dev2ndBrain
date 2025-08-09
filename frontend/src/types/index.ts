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
  isCollapsed?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
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
  isDeleted?: boolean;
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
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface Deck {
  id?: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface AiReview {
  id?: number;
  deckId: number;
  deckName: string;
  feedback: string;
  timestamp: Date;
}

export interface Template {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
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

export interface SearchDocument {
  id: string;
  type: 'note' | 'snippet' | 'flashcard' | 'project';
  title: string;
  content?: string;
  tags: string[];
  deckId?: number;
}

export interface CanvasItem {
  id: string;
  type: 'annotation' | 'shape' | 'table' | 'icon' | 'textbox';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  shape?: 'rectangle' | 'circle' | 'triangle';
  icon?: string;
  color?: string;
  content?: string[][];
  tag: string;
  zIndex?: number;
  columnWidths?: number[];
  rowHeights?: number[];
}

export interface Edge {
  start: string;
  end: string;
}

export interface AnnotationState {
  items: CanvasItem[];
  edges: Edge[];
}

export interface AnnotationRecord {
  filterCriteria: string;
  state: AnnotationState;
}

export interface Goal {
    text: string;
}

export interface NextStep {
    text: string;
}

export interface ProjectFeature {
    id: string;
    name: string;
    type: 'New Feature' | 'Enhancement' | 'Bug' | 'Backlog';
    status: 'Planned' | 'In Progress' | 'Completed';
    description: string;
}

export interface ProjectResource {
    id: string;
    type: 'Note' | 'Snippet' | 'External Link';
    link: string; // Note ID, Snippet ID, or URL
    description: string;
}

export interface HistoryEntry {
    timestamp: Date;
    actionType: 'Added' | 'Updated' | 'Deleted';
    field: string;
    oldValue?: string; // JSON string
    newValue?: string; // JSON string
}

export interface Project {
    id?: number;
    title: string;
    description: string;
    goals: Goal[];
    nextSteps: NextStep[];
    features: ProjectFeature[];
    resources: ProjectResource[];
    history: HistoryEntry[];
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
}