import { Review, Rating } from './types';

const MIN_EASE_FACTOR = 1.3;

const EASE_DELTAS: Record<Rating, number> = {
  1: -0.2,
  2: -0.15,
  3: 0,
  4: 0.15,
};

export function calculateNextReview(rating: Rating, current: Review): Review {
  const newEaseFactor = calculateEaseFactor(rating, current.easeFactor);
  const newInterval = calculateInterval(rating, current.interval, newEaseFactor);
  const nextReviewDate = addDays(new Date(), newInterval);

  return {
    cardId: current.cardId,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate: formatISO(nextReviewDate),
    reviewCount: current.reviewCount + 1,
  };
}

function calculateEaseFactor(rating: Rating, currentEaseFactor: number): number {
  const delta = EASE_DELTAS[rating];
  return Math.max(MIN_EASE_FACTOR, currentEaseFactor + delta);
}

function calculateInterval(
  rating: Rating,
  currentInterval: number,
  easeFactor: number
): number {
  if (rating === 1) return 1;
  if (currentInterval === 0) return 1;
  if (currentInterval === 1) return 3;

  return Math.round(currentInterval * easeFactor);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
