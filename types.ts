export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  // 'pending' means user sent it, operator hasn't replied. 
  // 'approved' means it's part of the permanent history.
  status: 'pending' | 'approved'; 
}

export interface SystemConfig {
  systemInstruction: string;
  temperature: number;
}

export interface OperatorState {
  isTyping: boolean;
  suggestedResponse: string;
  isGenerating: boolean;
}