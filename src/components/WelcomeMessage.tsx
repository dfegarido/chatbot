import { Bot, MessageCircle, Zap, Shield } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bot className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to AI Chat Assistant
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Start a conversation with your AI assistant. Ask questions, get help with code, 
          brainstorm ideas, or just have a friendly chat!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Natural Conversations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Have natural, flowing conversations with advanced AI models
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Streaming</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Watch responses appear in real-time with streaming technology
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy Focused</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Your conversations are stored locally for maximum privacy
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            <strong>Keyboard shortcuts:</strong>
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Cmd/Ctrl + N</kbd> New chat</span>
            <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Cmd/Ctrl + K</kbd> Focus input</span>
          </div>
        </div>
      </div>
    </div>
  );
}
