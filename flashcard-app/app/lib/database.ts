import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Card, Review, UserData, Stats, ChatMessage, CardEdit } from './types';
import { generateGithubUrl } from './utils';

const DATA_DIR = join(process.cwd(), 'data');
const CARDS_FILE = join(DATA_DIR, 'cards.json');
const USER_DATA_FILE = join(DATA_DIR, 'user-data.json');

const DEFAULT_STATS: Stats = {
  totalReviews: 0,
  currentStreak: 0,
  lastStudyDate: null,
  cardsDueToday: 0,
};

const DEFAULT_USER_DATA: UserData = {
  reviews: [],
  stats: DEFAULT_STATS,
  chats: {},
  cardEdits: {},
};

export async function loadCards(): Promise<Card[]> {
  const data = await readFile(CARDS_FILE, 'utf-8');
  const cards: Card[] = JSON.parse(data).cards;
  return cards.map((card) => ({
    ...card,
    githubUrl: generateGithubUrl(card.category, card.service),
  }));
}

export async function loadUserData(): Promise<UserData> {
  try {
    const data = await readFile(USER_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_USER_DATA;
  }
}

export async function loadReviews(): Promise<Review[]> {
  const userData = await loadUserData();
  return userData.reviews;
}

export async function loadStats(): Promise<Stats> {
  const userData = await loadUserData();
  return userData.stats;
}

export async function saveUserData(userData: UserData): Promise<void> {
  await writeFile(USER_DATA_FILE, JSON.stringify(userData, null, 2));
}

export async function saveReviews(reviews: Review[]): Promise<void> {
  const userData = await loadUserData();
  userData.reviews = reviews;
  await saveUserData(userData);
}

export async function saveStats(stats: Stats): Promise<void> {
  const userData = await loadUserData();
  userData.stats = stats;
  await saveUserData(userData);
}

export async function getChatHistory(cardId: string): Promise<ChatMessage[]> {
  const userData = await loadUserData();
  return userData.chats?.[cardId] ?? [];
}

export async function saveChatMessage(cardId: string, message: ChatMessage): Promise<void> {
  const userData = await loadUserData();
  if (!userData.chats) userData.chats = {};
  if (!userData.chats[cardId]) userData.chats[cardId] = [];
  userData.chats[cardId].push(message);
  await saveUserData(userData);
}

export async function loadDeckMarkdownFiles(category: string): Promise<string[]> {
  const { readdir, readFile } = await import('fs/promises');
  const { join } = await import('path');

  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const deckPath = join(process.cwd(), 'contents', categorySlug);

  try {
    const files = await readdir(deckPath);
    const markdownFiles = files.filter(f => f.endsWith('.md'));

    const contents = await Promise.all(
      markdownFiles.map(file => readFile(join(deckPath, file), 'utf-8'))
    );

    return contents;
  } catch {
    return [];
  }
}

export async function getCardEdit(cardId: string): Promise<CardEdit | null> {
  const userData = await loadUserData();
  return userData.cardEdits?.[cardId] ?? null;
}

export async function saveCardEdit(cardId: string, edit: CardEdit): Promise<void> {
  const userData = await loadUserData();
  if (!userData.cardEdits) userData.cardEdits = {};
  userData.cardEdits[cardId] = edit;
  await saveUserData(userData);
}
