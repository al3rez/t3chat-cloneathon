import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  value: string;
  isVisible: boolean;
  models: string[];
  consoleUrl: string;
  hasChanges: boolean;
}

export function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'anthropic',
      provider: 'Anthropic',
      name: 'Anthropic API Key',
      value: '',
      isVisible: false,
      models: ['Claude 3.5 Sonnet', 'Claude 3.7 Sonnet', 'Claude 3.7 Sonnet (Reasoning)', 'Claude 4 Opus', 'Claude 4 Sonnet', 'Claude 4 Sonnet (Reasoning)'],
      consoleUrl: 'https://console.anthropic.com',
      hasChanges: false
    },
    {
      id: 'openai',
      provider: 'OpenAI',
      name: 'OpenAI API Key',
      value: '',
      isVisible: false,
      models: ['GPT-4.5', 'o3'],
      consoleUrl: 'https://platform.openai.com/api-keys',
      hasChanges: false
    },
    {
      id: 'google',
      provider: 'Google',
      name: 'Google API Key',
      value: '',
      isVisible: false,
      models: ['Gemini 2.0 Flash', 'Gemini 2.0 Flash Lite', 'Gemini 2.5 Flash', 'Gemini 2.5 Flash (Thinking)', 'Gemini 2.5 Pro'],
      consoleUrl: 'https://console.cloud.google.com',
      hasChanges: false
    }
  ]);

  const toggleVisibility = (id: string) => {
    setApiKeys(keys => 
      keys.map(key => 
        key.id === id ? { ...key, isVisible: !key.isVisible } : key
      )
    );
  };

  const updateApiKey = (id: string, value: string) => {
    setApiKeys(keys => 
      keys.map(key => 
        key.id === id ? { ...key, value, hasChanges: true } : key
      )
    );
  };

  const handleSave = (id: string) => {
    // Here you would typically save to your backend/storage
    const apiKey = apiKeys.find(key => key.id === id);
    console.log(`Saving ${apiKey?.provider} API key:`, apiKey?.value);
    
    setApiKeys(keys => 
      keys.map(key => 
        key.id === id ? { ...key, hasChanges: false } : key
      )
    );
    
    // Show success message (you could use a toast library here)
    alert(`${apiKey?.provider} API key saved successfully!`);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 3) + '...';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <Key className="h-4 w-4 text-gray-500 mr-3" />
              <h3 className="text-sm font-medium text-gray-700">{apiKey.provider} API Key</h3>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Used for the following models:</p>
              <div className="flex flex-wrap gap-1">
                {apiKey.models.map((model, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="relative mb-3">
              <input
                type={apiKey.isVisible ? 'text' : 'password'}
                value={apiKey.value}
                onChange={(e) => updateApiKey(apiKey.id, e.target.value)}
                placeholder={apiKey.isVisible ? `Enter your ${apiKey.provider} API key` : maskKey(apiKey.value) || 'sk-...'}
                className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleVisibility(apiKey.id)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {apiKey.isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-600">
                <span>Get your API key from </span>
                <a
                  href={apiKey.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 ml-1 inline-flex items-center transition-colors"
                >
                  {apiKey.provider}'s Console
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <button
                onClick={() => handleSave(apiKey.id)}
                disabled={!apiKey.hasChanges}
                className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}