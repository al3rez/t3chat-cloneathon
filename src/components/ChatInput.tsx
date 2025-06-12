import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Globe } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AIModel, ModelConfig } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, useWebSearch?: boolean) => void;
  isLoading: boolean;
  selectedModel: AIModel;
  models: ModelConfig[];
  onModelSelect: (model: AIModel) => void;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading, 
  selectedModel, 
  models, 
  onModelSelect 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if current model supports web search (only Gemini models)
  const supportsWebSearch = selectedModel.includes('gemini');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), webSearchEnabled && supportsWebSearch);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const toggleWebSearch = () => {
    if (supportsWebSearch) {
      setWebSearchEnabled(!webSearchEnabled);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [message]);

  // Reset web search when switching to non-Gemini models
  useEffect(() => {
    if (!supportsWebSearch) {
      setWebSearchEnabled(false);
    }
  }, [supportsWebSearch]);

  return (
    <div className="w-full px-2 pb-2">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        <div className="relative">
          <div 
            className="rounded-t-[20px] p-2 pb-0 backdrop-blur-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <form onSubmit={handleSubmit} className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-white/50 px-3 pt-3 text-gray-700 outline outline-8 outline-purple-500/20 pb-6"
              style={{
                boxShadow: `
                  rgba(0, 0, 0, 0.1) 0px 80px 50px 0px,
                  rgba(0, 0, 0, 0.07) 0px 50px 30px 0px,
                  rgba(0, 0, 0, 0.06) 0px 30px 15px 0px,
                  rgba(0, 0, 0, 0.04) 0px 15px 8px,
                  rgba(0, 0, 0, 0.04) 0px 6px 4px,
                  rgba(0, 0, 0, 0.02) 0px 2px 2px
                `
              }}
            >
              <div className="flex flex-grow flex-col">
                <div></div>
                <div className="flex flex-grow flex-row items-start">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="w-full resize-none bg-transparent text-base leading-6 text-gray-900 outline-none placeholder:text-gray-500 disabled:opacity-50"
                    aria-label="Message input"
                    aria-describedby="chat-input-description"
                    autoComplete="off"
                    style={{ height: '48px !important' }}
                    disabled={isLoading}
                  />
                  <div id="chat-input-description" className="sr-only">
                    Press Enter to send, Shift + Enter for new line
                  </div>
                </div>
                
                <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
                  <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2" aria-label="Message actions">
                    <button
                      type="submit"
                      disabled={!message.trim() || isLoading}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-600 font-semibold shadow hover:from-purple-700 hover:to-pink-700 active:from-purple-600 active:to-pink-600 disabled:hover:from-purple-600 disabled:hover:to-pink-600 h-9 w-9 relative rounded-lg p-2 text-white"
                      aria-label={message.trim() ? "Send message" : "Message requires text"}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                    <div className="ml-[-7px] flex items-center gap-1">
                      <ModelSelector
                        selectedModel={selectedModel}
                        models={models}
                        onModelSelect={onModelSelect}
                      />
                      
                      <button
                        type="button"
                        onClick={toggleWebSearch}
                        disabled={!supportsWebSearch}
                        className={`inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 px-3 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid py-1.5 pl-2 pr-2.5 ${
                          webSearchEnabled && supportsWebSearch
                            ? 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'
                            : supportsWebSearch
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label={
                          !supportsWebSearch 
                            ? "Web search only available with Gemini models"
                            : webSearchEnabled 
                            ? "Web search enabled" 
                            : "Enable web search"
                        }
                        title={
                          !supportsWebSearch 
                            ? "Web search only available with Gemini models"
                            : webSearchEnabled 
                            ? "Web search enabled - responses will include real-time web results" 
                            : "Enable web search for real-time information"
                        }
                      >
                        <Globe className={`h-4 w-4 ${webSearchEnabled && supportsWebSearch ? 'text-purple-600' : ''}`} />
                        <span className="max-sm:hidden">Search</span>
                        {webSearchEnabled && supportsWebSearch && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-500 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-gray-200 px-2 py-1.5 pr-2.5 text-gray-600"
                        aria-label="Attaching files is a subscriber-only feature"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}