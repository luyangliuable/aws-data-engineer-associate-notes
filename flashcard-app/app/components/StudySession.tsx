'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card as CardType, Rating, Stats, DeckStats, ChatMessage, CardEdit } from '@/app/lib/types';
import { submitReview, getStats } from '@/app/actions/reviewActions';
import { sendChatMessage, getChatHistoryServer } from '@/app/actions/chatActions';
import { saveCardEditAction, getCardEditAction } from '@/app/actions/cardActions';
import { Card } from './Card';
import { CardControls } from './CardControls';
import { ProgressBar } from './ProgressBar';
import { StatsPanel } from './StatsPanel';
import { ChatBot } from './ChatBot';

interface StudySessionProps {
  initialCards: CardType[];
  initialStats: Stats;
  deckStats?: DeckStats;
}

export function StudySession({
  initialCards,
  initialStats,
  deckStats,
}: StudySessionProps) {
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [cardEdit, setCardEdit] = useState<CardEdit | null>(null);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);

      try {
        await submitReview(currentCard.id, rating);
        const updatedStats = await getStats();
        setStats(updatedStats);

        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting]
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  useEffect(() => {
    const loadChatAndEdit = async () => {
      if (currentCard) {
        const [history, edit] = await Promise.all([
          getChatHistoryServer(currentCard.id),
          getCardEditAction(currentCard.id),
        ]);
        setChatMessages(history);
        setCardEdit(edit);
      }
    };
    loadChatAndEdit();
  }, [currentCard?.id]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentCard) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    const assistantMsg = await sendChatMessage(
      currentCard.id,
      { question: currentCard.question, answer: currentCard.answer, category: currentCard.category },
      message
    );

    setChatMessages((prev) => [...prev, assistantMsg]);
  }, [currentCard]);

  const handleSaveCardEdit = useCallback(async (question: string, answer: string) => {
    if (!currentCard) return;
    const edit = await saveCardEditAction(currentCard.id, question, answer);
    setCardEdit(edit);
  }, [currentCard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFlipped || isSubmitting || isComplete) return;

      const keyMap: Record<string, Rating> = {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
      };

      const rating = keyMap[e.key];
      if (rating) {
        e.preventDefault();
        handleRate(rating);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isSubmitting, isComplete, handleRate]);

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <CompletionState onRestart={handleRestart} stats={stats} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <ProgressBar current={currentIndex} total={cards.length} />
          </div>

          <Card card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} edit={cardEdit} onSaveEdit={handleSaveCardEdit} />

          {isFlipped && (
            <CardControls onRate={handleRate} disabled={isSubmitting} />
          )}

          {!isFlipped && (
            <p className="text-center text-gray-500 mt-6">
              Click the card to reveal the answer
            </p>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          {deckStats && <DeckProgressPanel deckStats={deckStats} />}
          <StatsPanel stats={stats} />
        </div>
      </div>

      {currentCard && (
        <ChatBot
          cardId={currentCard.id}
          cardContent={{
            question: currentCard.question,
            answer: currentCard.answer,
            category: currentCard.category,
          }}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">No Cards Due</h2>
      <p className="text-gray-600">
        You have completed all your reviews for today. Great job!
      </p>
    </div>
  );
}

interface CompletionStateProps {
  onRestart: () => void;
  stats: Stats;
}

function CompletionState({ onRestart, stats }: CompletionStateProps) {
  return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Session Complete!
      </h2>
      <p className="text-gray-600 mb-8">
        You have reviewed all {stats.totalReviews} cards.
      </p>
      <button
        onClick={onRestart}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        Study Again
      </button>
    </div>
  );
}

interface DeckProgressPanelProps {
  deckStats: DeckStats;
}

function DeckProgressPanel({ deckStats }: DeckProgressPanelProps) {
  return (
    <div className="bg-blue-50 rounded-lg shadow border border-blue-200 p-4">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">Deck Progress</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {deckStats.cardsDue}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Cards Due
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {deckStats.totalCards}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Cards
          </div>
        </div>
      </div>
    </div>
  );
}
