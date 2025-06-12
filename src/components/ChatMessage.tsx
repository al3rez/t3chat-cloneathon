import React from 'react';
import { Message } from '../types';
import { formatDate } from '../utils/dateUtils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[70%] ${isUser ? '' : ''}`}>
        <div className={`
          p-4 rounded-2xl shadow-sm
          ${isUser 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto' 
            : 'bg-white border border-gray-200 text-gray-800'
          }
        `}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatDate(message.timestamp)}
        </p>
      </div>
    </div>
  );
}