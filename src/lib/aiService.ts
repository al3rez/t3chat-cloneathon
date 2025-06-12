import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { getApiKey } from './apiKeys';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(
  messages: ChatMessage[],
  model: string = 'gemini-1.5-flash'
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // Get the user's Google API key
    const apiKey = await getApiKey('google');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Google API key not found. Please add your API key in settings.'
      };
    }

    // Create Google AI instance with user's API key
    const googleAI = google({
      apiKey: apiKey
    });

    // Generate response using the correct AI SDK pattern
    const { text } = await generateText({
      model: googleAI(model),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    return {
      success: true,
      content: text
    };
  } catch (error: any) {
    console.error('AI generation error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: 'Invalid API key. Please check your Google API key in settings.'
      };
    }
    
    if (error.message?.includes('quota')) {
      return {
        success: false,
        error: 'API quota exceeded. Please check your Google Cloud billing.'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate AI response'
    };
  }
}

export async function* streamAIResponse(
  messages: ChatMessage[],
  model: string = 'gemini-1.5-flash'
): AsyncGenerator<string, void, unknown> {
  try {
    // Get the user's Google API key
    const apiKey = await getApiKey('google');
    
    if (!apiKey) {
      throw new Error('Google API key not found. Please add your API key in settings.');
    }

    // Create Google AI instance with user's API key
    const googleAI = google({
      apiKey: apiKey
    });

    // Stream response using the correct AI SDK pattern
    const { textStream } = await streamText({
      model: googleAI(model),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    for await (const delta of textStream) {
      yield delta;
    }
  } catch (error: any) {
    console.error('AI streaming error:', error);
    throw error;
  }
}

// Map internal model IDs to Google model IDs
export function getGoogleModelId(modelId: string): string {
  const modelMap: Record<string, string> = {
    'gemini-pro': 'gemini-1.5-flash',
    'gemini-pro-2': 'gemini-1.5-pro',
    'gemini-2.5-flash': 'gemini-2.5-flash',
    'gemini-2.5-pro': 'gemini-2.5-pro',
    'gemini-2.0-flash': 'gemini-2.0-flash'
  };
  
  return modelMap[modelId] || 'gemini-1.5-flash';
}