export interface Chat {
  id: string;
  title: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Thread {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thread_id?: string;
}

export interface DatabaseMessage {
  id: string;
  thread_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  avatar?: string;
}

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'gemini-pro';

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  description: string;
}