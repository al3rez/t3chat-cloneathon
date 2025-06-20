import { supabase } from "./supabase";

export interface ApiKey {
  id: string;
  provider: "google" | "openai" | "anthropic" | "openrouter";
  created_at: string;
  updated_at: string;
}

export interface ApiKeyWithDecrypted extends ApiKey {
  decrypted_key: string;
}

// Generate a user-specific secret for encryption
function getUserSecret(userId: string): string {
  // In production, you might want to use a more sophisticated approach
  // This creates a deterministic secret based on user ID
  return `user_secret_${userId}_${import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10)}`;
}

export async function saveApiKey(
  provider: "google" | "openai" | "anthropic" | "openrouter",
  apiKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const userSecret = getUserSecret(user.id);

    // Call the encrypt function
    const { data: encryptedKey, error: encryptError } = await supabase.rpc(
      "encrypt_api_key",
      {
        api_key: apiKey,
        user_secret: userSecret,
      },
    );

    if (encryptError) {
      console.error("Encryption error:", encryptError);
      return { success: false, error: "Failed to encrypt API key" };
    }

    // Upsert the encrypted key
    const { error: upsertError } = await supabase.from("api_keys").upsert(
      {
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
      },
      {
        onConflict: "user_id,provider",
      },
    );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return { success: false, error: "Failed to save API key" };
    }

    return { success: true };
  } catch (error) {
    console.error("Save API key error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getApiKey(
  provider: "google" | "openai" | "anthropic" | "openrouter",
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Get the encrypted key from database
    const { data: apiKeyRecord, error: fetchError } = await supabase
      .from("api_keys")
      .select("encrypted_key")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return null;
      }
      return null;
    }

    if (!apiKeyRecord || !apiKeyRecord.encrypted_key) {
      return null;
    }

    const userSecret = getUserSecret(user.id);

    // Decrypt the key using the database function
    const { data: decryptedKey, error: decryptError } = await supabase.rpc(
      "decrypt_api_key",
      {
        encrypted_key: apiKeyRecord.encrypted_key,
        user_secret: userSecret,
      },
    );

    if (decryptError) {
      console.error("Decryption error:", decryptError);
      return null;
    }

    if (!decryptedKey) {
      return null;
    }

    // Don't log the actual key for security

    return decryptedKey;
  } catch (error) {
    console.error("Get API key error:", error);
    return null;
  }
}

export async function getUserApiKeys(): Promise<ApiKey[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("id, provider, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get user API keys error:", error);
      return [];
    }

    return apiKeys || [];
  } catch (error) {
    console.error("Get user API keys error:", error);
    return [];
  }
}

export async function deleteApiKey(
  provider: "google" | "openai" | "anthropic" | "openrouter",
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    if (error) {
      console.error("Delete API key error:", error);
      return { success: false, error: "Failed to delete API key" };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete API key error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Check if user has API key for a specific provider
export async function hasApiKey(
  provider: "google" | "openai" | "anthropic" | "openrouter",
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    const { data: apiKeyRecord, error } = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Check API key error:", error);
      return false;
    }

    return !!apiKeyRecord;
  } catch (error) {
    console.error("Check API key error:", error);
    return false;
  }
}

// Check if user has the required API keys for all providers
export async function getAvailableProviders(): Promise<string[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("provider")
      .eq("user_id", user.id);

    if (error) {
      console.error("Get available providers error:", error);
      return [];
    }

    return apiKeys?.map((key) => key.provider) || [];
  } catch (error) {
    console.error("Get available providers error:", error);
    return [];
  }
}
