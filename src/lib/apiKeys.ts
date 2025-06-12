import { supabase } from './supabase';

export interface ApiKey {
  id: string;
  provider: 'google' | 'openai' | 'anthropic';
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

export async function saveApiKey(provider: 'google' | 'openai' | 'anthropic', apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const userSecret = getUserSecret(user.id);

    // Call the encrypt function
    const { data: encryptedKey, error: encryptError } = await supabase
      .rpc('encrypt_api_key', {
        api_key: apiKey,
        user_secret: userSecret
      });

    if (encryptError) {
      console.error('Encryption error:', encryptError);
      return { success: false, error: 'Failed to encrypt API key' };
    }

    // Upsert the encrypted key
    const { error: upsertError } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey
      }, {
        onConflict: 'user_id,provider'
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return { success: false, error: 'Failed to save API key' };
    }

    return { success: true };
  } catch (error) {
    console.error('Save API key error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getApiKey(provider: 'google' | 'openai' | 'anthropic'): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log(`Getting API key for provider: ${provider}, user: ${user.id}`);

    // Get the encrypted key
    const { data: apiKeyRecord, error: fetchError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single();

    if (fetchError) {
      console.log('Fetch error:', fetchError);
      return null;
    }

    if (!apiKeyRecord) {
      console.log('No API key record found');
      return null;
    }

    console.log('Found encrypted API key record');

    const userSecret = getUserSecret(user.id);

    // Decrypt the key
    const { data: decryptedKey, error: decryptError } = await supabase
      .rpc('decrypt_api_key', {
        encrypted_key: apiKeyRecord.encrypted_key,
        user_secret: userSecret
      });

    if (decryptError) {
      console.error('Decryption error:', decryptError);
      return null;
    }

    if (!decryptedKey) {
      console.log('Decryption returned null/empty');
      return null;
    }

    console.log('Successfully decrypted API key');
    return decryptedKey;
  } catch (error) {
    console.error('Get API key error:', error);
    return null;
  }
}

export async function getUserApiKeys(): Promise<ApiKey[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, provider, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user API keys error:', error);
      return [];
    }

    return apiKeys || [];
  } catch (error) {
    console.error('Get user API keys error:', error);
    return [];
  }
}

export async function deleteApiKey(provider: 'google' | 'openai' | 'anthropic'): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Delete API key error:', error);
      return { success: false, error: 'Failed to delete API key' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete API key error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}