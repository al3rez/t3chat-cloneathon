import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText } from 'ai';
import { getApiKey } from './apiKeys';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponseWithSources {
  success: boolean;
  content?: string;
  sources?: Array<{
    uri?: string;
    title?: string;
  }>;
  error?: string;
}

export async function generateAIResponse(
  messages: ChatMessage[],
  model: string = 'gemini-1.5-flash'
): Promise<AIResponseWithSources> {
  try {
    console.log('=== AI Response Generation Started ===');
    console.log('Model requested:', model);
    console.log('Messages count:', messages.length);
    
    // Determine provider based on model
    const isGeminiModel = model.includes('gemini');
    const provider = isGeminiModel ? 'google' : 'openrouter';
    
    console.log(`Retrieving ${provider} API key...`);
    const apiKey = await getApiKey(provider);
    
    if (!apiKey) {
      console.log(`❌ No ${provider} API key found`);
      return {
        success: false,
        error: `${provider} API key not found. Please add your API key in settings.`
      };
    }

    console.log(`✅ ${provider} API key retrieved successfully`);
    console.log('API key length:', apiKey.length);
    console.log('API key prefix:', apiKey.substring(0, 10) + '...');

    let aiModel;
    
    if (isGeminiModel) {
      // Create Google provider instance
      console.log('Creating custom Google provider instance...');
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta'
      });
      aiModel = google(getGoogleModelId(model));
    } else {
      // Create OpenRouter provider instance
      console.log('Creating OpenRouter provider instance...');
      const openrouter = createOpenRouter({
        apiKey: apiKey,
      });
      aiModel = openrouter(getOpenRouterModelId(model));
    }
    
    console.log('Generating text with AI model...');
    const { text, sources, providerMetadata } = await generateText({
      model: aiModel,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    console.log('✅ AI response generated successfully');
    console.log('Response length:', text.length);
    console.log('Sources found:', sources);
    console.log('=== AI Response Generation Completed ===');

    return {
      success: true,
      content: text,
      sources: sources || []
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
        error: 'Invalid or missing API key. Please check your API key in settings.'
      };
    }
    
    if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      return {
        success: false,
        error: 'API quota exceeded. Please check your billing.'
      };
    }

    if (error.message?.includes('permission') || 
        error.message?.includes('forbidden') || 
        error.message?.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        error: 'API access denied. Please check your API key permissions.'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate AI response'
    };
  }
}

export async function generateAIResponseWithSearch(
  messages: ChatMessage[],
  model: string = 'gemini-1.5-pro'
): Promise<AIResponseWithSources> {
  try {
    console.log('=== AI Response with Web Search Started ===');
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

    // Create custom Google provider instance with user's API key
    console.log('Creating custom Google provider instance with search grounding...');
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta'
    });
    
    console.log('Creating Google AI model instance with search grounding...');
    const googleModel = google(model, {
      useSearchGrounding: true,
    });
    
    console.log('Generating text with AI model and web search...');
    const { text, sources, providerMetadata } = await generateText({
      model: googleModel,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    console.log('✅ AI response with web search generated successfully');
    console.log('Response length:', text.length);
    console.log('Sources found:', sources);
    
    // Access the grounding metadata
    const metadata = providerMetadata?.google;
    const groundingMetadata = metadata?.groundingMetadata;
    const safetyRatings = metadata?.safetyRatings;
    
    console.log('Grounding metadata:', groundingMetadata);
    console.log('Safety ratings:', safetyRatings);
    console.log('=== AI Response with Web Search Completed ===');

    return {
      success: true,
      content: text,
      sources: sources || []
    };
  } catch (error: any) {
    console.error('❌ AI generation with search error:', error);
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
      error: error.message || 'Failed to generate AI response with web search'
    };
  }
}

export async function* streamAIResponse(
  messages: ChatMessage[],
  model: string = 'gemini-1.5-flash'
): AsyncGenerator<string, void, unknown> {
  try {
    console.log('Starting AI response streaming...');
    
    // Determine provider based on model
    const isGeminiModel = model.includes('gemini');
    const provider = isGeminiModel ? 'google' : 'openrouter';
    
    const apiKey = await getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`${provider} API key not found. Please add your API key in settings.`);
    }

    console.log(`Streaming with ${provider} AI model...`);

    let aiModel;
    
    if (isGeminiModel) {
      // Create Google provider instance
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta'
      });
      aiModel = google(getGoogleModelId(model));
    } else {
      // Create OpenRouter provider instance
      const openrouter = createOpenRouter({
        apiKey: apiKey,
      });
      aiModel = openrouter(getOpenRouterModelId(model));
    }

    // Stream response using the correct AI SDK pattern
    const { textStream } = await streamText({
      model: aiModel,
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

// Map internal model IDs to OpenRouter model IDs
export function getOpenRouterModelId(modelId: string): string {
  const modelMap: Record<string, string> = {
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gpt-4': 'openai/gpt-4' // Legacy support
  };
  
  return modelMap[modelId] || 'openai/gpt-4o';
}