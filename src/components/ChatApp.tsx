import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { LoadingMessage } from './LoadingMessage';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { availableModels, samplePrompts } from '../data/mockData';

export function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const {
    chats,
    activeChat,
    selectedModel,
    isLoading,
    createNewChat,
    sendMessage,
    selectChat,
    deleteChat,
    setSelectedModel
  } = useChat();

  const handleSendMessage = async (message: string) => {
    if (!activeChat) {
      // Wait for the new chat to be created before sending the message
      const newChat = await createNewChat();
      if (newChat) {
        // Send the message to the newly created chat
        sendMessage(message);
      }
    } else {
      sendMessage(message);
    }
  };

  const handlePromptClick = async (prompt: string) => {
    if (!activeChat) {
      // Wait for the new chat to be created before sending the prompt
      const newChat = await createNewChat();
      if (newChat) {
        // Send the prompt to the newly created chat
        sendMessage(prompt);
      }
    } else {
      sendMessage(prompt);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChat={activeChat}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />

      {/* Main Content - Adjust margin for sidebar */}
      <div className="flex-1 flex flex-col sm:ml-0 relative transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl min-h-0">
        {/* Header - Container always visible, content conditionally visible */}
        <header className="bg-white border-l border-r border-t border-gray-200 rounded-tl-lg rounded-tr-lg m-2 mb-0 p-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full sm:hidden">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">T3.chat</h1>
            </div>
          </div>
        </header>

        {/* Chat Area - Now properly sized with flexbox */}
        <div className="flex-1 flex flex-col relative bg-white border-l border-r border-gray-200 mx-2 min-h-0">
          {!activeChat ? (
            <EmptyState
              userName={user?.email?.split('@')[0] || 'Guest'}
              onPromptClick={handlePromptClick}
              samplePrompts={samplePrompts}
            />
          ) : (
            <>
              {/* Messages Container - Takes remaining space and scrolls */}
              <div className="flex-1 overflow-y-auto p-6 pb-32 hide-scrollbar min-h-0">
                <div className="max-w-4xl mx-auto">
                  {activeChat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && <LoadingMessage />}
                </div>
              </div>
            </>
          )}

          {/* Chat Input - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
              models={availableModels}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}