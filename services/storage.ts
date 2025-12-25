import { Message } from '../types';
import { INITIAL_GREETING } from '../localConfig';

const STORAGE_KEY_MESSAGES = 'glowup_messages';
const STORAGE_KEY_TYPING = 'glowup_operator_typing';

export const getMessages = (): Message[] => {
  const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!stored) {
    const initial: Message[] = [{
      id: 'init-1',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: Date.now(),
      status: 'approved'
    }];
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const saveMessages = (messages: Message[]) => {
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new Event('storage-local'));
};

export const getOperatorTyping = (): boolean => {
  return localStorage.getItem(STORAGE_KEY_TYPING) === 'true';
};

export const setOperatorTyping = (isTyping: boolean) => {
  localStorage.setItem(STORAGE_KEY_TYPING, String(isTyping));
  window.dispatchEvent(new Event('storage-local'));
};

export const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_TYPING);
    window.dispatchEvent(new Event('storage-local'));
};