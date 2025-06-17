import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";
import { getApiKey } from "./apiKeys";

export interface ChatMessage {
  role: "user" | "assistant";
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
  model: string = "gemini-1.5-flash",
): Promise<AIResponseWithSources> {
  try {
    // Determine provider based on model
    const isGeminiModel = model.includes("gemini");
    const provider = isGeminiModel ? "google" : "openrouter";

    const apiKey = await getApiKey(provider);

    if (!apiKey) {
      return {
        success: false,
        error: `${provider} API key not found. Please add your API key in settings.`,
      };
    }

    let aiModel;

    if (isGeminiModel) {
      // Create Google provider instance

      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta",
      });
      aiModel = google(getGoogleModelId(model));
    } else {
      // Create OpenRouter provider instance

      const openrouter = createOpenRouter({
        apiKey: apiKey,
      });
      aiModel = openrouter(getOpenRouterModelId(model));
    }

    const { text, sources, providerMetadata } = await generateText({
      model: aiModel,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    return {
      success: true,
      content: text,
      sources: sources || [],
    };
  } catch (error: any) {
    console.error("❌ AI generation error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific API errors
    if (
      error.message?.includes("API key") ||
      error.message?.includes("apiKey") ||
      error.name?.includes("API_LoadAPIKeyError") ||
      error.message?.includes("API_KEY_INVALID")
    ) {
      return {
        success: false,
        error:
          "Invalid or missing API key. Please check your API key in settings.",
      };
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("QUOTA_EXCEEDED")
    ) {
      return {
        success: false,
        error: "API quota exceeded. Please check your billing.",
      };
    }

    if (
      error.message?.includes("permission") ||
      error.message?.includes("forbidden") ||
      error.message?.includes("PERMISSION_DENIED")
    ) {
      return {
        success: false,
        error: "API access denied. Please check your API key permissions.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to generate AI response",
    };
  }
}

export async function generateAIResponseWithSearch(
  messages: ChatMessage[],
  model: string = "gemini-1.5-pro",
): Promise<AIResponseWithSources> {
  try {
    // Get the user's Google API key

    const apiKey = await getApiKey("google");

    if (!apiKey) {
      return {
        success: false,
        error: "Google API key not found. Please add your API key in settings.",
      };
    }

    // Create custom Google provider instance with user's API key

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
    });

    const googleModel = google(getGoogleModelId(model), {
      useSearchGrounding: true,
    });

    const { text, sources, providerMetadata } = await generateText({
      model: googleModel,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    // Access the grounding metadata
    const metadata = providerMetadata?.google;
    const groundingMetadata = metadata?.groundingMetadata;
    const safetyRatings = metadata?.safetyRatings;

    return {
      success: true,
      content: text,
      sources: sources || [],
    };
  } catch (error: any) {
    console.error("❌ AI generation with search error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific API errors
    if (
      error.message?.includes("API key") ||
      error.message?.includes("apiKey") ||
      error.name?.includes("API_LoadAPIKeyError") ||
      error.message?.includes("API_KEY_INVALID")
    ) {
      return {
        success: false,
        error:
          "Invalid or missing Google API key. Please check your API key in settings.",
      };
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("QUOTA_EXCEEDED")
    ) {
      return {
        success: false,
        error: "API quota exceeded. Please check your Google Cloud billing.",
      };
    }

    if (
      error.message?.includes("permission") ||
      error.message?.includes("forbidden") ||
      error.message?.includes("PERMISSION_DENIED")
    ) {
      return {
        success: false,
        error:
          "API access denied. Please check your Google API key permissions.",
      };
    }

    if (error.message?.includes("INVALID_ARGUMENT")) {
      return {
        success: false,
        error: "Invalid request parameters. Please try again.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to generate AI response with web search",
    };
  }
}

export async function* streamAIResponse(
  messages: ChatMessage[],
  model: string = "gemini-1.5-flash",
): AsyncGenerator<string, void, unknown> {
  try {
    // Determine provider based on model
    const isGeminiModel = model.includes("gemini");
    const provider = isGeminiModel ? "google" : "openrouter";

    const apiKey = await getApiKey(provider);

    if (!apiKey) {
      throw new Error(
        `${provider} API key not found. Please add your API key in settings.`,
      );
    }

    let aiModel;

    if (isGeminiModel) {
      // Create Google provider instance
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta",
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
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 2048,
    });

    for await (const delta of textStream) {
      yield delta;
    }
  } catch (error: any) {
    console.error("AI streaming error:", error);
    throw error;
  }
}

// Map internal model IDs to Google model IDs
export function getGoogleModelId(modelId: string): string {
  const modelMap: Record<string, string> = {
    "gemini-pro": "models/gemini-1.5-flash",
    "gemini-pro-2": "models/gemini-1.5-pro",
    "gemini-2.5-flash": "models/gemini-2.5-flash",
    "gemini-2.5-pro": "models/gemini-2.5-pro",
    "gemini-2.0-flash": "models/gemini-2.0-flash-exp",
    "gemini-1.5-flash-001": "models/gemini-1.5-flash-001",
    "gemini-1.5-pro-001": "models/gemini-1.5-pro-001",
  };

  return modelMap[modelId] || "models/gemini-1.5-flash";
}

// Map internal model IDs to OpenRouter model IDs
export function getOpenRouterModelId(modelId: string): string {
  const modelMap: Record<string, string> = {
    "gpt-4o": "openai/gpt-4o",
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
    "gpt-4": "openai/gpt-4", // Legacy support
  };

  return modelMap[modelId] || "openai/gpt-4o";
}
