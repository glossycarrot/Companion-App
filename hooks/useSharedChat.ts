import { useState, useEffect } from 'react';
import { Message, Role } from '../types';
import * as storage from '../services/storage';

export const useSharedChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [operatorTyping, setOperatorTypingState] = useState(false);

  // Load initial state
  useEffect(() => {
    setMessages(storage.getMessages());
    setOperatorTypingState(storage.getOperatorTyping());
  }, []);

  // Listen for storage changes (cross-tab and local)
  useEffect(() => {
    const handleStorageChange = () => {
      setMessages(storage.getMessages());
      setOperatorTypingState(storage.getOperatorTyping());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-local', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-local', handleStorageChange);
    };
  }, []);

  const addMessage = (role: Role, content: string) => {
    const current = storage.getMessages();
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      status: role === 'user' ? 'pending' : 'approved'
    };
    const updated = [...current, newMessage];
    storage.saveMessages(updated);
  };

  const setOperatorTyping = (typing: boolean) => {
      storage.setOperatorTyping(typing);
  };

  const resetChat = () => {
      storage.clearStorage();
  };

  return {
    messages,
    operatorTyping,
    addMessage,
    setOperatorTyping,
    resetChat
  };
};