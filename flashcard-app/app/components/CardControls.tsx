'use client';

import { Rating } from '@/app/lib/types';

interface CardControlsProps {
  onRate: (rating: Rating) => void;
  disabled: boolean;
}

const RATING_CONFIG: { rating: Rating; label: string; color: string }[] = [
  { rating: 1, label: 'Again', color: 'bg-red-500 hover:bg-red-600' },
  { rating: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
  { rating: 3, label: 'Good', color: 'bg-blue-500 hover:bg-blue-600' },
  { rating: 4, label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
];

export function CardControls({ onRate, disabled }: CardControlsProps) {
  return (
    <div className="flex justify-center gap-3 mt-6">
      {RATING_CONFIG.map(({ rating, label, color }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
