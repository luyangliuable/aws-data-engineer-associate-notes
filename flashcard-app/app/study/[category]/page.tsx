import Link from 'next/link';
import { getDueCardsByCategory, getStats } from '@/app/actions/reviewActions';
import { StudySession } from '@/app/components/StudySession';
import { DeckStats } from '@/app/lib/types';

interface StudyPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { category } = await params;
  const [cards, stats] = await Promise.all([
    getDueCardsByCategory(category),
    getStats(),
  ]);

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <header className="mb-8">
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              ← Back to Decks
            </Link>
          </header>

          <div className="max-w-2xl mx-auto text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Cards Due
            </h2>
            <p className="text-gray-600">
              You have completed all your reviews for this deck. Great job!
            </p>
          </div>
        </div>
      </main>
    );
  }

  const deckName = cards[0]?.category || category;

  const deckStats: DeckStats = {
    totalCards: cards.length,
    cardsDue: cards.length,
    cardsReviewed: 0,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Back to Decks
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">{deckName}</h1>
        </header>

        <div className="max-w-4xl mx-auto">
          <StudySession
            initialCards={cards}
            initialStats={stats}
            deckStats={deckStats}
          />
        </div>
      </div>
    </main>
  );
}
