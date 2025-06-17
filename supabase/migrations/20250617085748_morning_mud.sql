/*
  # Add OpenRouter provider to API keys

  1. Changes
    - Update api_keys_provider_check constraint to include 'openrouter'
    - This allows users to save OpenRouter API keys alongside Google, OpenAI, and Anthropic keys

  2. Security
    - Maintains existing RLS policies
    - No changes to user permissions
*/

-- Drop the existing check constraint
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_provider_check;

-- Add the updated constraint that includes 'openrouter'
ALTER TABLE api_keys ADD CONSTRAINT api_keys_provider_check 
  CHECK (provider = ANY (ARRAY['google'::text, 'openai'::text, 'anthropic'::text, 'openrouter'::text]));