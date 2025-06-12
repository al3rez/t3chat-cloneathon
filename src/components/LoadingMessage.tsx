import React from 'react';

export function LoadingMessage() {
  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-600 italic">
          &gt; Thinking...
        </p>
      </div>
    </div>
  );
}