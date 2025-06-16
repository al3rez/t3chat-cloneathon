import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle, ExternalLink, Trash2, Check } from 'lucide-react';
import { saveApiKey, getUserApiKeys, deleteApiKey, ApiKey } from '../../lib/apiKeys';

interface ApiKeyConfig {
  id: string;
  provider: 'google' | 'openai' | 'openrouter';
  name: string;
  value: string;
  isVisible: boolean;
  models: string[];
  consoleUrl: string;
  hasChanges: boolean;
  isSaved: boolean;
}

export function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    {
      id: 'google',
      provider: 'google',
      name: 'Google API Key',
      value: '',
      isVisible: false,
      models: ['Gemini 2.5 Flash', 'Gemini 2.5 Pro'],
      consoleUrl: 'https://aistudio.google.com/app/apikey',
      hasChanges: false,
      isSaved: false
    },
    {
      id: 'openrouter',
      provider: 'openrouter',
      name: 'OpenRouter API Key (OpenAI / OpenRouter)',
      value: '',
      isVisible: false,
      models: ['GPT-4o', 'GPT-4o Mini', 'GPT-3.5 Turbo'],
      consoleUrl: 'https://openrouter.ai/keys',
      hasChanges: false,
      isSaved: false
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load saved API keys on component mount
  useEffect(() => {
    loadSavedApiKeys();
  }, []);

  const loadSavedApiKeys = async () => {
    try {
      const savedKeys = await getUserApiKeys();
      setApiKeys(prev => prev.map(key => ({
        ...key,
        isSaved: savedKeys.some(saved => saved.provider === key.provider),
        value: savedKeys.some(saved => saved.provider === key.provider) ? '••••••••••••••••' : ''
      })));
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

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
        key.id === id ? { 
          ...key, 
          value, 
          hasChanges: value !== '' && value !== '••••••••••••••••',
          isSaved: false
        } : key
      )
    );
  };

  const handleSave = async (id: string) => {
    const apiKey = apiKeys.find(key => key.id === id);
    if (!apiKey || !apiKey.value || apiKey.value === '••••••••••••••••') return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await saveApiKey(apiKey.provider, apiKey.value);
      
      if (result.success) {
        setApiKeys(keys => 
          keys.map(key => 
            key.id === id ? { 
              ...key, 
              hasChanges: false, 
              isSaved: true,
              value: '••••••••••••••••',
              isVisible: false
            } : key
          )
        );
        setMessage({ type: 'success', text: `${apiKey.name} saved successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    const apiKey = apiKeys.find(key => key.id === id);
    if (!apiKey) return;

    if (!confirm(`Are you sure you want to delete your ${apiKey.name}?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await deleteApiKey(apiKey.provider);
      
      if (result.success) {
        setApiKeys(keys => 
          keys.map(key => 
            key.id === id ? { 
              ...key, 
              value: '',
              hasChanges: false, 
              isSaved: false,
              isVisible: false
            } : key
          )
        );
        setMessage({ type: 'success', text: `${apiKey.name} deleted successfully!` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key === '••••••••••••••••') return key;
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 3) + '•'.repeat(Math.min(key.length - 6, 10)) + key.substring(key.length - 3);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {message && (
        <div className={`mb-6 flex items-center gap-2 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Key className="h-4 w-4 text-gray-500 mr-3" />
                <h3 className="text-sm font-medium text-gray-700">{apiKey.name}</h3>
                {apiKey.isSaved && (
                  <div className="ml-2 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <Check className="w-3 h-3" />
                    Saved
                  </div>
                )}
              </div>
              
              {apiKey.isSaved && (
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                  title="Delete API key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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
                placeholder={apiKey.isVisible ? `Enter your ${apiKey.name}` : maskKey(apiKey.value) || 'sk-...'}
                className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleVisibility(apiKey.id)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
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
                  {apiKey.provider === 'google' ? 'Google AI Studio' : 
                   'OpenRouter Dashboard'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <button
                onClick={() => handleSave(apiKey.id)}
                disabled={!apiKey.hasChanges || loading}
                className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Security Notice</h4>
        <p className="text-sm text-blue-700">
          Your API keys are encrypted and stored securely in your database. They are only decrypted when needed to make API calls and are never transmitted in plain text.
        </p>
      </div>
    </div>
  );
}