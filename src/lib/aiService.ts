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
    console.log('=== AI Response Generation Started ===');
    console.log('Model requested:', model);
    console.log('Messages count:', messages.length);
    
    // Get the user's Google API key
    console.log('Retrieving Google API key...');
    const apiKey = await getApiKey('google');
    
    if (!apiKey) {
      console.log('❌ No Google API key found');
      return {
        success: false,
        error: 'Google API key not found. Please add your API key in settings.'
      };
    }

    console.log('✅ Google API key retrieved successfully');
    console.log('API key length:', apiKey.length);
    console.log('API key prefix:', apiKey.substring(0, 10) + '...');

    // Create Google AI instance with user's API key and generate response
    console.log('Creating Google AI model instance...');
    const googleModel = google(model, { apiKey });
    
    console.log('Generating text with AI model...');
    const { text } = await generateText({
      model: googleModel,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    console.log('✅ AI response generated successfully');
    console.log('Response length:', text.length);
    console.log('=== AI Response Generation Completed ===');

    return {
      success: true,
      content: text
    };
  } catch (error: any) {
    console.error('❌ AI generation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific API errors
    if (error.message?.includes('API key') || 
        error.message?.includes('apiKey') || 
        error.name?.includes('API_LoadAPIKeyError') ||
        error.message?.includes('API_KEY_INVALID')) {
      return {
        success: false,
        error: 'Invalid or missing Google API key. Please check your API key in settings.'
      };
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return {
        success: false,
        error: 'API quota exceeded. Please check your Google Cloud billing.'
      };
    }

    if (error.message?.includes('permission') || 
        error.message?.includes('forbidden') || 
        error.message?.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        error: 'API access denied. Please check your Google API key permissions.'
      };
    }

    if (error.message?.includes('INVALID_ARGUMENT')) {
      return {
        success: false,
        error: 'Invalid request parameters. Please try again.'
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
    console.log('Starting AI response streaming...');
    
    // Get the user's Google API key
    const apiKey = await getApiKey('google');
    
    if (!apiKey) {
      throw new Error('Google API key not found. Please add your API key in settings.');
    }

    console.log('Streaming with Google AI model...');

    // Stream response using the correct AI SDK pattern
    const { textStream } = await streamText({
      model: google(model, { apiKey }),
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
    'gemini-2.5-flash': 'gemini-1.5-flash', // Use available model
    'gemini-2.5-pro': 'gemini-1.5-pro',     // Use available model
    'gemini-2.0-flash': 'gemini-1.5-flash'  // Use available model
  };
  
  return modelMap[modelId] || 'gemini-1.5-flash';
}