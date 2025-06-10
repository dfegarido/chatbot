import React from 'react';
import { Plus, X, MessageCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn, formatDate, truncateText } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, dispatch, createNewChat } = useChat();

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
    }
  };

  const handleClearCurrentChat = () => {
    if (!state.currentChatId) return;
    if (confirm('Are you sure you want to clear this chat?')) {
      dispatch({ 
        type: 'UPDATE_CHAT', 
        payload: { 
          chatId: state.currentChatId, 
          chat: { messages: [], title: 'New Chat' } 
        }
      });
    }
  };

  const sortedChats = Object.values(state.chats)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900",
        "border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={createNewChat}
            className="flex-1 flex items-center gap-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mb-4" />
              <p className="text-sm text-center">No chats yet.<br />Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChats.map((chat) => {
                const isActive = chat.id === state.currentChatId;
                const lastMessage = chat.messages[chat.messages.length - 1];
                const preview = lastMessage 
                  ? truncateText(lastMessage.content, 60)
                  : 'No messages yet';

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      dispatch({ type: 'SET_CURRENT_CHAT', payload: chat.id });
                      onClose();
                    }}
                    className={cn(
                      "group p-3 rounded-lg cursor-pointer transition-colors",
                      isActive 
                        ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-medium truncate",
                          isActive 
                            ? "text-primary-900 dark:text-primary-100"
                            : "text-gray-900 dark:text-gray-100"
                        )}>
                          {chat.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {preview}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(chat.updatedAt)}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 transition-all"
                        title="Delete chat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.currentChatId && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClearCurrentChat}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear Current Chat
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
