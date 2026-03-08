'use server';

import { saveCardEdit, getCardEdit } from '@/app/lib/database';
import { CardEdit } from '@/app/lib/types';

export async function saveCardEditAction(
  cardId: string,
  question: string,
  answer: string
): Promise<CardEdit> {
  const edit: CardEdit = {
    question,
    answer,
    editedAt: new Date().toISOString(),
  };

  await saveCardEdit(cardId, edit);
  return edit;
}

export async function getCardEditAction(cardId: string): Promise<CardEdit | null> {
  return getCardEdit(cardId);
}
