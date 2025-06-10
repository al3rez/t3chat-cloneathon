import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  MessageSquare, 
  User, 
  Pin,
  X,
  MoreHorizontal,
  LogIn,
  LogOut,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chat, User as UserType } from '../types';
import { groupChatsByDate } from '../utils/dateUtils';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChat: Chat | null;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
}

export function Sidebar({ 
  isOpen, 
  onToggle, 
  chats, 
  activeChat, 
  onNewChat, 
  onSelectChat,
  onDeleteChat 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = groupChatsByDate(filteredChats);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleUserClick = () => {
    if (user) {
      navigate('/settings/api-keys');
    }
  };

  const T3Logo = () => (
    <svg 
      version="1.1" 
      id="Layer_1" 
      xmlns="http://www.w3.org/2000/svg" 
      x="0px" 
      y="0px" 
      viewBox="0 0 247.7 53" 
      className="h-3.5 w-24 text-gray-800"
    >
      <path 
        fill="currentColor" 
        d="M205.6,50.3c1.9-1,3.5-2.2,4.7-3.6v4.4v0.4h0.4h7.7h0.4v-0.4V13.5v-0.4h-0.4h-7.7h-0.4v0.4v4.3
        c-1.2-1.4-2.8-2.6-4.6-3.5c-2.2-1.2-4.8-1.8-7.8-1.8c-3.3,0-6.3,0.8-9,2.5c-2.7,1.7-4.9,4-6.4,6.9l0,0c-1.6,3-2.4,6.4-2.4,10.2
        c0,3.8,0.8,7.3,2.4,10.3c1.6,3,3.7,5.4,6.4,7.1c2.7,1.7,5.7,2.6,8.9,2.6C200.6,52.1,203.3,51.5,205.6,50.3z M208.7,25.7l0.3,0.5
        c0.8,1.7,1.2,3.7,1.2,6c0,2.5-0.5,4.7-1.5,6.6c-1,1.9-2.4,3.3-4,4.2c-1.6,1-3.4,1.5-5.3,1.5c-1.9,0-3.6-0.5-5.3-1.5
        c-1.7-1-3-2.4-4-4.3c-1-1.9-1.5-4.1-1.5-6.6c0-2.5,0.5-4.7,1.5-6.5c1-1.8,2.3-3.2,4-4.1c1.6-1,3.4-1.4,5.3-1.4
        c1.9,0,3.7,0.5,5.3,1.4C206.4,22.5,207.7,23.9,208.7,25.7z"
      />
      <path 
        fill="currentColor" 
        d="M99.6,21.4L99.6,21.4l-0.3,0.5c-1.6,3-2.4,6.5-2.4,10.4s0.8,7.4,2.4,10.4c1.6,3,3.8,5.3,6.6,7
        c2.8,1.7,6,2.5,9.6,2.5c4.5,0,8.2-1.2,11.3-3.5c3-2.3,5.1-5.4,6.2-9.3l0.1-0.5h-0.5h-8.3H124l-0.1,0.3c-0.7,1.9-1.7,3.3-3.1,4.3
        c-1.4,0.9-3.1,1.4-5.3,1.4c-3,0-5.4-1.1-7.2-3.3l0,0c-1.8-2.2-2.7-5.3-2.7-9.3c0-4,0.9-7,2.7-9.2c1.8-2.2,4.2-3.2,7.2-3.2
        c2.2,0,3.9,0.5,5.3,1.5c1.4,1,2.4,2.4,3.1,4.2l0.1,0.3h0.3h8.3h0.5l-0.1-0.5c-1-4.1-3.1-7.3-6.1-9.5c-3-2.2-6.8-3.3-11.4-3.3
        c-3.6,0-6.8,0.8-9.6,2.5l0,0C103.2,16.4,101.1,18.6,99.6,21.4z"
      />
      <g>
        <polygon 
          fill="currentColor" 
          points="237.8,13.2 237.8,3.9 229.1,3.9 229.1,13.2 224.8,13.2 224.8,20.5 229.1,20.5 229.1,52.1 230,51.2 
          230,51.2 232,49.2 237.8,43.2 237.8,20.5 246.8,20.5 246.8,13.2"
        />
        <path fill="currentColor" d="M71.7,3.4H51.5l-7.1,7.2h18.8"/>
        <path 
          fill="currentColor" 
          d="M166.8,14.5l-0.1-0.1c-2.3-1.3-4.9-1.9-7.7-1.9c-2.4,0-4.6,0.5-6.7,1.3c-1.6,0.7-3,1.7-4.2,2.8V0.1l-8.6,8.8
          v42.7h8.6V30.1c0-3.2,0.8-5.7,2.4-7.3c1.6-1.7,3.7-2.5,6.4-2.5s4.8,0.8,6.4,2.5c1.6,1.7,2.3,4.2,2.3,7.4v21.4h8.5V29
          c0-3.5-0.6-6.4-1.9-8.9C170.8,17.6,169,15.7,166.8,14.5z"
        />
        <path fill="currentColor" d="M43,3.4H0v0.5l0,0v3.2v3.7h3.5l0,0h11.9v40.8H24V10.7h11.8L43,3.4z"/>
      </g>
      <path 
        fill="currentColor" 
        d="M71.9,25.4l-0.2-0.2h0c-2.2-2.3-5.3-3.7-9.1-4.2L73.4,9.8V3.4H54.8l-9.4,7.2h17.7L52.5,21.8v5.9h7
        c2.5,0,4.4,0.7,5.9,2.2c1.4,1.4,2.1,3.4,2.1,6.1c0,2.6-0.7,4.7-2.1,6.2c-1.4,1.5-3.4,2.2-5.9,2.2c-2.5,0-4.4-0.7-5.7-2
        c-1.4-1.4-2.1-3.1-2.3-5.2l0-0.5h-8.1l0,0.5c0.2,4.6,1.8,8.1,4.8,10.5c2.9,2.4,6.7,3.7,11.3,3.7c5,0,9-1.4,11.9-4.2
        c2.9-2.8,4.4-6.6,4.4-11.3C75.6,31.5,74.4,28,71.9,25.4z"
      />
      <rect x="84.3" y="44.2" fill="currentColor" width="6.9" height="6.9"/>
    </svg>
  );

  const ChatGroup = ({ title, chats: groupChats }: { title: string; chats: Chat[] }) => {
    if (groupChats.length === 0) return null;

    return (
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none transition-[margin,opacity] duration-200 ease-snappy px-1.5 text-gray-600">
          <span>{title}</span>
        </div>
        <div className="w-full text-sm">
          <ul className="flex w-full min-w-0 flex-col gap-1">
            {groupChats.map(chat => (
              <li key={chat.id} className="group/menu-item relative">
                <div
                  className={`group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="relative flex w-full items-center">
                    <button className="w-full">
                      <div className="relative w-full">
                        <input
                          aria-label="Thread title"
                          aria-readonly="true"
                          readOnly
                          tabIndex={-1}
                          className="h-full w-full rounded bg-transparent px-1 py-1 text-sm outline-none pointer-events-none cursor-pointer overflow-hidden truncate text-inherit"
                          title={chat.title}
                          type="text"
                          value={chat.title}
                        />
                      </div>
                    </button>
                    <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-gray-500 transition-transform group-hover/link:translate-x-0 group-hover/link:bg-gray-100">
                      <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-gray-100 to-transparent opacity-0 group-hover/link:opacity-100"></div>
                      <button 
                        className="rounded-md p-1.5 hover:bg-gray-200"
                        tabIndex={-1}
                        aria-label="Pin thread"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button 
                        className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-600"
                        tabIndex={-1}
                        aria-label="Delete thread"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay - only show on small screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Always visible on sm+ screens, toggleable on mobile */}
      <div className={`
        group peer fixed inset-y-0 h-screen w-72 transition-transform duration-300 ease-snappy flex left-0 z-50 border-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        sm:relative sm:transform-none bg-gray-50
      `}>
        <div className="relative h-full w-72 bg-transparent ease-snappy transition-[width]"></div>
        <div className="fixed inset-y-0 h-screen w-72 transition-[transform,opacity] ease-snappy flex left-0 p-2 z-50 border-none">
          <div className="flex h-full w-full flex-col bg-gray-50">
            
            {/* Header */}
            <div className="flex flex-col gap-2 relative m-1 mb-0 space-y-1 p-0 pt-4">
              <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-gray-800 transition-opacity delay-75 duration-75">
                <div className="relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-gray-800">
                  <div className="h-3.5 select-none">
                    <T3Logo />
                  </div>
                </div>
              </h1>
              
              <div className="px-1">
                <button
                  onClick={onNewChat}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-2 font-semibold text-white shadow hover:from-purple-700 hover:to-pink-700 active:from-purple-600 active:to-pink-600 h-9 px-4 py-2 w-full select-none text-sm"
                >
                  <span className="w-full select-none text-center">New Chat</span>
                </button>
              </div>
              
              <div className="border-b border-gray-200 px-3">
                <div className="flex items-center">
                  <Search className="-ml-[3px] mr-3 w-4 h-4 text-gray-500" />
                  <input
                    role="searchbox"
                    aria-label="Search threads"
                    placeholder="Search your threads..."
                    className="w-full bg-transparent py-2 text-sm text-gray-800 placeholder-gray-500 placeholder:select-none focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden relative pb-2 hide-scrollbar">
              {chats.length === 0 && user ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No chats yet. Start a new conversation!
                </div>
              ) : (
                <div className="w-full">
                  <ChatGroup title="Today" chats={groupedChats.today} />
                  <ChatGroup title="Yesterday" chats={groupedChats.yesterday} />
                  <ChatGroup title="Last 7 Days" chats={groupedChats.lastWeek} />
                  <ChatGroup title="Last 30 Days" chats={groupedChats.lastMonth} />
                  <ChatGroup title="Older" chats={groupedChats.older} />
                </div>
              )}
            </div>

            {/* User Profile / Login */}
            <div className="flex flex-col gap-2 m-0 p-2 pt-0">
              {user ? (
                <div 
                  onClick={handleUserClick}
                  className="flex select-none flex-row items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-2 cursor-pointer transition-colors group"
                >
                  <div className="flex w-full min-w-0 flex-row items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center ring-1 ring-gray-200">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex min-w-0 flex-col text-gray-800">
                      <span className="truncate text-sm font-medium">{user.email}</span>
                      <span className="text-xs text-gray-600 capitalize">free</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick();
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-md transition-all"
                      aria-label="Settings"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-md transition-all"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex select-none flex-row items-center gap-3 rounded-lg px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-2 cursor-pointer transition-colors border border-gray-200 justify-start"
                  aria-label="Login to your account"
                >
                  <LogIn className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}