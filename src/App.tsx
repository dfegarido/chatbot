import { useState, useEffect } from 'react';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { ChatInput } from '@/components/ChatInput';
import { SettingsModal } from '@/components/SettingsModal';

function AppContent() {
  const { createNewChat, state } = useChat();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if API configuration is missing and auto-open settings
  useEffect(() => {
    const checkApiConfiguration = () => {
      const { apiProvider, groqApiKey, openaiApiKey, ollamaUrl } = state.settings;
      
      let hasValidConfig = false;
      
      if (apiProvider === 'groq' && groqApiKey && groqApiKey.trim() !== '') {
        hasValidConfig = true;
      } else if (apiProvider === 'openai' && openaiApiKey && openaiApiKey.trim() !== '') {
        hasValidConfig = true;
      } else if (apiProvider === 'ollama' && ollamaUrl && ollamaUrl.trim() !== '') {
        hasValidConfig = true;
      }
      
      if (!hasValidConfig) {
        setSettingsOpen(true);
      }
    };

    // Only check after settings are loaded (avoid checking default empty values)
    if (state.settings) {
      checkApiConfiguration();
    }
  }, [state.settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          createNewChat();
        } else if (e.key === 'k') {
          e.preventDefault();
          const chatInput = document.querySelector('textarea');
          chatInput?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <ChatArea />
        
        <ChatInput onOpenSettings={() => setSettingsOpen(true)} />
      </div>
      
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
