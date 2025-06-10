import { Menu, Settings, Sun, Moon } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/utils';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export function Header({ onToggleSidebar, onOpenSettings }: HeaderProps) {
  const { state, dispatch } = useChat();
  const currentChat = state.currentChatId ? state.chats[state.currentChatId] : null;

  const handleThemeToggle = () => {
    const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: newTheme } });
  };

  const handleModelChange = (model: string) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { model } });
  };

  const getModelOptions = () => {
    if (state.settings.apiProvider === 'groq') {
      return ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    } else {
      return ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentChat?.title || 'AI Assistant'}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <select
          value={state.settings.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          )}
        >
          {getModelOptions().map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        
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
