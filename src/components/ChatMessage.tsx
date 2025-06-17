import React, { useState } from 'react';
import { Copy, RotateCcw, Edit3, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message } from '../types';
import '../styles/highlight.css';

interface ChatMessageProps {
  message: Message;
  selectedModel?: string;
}

export function ChatMessage({ message, selectedModel }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  const hasSources = message.sources && message.sources.length > 0;

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

  };

  const handleEdit = () => {
    // TODO: Implement edit functionality

  };

  // Model display mapping
  const getModelDisplayName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      'gemini-pro': 'Gemini 2.5 Flash',
      'gemini-pro-2': 'Gemini 2.5 Pro',
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4': 'GPT-4',
      'claude-3-sonnet': 'Claude 3 Sonnet'
    };
    return modelMap[modelId] || modelId;
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
                <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{message.content}</div>
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
              <div className="relative w-4 h-4">
                <Copy className={`absolute inset-0 w-4 h-4 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
                <Check className={`absolute inset-0 w-4 h-4 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
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
      <div className="group w-full max-w-[80%]">
        <div 
          role="article" 
          aria-label="Assistant message"
          className="px-4 py-3 text-left"
        >
          <span className="sr-only">Assistant message: </span>
          <div className="flex flex-col gap-3">
            <div className="prose prose-gray max-w-none dark:prose-invert prose-pre:bg-gray-50 prose-pre:rounded-md prose-pre:p-3 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm text-sm leading-relaxed text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            {/* Sources section */}
            {hasSources && (
              <div className="mt-4 border-t border-gray-200 pt-3">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Sources ({message.sources?.length})
                </button>
                
                {showSources && (
                  <div className="mt-3 space-y-2">
                    {message.sources?.map((source, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                        <span className="text-xs text-gray-500 mt-0.5 min-w-[1.5rem]">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-700 underline break-words flex items-center gap-1"
                            >
                              {source.title || source.url}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-sm text-gray-700">{source.title || 'Unknown source'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons and model - positioned under the message, aligned to the left, only visible on hover */}
        <div className="flex items-center gap-1 mt-2 px-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0"
            aria-label="Copy message"
          >
            <div className="relative w-4 h-4">
              <Copy className={`absolute inset-0 w-4 h-4 transition-all duration-200 ease-snappy ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
              <Check className={`absolute inset-0 w-4 h-4 transition-all duration-200 ease-snappy ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            </div>
          </button>
          
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 disabled:hover:bg-transparent disabled:hover:text-gray-600 text-xs h-8 w-8 rounded-lg p-0"
            aria-label="Retry message"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <span className="text-xs text-gray-500 ml-2">
            {selectedModel ? getModelDisplayName(selectedModel) : 'o4-mini'}
            {hasSources && <span className="ml-1">• Web Search</span>}
          </span>
        </div>
      </div>
    </div>
  );
}