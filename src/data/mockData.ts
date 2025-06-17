import { ModelConfig } from "../types";

// Remove mock user since we're using real authentication
export const mockUser = null;

export const availableModels: ModelConfig[] = [
  // Google Models
  {
    id: "gemini-pro",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Fast and efficient Google AI model",
  },
  {
    id: "gemini-pro-2",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Advanced Google AI model with reasoning",
  },
  // OpenAI Models (via OpenRouter)
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and cost-effective OpenAI model",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "Fast and efficient OpenAI model",
  },
];

export const samplePrompts = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

// Remove mock chats since we're loading from Supabase
export const mockChats = [];
