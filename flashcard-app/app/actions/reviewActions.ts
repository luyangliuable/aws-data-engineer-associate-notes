'use server';

import { calculateNextReview } from '@/app/lib/srsAlgorithm';
import {
  loadCards,
  loadReviews,
  loadStats,
  saveReviews,
  saveStats,
} from '@/app/lib/database';
import { slugify, generateGithubUrl } from '@/app/lib/utils';
import {
  Card,
  Review,
  Rating,
  ReviewResult,
  CardWithReview,
  Stats,
  Deck,
} from '@/app/lib/types';

export async function submitReview(
  cardId: string,
  rating: Rating
): Promise<ReviewResult> {
  const reviews = await loadReviews();
  const existing = reviews.find((r) => r.cardId === cardId);

  const current: Review = existing || {
    cardId,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString().split('T')[0],
    reviewCount: 0,
  };

  const updated = calculateNextReview(rating, current);

  const newReviews = existing
    ? reviews.map((r) => (r.cardId === cardId ? updated : r))
    : [...reviews, updated];

  await saveReviews(newReviews);
  await updateStatsAfterReview();

  return { success: true, nextReviewDate: updated.nextReviewDate };
}

async function updateStatsAfterReview(): Promise<void> {
  const stats = await loadStats();
  const today = new Date().toISOString().split('T')[0];

  const newStreak = stats.lastStudyDate === today ? stats.currentStreak : 1;

  await saveStats({
    ...stats,
    totalReviews: stats.totalReviews + 1,
    currentStreak: newStreak,
    lastStudyDate: today,
  });
}

export async function getDueCards(): Promise<CardWithReview[]> {
  const [cards, reviews] = await Promise.all([loadCards(), loadReviews()]);

  const today = new Date().toISOString().split('T')[0];

  return cards
    .map((card) => {
      const review = reviews.find((r) => r.cardId === card.id);
      return {
        ...card,
        nextReviewDate: review?.nextReviewDate || today,
        isNew: !review,
      };
    })
    .filter((card) => card.nextReviewDate <= today)
    .sort((a, b) => (a.isNew ? -1 : 1));
}

export async function getStats(): Promise<Stats> {
  const stats = await loadStats();
  const dueCards = await getDueCards();

  return {
    ...stats,
    cardsDueToday: dueCards.length,
  };
}

export async function getAllCards(): Promise<Card[]> {
  return loadCards();
}

export async function getCardsByCategory(category: string): Promise<Card[]> {
  const cards = await loadCards();
  return cards.filter((c) => c.category === category);
}

export async function getDecks(): Promise<Deck[]> {
  const [cards, reviews] = await Promise.all([loadCards(), loadReviews()]);
  const today = new Date().toISOString().split('T')[0];

  const decksMap = cards.reduce((acc, card) => {
    const existing = acc.get(card.category);
    if (existing) {
      existing.cardCount++;
    } else {
      acc.set(card.category, {
        id: slugify(card.category),
        name: card.category,
        cardCount: 1,
        cardsDue: 0,
      });
    }
    return acc;
  }, new Map<string, Deck>());

  for (const review of reviews) {
    if (review.nextReviewDate <= today) {
      const card = cards.find((c) => c.id === review.cardId);
      if (card) {
        const deck = decksMap.get(card.category);
        if (deck) deck.cardsDue++;
      }
    }
  }

  for (const card of cards) {
    const review = reviews.find((r) => r.cardId === card.id);
    if (!review) {
      const deck = decksMap.get(card.category);
      if (deck) deck.cardsDue++;
    }
  }

  return Array.from(decksMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function slugToCategory(slug: string, cards: Card[]): string | null {
  const card = cards.find((c) => slugify(c.category) === slug);
  return card?.category || null;
}

export async function getDueCardsByCategory(
  categorySlug: string
): Promise<CardWithReview[]> {
  const [cards, reviews] = await Promise.all([loadCards(), loadReviews()]);
  const today = new Date().toISOString().split('T')[0];

  const categoryName = slugToCategory(categorySlug, cards);
  if (!categoryName) return [];

  return cards
    .filter((card) => card.category === categoryName)
    .map((card) => {
      const review = reviews.find((r) => r.cardId === card.id);
      return {
        ...card,
        nextReviewDate: review?.nextReviewDate || today,
        isNew: !review,
      };
    })
    .filter((card) => card.nextReviewDate <= today)
    .sort((a, b) => (a.isNew ? -1 : 1));
}
