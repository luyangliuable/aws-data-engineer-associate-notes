'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card as CardType, CardEdit } from '@/app/lib/types';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  edit?: CardEdit | null;
  onSaveEdit?: (question: string, answer: string) => Promise<void>;
}

function formatAnswer(answer: string): string {
  return answer
    .replace(/([.!?])\s+(?=[A-Z])/g, '$1\n\n')
    .trim();
}

export function Card({ card, isFlipped, onFlip, edit, onSaveEdit }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isEditing) {
        e.preventDefault();
        onFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlip, isEditing]);

  const handleStartEdit = () => {
    setEditQuestion(edit?.question ?? card.question);
    setEditAnswer(edit?.answer ?? card.answer);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!onSaveEdit) return;
    setIsSaving(true);
    try {
      await onSaveEdit(editQuestion, editAnswer);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const displayQuestion = edit?.question ?? card.question;
  const displayAnswer = edit?.answer ?? card.answer;

  if (isEditing) {
    return (
      <div className="relative w-full h-96 bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {card.category}
          </span>
          <span className="text-xs text-gray-400">Edit Mode</span>
        </div>
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">Question</label>
            <textarea
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter question..."
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">Answer</label>
            <textarea
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter answer..."
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-96 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {card.category}
              </span>
              <div className="flex items-center gap-2">
                {onSaveEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit();
                    }}
                    className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                )}
                <span className="text-xs text-gray-400">{card.service}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {displayQuestion}
                </ReactMarkdown>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400">
              Click to reveal answer
            </div>
          </div>
        </div>

        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="w-full h-full bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {card.category}
              </span>
              <span className="text-xs text-blue-400">{card.service}</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {formatAnswer(displayAnswer)}
                </ReactMarkdown>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {card.githubUrl && (
                <a
                  href={card.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View on GitHub
                </a>
              )}
              <div className="text-center text-sm text-blue-400 flex-1">
                Click to see question
              </div>
              {card.githubUrl && <div className="w-24" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
