import React from 'react';
import { Sparkles, FileText, Code, GraduationCap } from 'lucide-react';

interface EmptyStateProps {
  userName: string;
  onPromptClick: (prompt: string) => void;
  samplePrompts: string[];
}

export function EmptyState({ userName, onPromptClick, samplePrompts }: EmptyStateProps) {
  const actionButtons = [
    { icon: Sparkles, label: 'Create' },
    { icon: FileText, label: 'Explore' },
    { icon: Code, label: 'Code' },
    { icon: GraduationCap, label: 'Learn' }
  ];

  return (
    <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Main Heading - Left aligned */}
        <h1 className="text-3xl font-bold text-gray-800 text-left">
          {userName && userName !== 'Guest' ? `How can I help you, ${userName}?` : 'How can I help you?'}
        </h1>
        
        {/* Action Buttons - Left aligned */}
        <div className="flex flex-wrap gap-3">
          {actionButtons.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex select-none flex-row items-center gap-3 rounded-full px-3 py-1.5 hover:bg-gray-100 focus:bg-gray-100 focus:outline-2 cursor-pointer transition-colors border border-gray-200 justify-start"
            >
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </button>
          ))}
        </div>

        {/* Sample Prompts - Left aligned */}
        <div className="flex flex-col text-gray-800">
          {samplePrompts.map((prompt, index) => (
            <div
              key={index}
              className="flex items-start gap-2 border-t border-gray-200/40 py-1 first:border-none"
            >
              <button
                onClick={() => onPromptClick(prompt)}
                className="w-full rounded-md py-2 text-left text-gray-600 hover:bg-gray-100 sm:px-3 transition-colors"
              >
                <span>{prompt}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}