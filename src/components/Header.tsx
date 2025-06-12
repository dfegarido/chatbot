import { Settings, Sun, Moon, Menu, Trash2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export function Header({ onOpenSettings, onToggleSidebar }: HeaderProps) {
  const { state, dispatch } = useChat();

  const handleThemeToggle = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: newTheme } });
  };

  const handleClearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      dispatch({ type: 'UPDATE_CHAT', payload: { 
        chatId: 'main-chat', 
        chat: { 
          messages: [], 
          updatedAt: new Date().toISOString() 
        } 
      }});
    }
  };



  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cupcake Lab AI Assistant
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleClearChatHistory}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
        </button>
        
        <button
          onClick={handleThemeToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle theme"
        >
          {state.settings.theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </header>
  );
}
