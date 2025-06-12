import React from 'react';

export function LoadingMessage() {
  return (
    <div className="flex justify-start mb-6">
      <div className="px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span className="text-sm text-gray-600 italic">Thinking...</span>
        </div>
      </div>
    </div>
  );
}