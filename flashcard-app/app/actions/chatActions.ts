'use server';

import Anthropic from '@anthropic-ai/sdk';
import { getChatHistory, saveChatMessage, loadDeckMarkdownFiles } from '@/app/lib/database';
import { ChatMessage } from '@/app/lib/types';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
});

export async function sendChatMessage(
  cardId: string,
  cardContent: { question: string; answer: string; category: string },
  userMessage: string
): Promise<ChatMessage> {
  const history = await getChatHistory(cardId);

  const deckMarkdownFiles = await loadDeckMarkdownFiles(cardContent.category);
  const combinedDeckContent = deckMarkdownFiles.join('\n\n---\n\n');

  const messages: Anthropic.MessageParam[] = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const systemPrompt = `You are a helpful study assistant helping with AWS DEA exam preparation.

The user is currently studying this flashcard:
Question: ${cardContent.question}
Answer: ${cardContent.answer}

Here is the complete study material for the ${cardContent.category} deck:

${combinedDeckContent}

Use the deck material to provide comprehensive, accurate answers. Cite specific sections when relevant.`;

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const userMsg: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  };
  await saveChatMessage(cardId, userMsg);

  const assistantMsg: ChatMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: response.content[0].type === 'text' ? response.content[0].text : '',
    timestamp: new Date().toISOString(),
  };
  await saveChatMessage(cardId, assistantMsg);

  return assistantMsg;
}

export async function getChatHistoryServer(cardId: string): Promise<ChatMessage[]> {
  return getChatHistory(cardId);
}
