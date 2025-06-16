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
  sources?: Array<{
    uri?: string;
    title?: string;
  }>;
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

export type AIModel = 
  // OpenAI Models
  | 'gpt-4o' 
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo'
  // Google Models  
  | 'gemini-pro'
  | 'gemini-pro-2'
  // Legacy models (commented out providers)
  | 'gpt-4' // Keep for backwards compatibility
  | 'claude-3-sonnet'; // Keep for backwards compatibility

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
  description: string;
}