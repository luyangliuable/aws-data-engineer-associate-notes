'use client';

import { useRouter } from 'next/navigation';
import { Deck } from '@/app/lib/types';

interface DeckSelectorProps {
  decks: Deck[];
}

export function DeckSelector({ decks }: DeckSelectorProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onClick={() => router.push(`/study/${deck.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

interface DeckCardProps {
  deck: Deck;
  onClick: () => void;
}

function DeckCard({ deck, onClick }: DeckCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{deck.name}</h3>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{deck.cardCount} cards</span>
        <span className={deck.cardsDue > 0 ? 'text-blue-600 font-medium' : ''}>
          {deck.cardsDue} due
        </span>
      </div>
    </button>
  );
}
