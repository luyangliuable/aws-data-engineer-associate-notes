import { getDecks, getStats } from './actions/reviewActions';
import { DeckSelector } from './components/DeckSelector';
import { StatsPanel } from './components/StatsPanel';

export default async function Home() {
  const [decks, stats] = await Promise.all([getDecks(), getStats()]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AWS Data Engineer Associate
          </h1>
          <p className="text-gray-600">Spaced Repetition Flashcards</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Select a Deck
              </h2>
              <DeckSelector decks={decks} />
            </div>
            <div className="lg:col-span-1">
              <StatsPanel stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
