import { ModelConfig } from '../types';

// Remove mock user since we're using real authentication
export const mockUser = null;

export const availableModels: ModelConfig[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast and efficient Google AI model'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Most capable OpenAI model'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient OpenAI model'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic\'s balanced AI model'
  }
];

export const samplePrompts = [
  "How does AI work?",
  "Are black holes real?",
  "How many Rs are in the word \"strawberry\"?",
  "What is the meaning of life?"
];

// Remove mock chats since we're loading from Supabase
export const mockChats = [];