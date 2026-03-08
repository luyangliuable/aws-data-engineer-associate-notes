export interface Card {
  id: string;
  category: string;
  service: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  githubUrl?: string;
}

export interface Review {
  cardId: string;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface Stats {
  totalReviews: number;
  currentStreak: number;
  lastStudyDate: string | null;
  cardsDueToday: number;
}

export type Rating = 1 | 2 | 3 | 4;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CardWithReview extends Card {
  nextReviewDate: string;
  isNew: boolean;
}

export interface ReviewResult {
  success: boolean;
  nextReviewDate: string;
}

export interface CardEdit {
  question: string;
  answer: string;
  editedAt: string;
}

export interface UserData {
  reviews: Review[];
  stats: Stats;
  chats: Record<string, ChatMessage[]>;
  cardEdits: Record<string, CardEdit>;
}

export interface CardsData {
  cards: Card[];
}

export interface Deck {
  id: string;
  name: string;
  cardCount: number;
  cardsDue: number;
}

export interface DeckStats {
  totalCards: number;
  cardsDue: number;
  cardsReviewed: number;
}
