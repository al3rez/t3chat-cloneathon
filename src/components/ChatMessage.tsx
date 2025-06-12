import React, { useState } from 'react';
import { Copy, RotateCcw, Edit3, Check } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRetry = () => {
    // TODO: Implement retry functionality
    console.log('Retry message');
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit message');
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="group relative inline-block max-w-[80%] break-words">
          <div 
            role="article" 
            aria-label="Your message"
            className="rounded-xl border border-gray-200/50 bg-gray-50/50 px-4 py-3 text-left shadow-sm"
          >
            <span className="sr-only">Your message: </span>
            <div className="flex flex-col gap-3">
              <div className="prose prose-gray max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 m-0">{message.content}</p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="absolute right-0 mt-2 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0 bg-white/90 backdrop-blur-sm"
              aria-label="Retry message"
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0 bg-white/90 backdrop-blur-sm"
              aria-label="Edit message"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0 bg-white/90 backdrop-blur-sm"
              aria-label="Copy message"
            >
              <div className="relative size-4">
                <Copy className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
                <Check className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - no border, background, just text on default background
  return (
    <div className="flex justify-start mb-6">
      <div className="group relative inline-block max-w-[80%] break-words">
        <div 
          role="article" 
          aria-label="Assistant message"
          className="px-4 py-3 text-left"
        >
          <span className="sr-only">Assistant message: </span>
          <div className="flex flex-col gap-3">
            <div className="prose prose-gray max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 m-0">{message.content}</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="absolute right-0 mt-2 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0 bg-white/90 backdrop-blur-sm"
            aria-label="Retry message"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0 bg-white/90 backdrop-blur-sm"
            aria-label="Copy message"
          >
            <div className="relative size-4">
              <Copy className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
              <Check className={`absolute inset-0 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}