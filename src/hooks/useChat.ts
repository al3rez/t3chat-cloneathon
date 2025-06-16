import { useState, useCallback, useEffect } from 'react';
import { Chat, Message, AIModel, Thread, DatabaseMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { generateAIResponse, generateAIResponseWithSearch, getGoogleModelId } from '../lib/aiService';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-pro');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load user's threads from Supabase
  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      setActiveChat(null);
      return;
    }

    try {
      console.log('Loading chats for user:', user.id);
      
      // Fetch threads
      const { data: threads, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (threadsError) {
        console.error('Error loading threads:', threadsError);
        return;
      }

      console.log('Loaded threads:', threads);

      if (!threads || threads.length === 0) {
        setChats([]);
        return;
      }

      // Fetch messages for all threads
      const threadIds = threads.map(t => t.id);
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }

      console.log('Loaded messages:', messages);

      // Group messages by thread
      const messagesByThread = (messages || []).reduce((acc, msg) => {
        if (!acc[msg.thread_id]) {
          acc[msg.thread_id] = [];
        }
        acc[msg.thread_id].push({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          timestamp: new Date(msg.created_at),
          thread_id: msg.thread_id
        });
        return acc;
      }, {} as Record<string, Message[]>);

      // Convert threads to chats
      const chatsData: Chat[] = threads.map(thread => ({
        id: thread.id,
        title: thread.title,
        model: thread.model,
        createdAt: new Date(thread.created_at),
        updatedAt: new Date(thread.updated_at),
        messages: messagesByThread[thread.id] || []
      }));

      console.log('Final chats data:', chatsData);
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [user]);

  // Load chats when user changes
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createNewChat = useCallback(async () => {
    if (!user) {
      console.log('No user, cannot create chat');
      return null;
    }

    try {
      console.log('Creating new chat for user:', user.id);
      
      const { data: thread, error } = await supabase
        .from('threads')
        .insert({
          user_id: user.id,
          title: 'New Chat',
          model: selectedModel
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating thread:', error);
        return null;
      }

      console.log('Created thread:', thread);

      const newChat: Chat = {
        id: thread.id,
        title: thread.title,
        model: thread.model,
        createdAt: new Date(thread.created_at),
        updatedAt: new Date(thread.updated_at),
        messages: []
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  }, [selectedModel, user]);

  // Function to create a new chat and send the first message atomically
  const createChatAndSendMessage = useCallback(async (content: string, useWebSearch: boolean = false) => {
    if (!user) {
      console.log('No user, cannot create chat');
      return;
    }

    try {
      console.log('Creating new chat and sending first message for user:', user.id);
      
      const { data: thread, error } = await supabase
        .from('threads')
        .insert({
          user_id: user.id,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          model: selectedModel
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating thread:', error);
        return;
      }

      console.log('Created thread:', thread);

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date(),
        thread_id: thread.id
      };

      const newChat: Chat = {
        id: thread.id,
        title: thread.title,
        model: thread.model,
        createdAt: new Date(thread.created_at),
        updatedAt: new Date(thread.updated_at),
        messages: [userMessage]
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setIsLoading(true);

      try {
        // Save user message to database
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            thread_id: thread.id,
            content,
            role: 'user'
          });

        if (messageError) {
          console.error('Error saving user message:', messageError);
        }

        // Generate AI response
        const googleModelId = getGoogleModelId(selectedModel);
        const conversationHistory = [{ role: 'user', content }];

        let aiResult;
        if (useWebSearch && selectedModel.includes('gemini')) {
          console.log('Using web search for AI response');
          aiResult = await generateAIResponseWithSearch(conversationHistory, googleModelId);
        } else {
          console.log('Using standard AI response');
          aiResult = await generateAIResponse(conversationHistory, googleModelId);
        }

        let aiResponse: string;
        let sources: any[] = [];
        
        if (aiResult.success && aiResult.content) {
          aiResponse = aiResult.content;
          sources = aiResult.sources || [];
        } else {
          aiResponse = aiResult.error || 'Sorry, I encountered an error while processing your request.';
        }

        // Don't add sources to content - they'll be handled separately in UI
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          role: 'assistant',
          timestamp: new Date(),
          thread_id: thread.id,
          sources: sources
        };

        const finalChat = {
          ...newChat,
          messages: [userMessage, aiMessage],
          updatedAt: new Date()
        };

        setActiveChat(finalChat);
        setChats(prev => prev.map(chat => chat.id === thread.id ? finalChat : chat));
        setIsLoading(false);

        // Save AI response to database
        const { error: aiMessageError } = await supabase
          .from('messages')
          .insert({
            thread_id: thread.id,
            content: aiResponse,
            role: 'assistant'
          });

        if (aiMessageError) {
          console.error('Error saving AI message:', aiMessageError);
        }

        // Update thread updated_at
        const { error: updateError } = await supabase
          .from('threads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', thread.id);

        if (updateError) {
          console.error('Error updating thread timestamp:', updateError);
        }

        // Reload chats to ensure consistency
        await loadChats();
      } catch (error) {
        console.error('Error processing message:', error);
        setIsLoading(false);
        
        // Show error message to user
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error while processing your request. Please check your API key settings.',
          role: 'assistant',
          timestamp: new Date(),
          thread_id: thread.id
        };

        const errorChat = {
          ...newChat,
          messages: [userMessage, errorMessage],
          updatedAt: new Date()
        };

        setActiveChat(errorChat);
        setChats(prev => prev.map(chat => chat.id === thread.id ? errorChat : chat));
      }
    } catch (error) {
      console.error('Error creating new chat and sending message:', error);
    }
  }, [selectedModel, user, loadChats]);

  const sendMessage = useCallback(async (content: string, useWebSearch: boolean = false) => {
    if (!activeChat || !user) {
      console.log('No active chat or user');
      return;
    }

    console.log('Sending message:', content, 'with web search:', useWebSearch);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      thread_id: activeChat.id
    };

    // Update local state immediately
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      title: activeChat.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : activeChat.title,
      updatedAt: new Date()
    };

    setActiveChat(updatedChat);
    setChats(prev => prev.map(chat => chat.id === activeChat.id ? updatedChat : chat));
    setIsLoading(true);

    try {
      // Save user message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: activeChat.id,
          content,
          role: 'user'
        });

      if (messageError) {
        console.error('Error saving user message:', messageError);
      }

      // Update thread title if it's the first message
      if (activeChat.messages.length === 0) {
        const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        const { error: titleError } = await supabase
          .from('threads')
          .update({ 
            title: newTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeChat.id);

        if (titleError) {
          console.error('Error updating thread title:', titleError);
        }
      }

      // Generate AI response using the user's API key
      const googleModelId = getGoogleModelId(selectedModel);
      const conversationHistory = [
        ...activeChat.messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content }
      ];

      let aiResult;
      if (useWebSearch && selectedModel.includes('gemini')) {
        console.log('Using web search for AI response');
        aiResult = await generateAIResponseWithSearch(conversationHistory, googleModelId);
      } else {
        console.log('Using standard AI response');
        aiResult = await generateAIResponse(conversationHistory, googleModelId);
      }

      let aiResponse: string;
      let sources: any[] = [];
      
      if (aiResult.success && aiResult.content) {
        aiResponse = aiResult.content;
        sources = aiResult.sources || [];
      } else {
        aiResponse = aiResult.error || 'Sorry, I encountered an error while processing your request.';
      }

      // Don't add sources to content - they'll be handled separately in UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        thread_id: activeChat.id,
        sources: sources
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date()
      };

      setActiveChat(finalChat);
      setChats(prev => prev.map(chat => chat.id === activeChat.id ? finalChat : chat));
      setIsLoading(false);

      // Save AI response to database
      try {
        const { error: aiMessageError } = await supabase
          .from('messages')
          .insert({
            thread_id: activeChat.id,
            content: aiResponse,
            role: 'assistant'
          });

        if (aiMessageError) {
          console.error('Error saving AI message:', aiMessageError);
        }

        // Update thread updated_at
        const { error: updateError } = await supabase
          .from('threads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeChat.id);

        if (updateError) {
          console.error('Error updating thread timestamp:', updateError);
        }

        // Reload chats to ensure consistency
        await loadChats();
      } catch (error) {
        console.error('Error saving AI response:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please check your API key settings.',
        role: 'assistant',
        timestamp: new Date(),
        thread_id: activeChat.id
      };

      const errorChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
        updatedAt: new Date()
      };

      setActiveChat(errorChat);
      setChats(prev => prev.map(chat => chat.id === activeChat.id ? errorChat : chat));
    }
  }, [activeChat, selectedModel, user, loadChats]);

  const selectChat = useCallback((chat: Chat) => {
    console.log('Selecting chat:', chat);
    setActiveChat(chat);
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return;

    try {
      console.log('Deleting chat:', chatId);
      
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting thread:', error);
        return;
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [activeChat, user]);

  return {
    chats,
    activeChat,
    selectedModel,
    isLoading,
    createNewChat,
    createChatAndSendMessage,
    sendMessage,
    selectChat,
    deleteChat,
    setSelectedModel
  };
}