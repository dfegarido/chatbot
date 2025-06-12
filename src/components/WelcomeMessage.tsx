import { Bot, Upload, MessageCircle, Cake } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Cake className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Cupcake Lab AI Assistant
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your friendly AI assistant for Cupcake Lab! Upload your business information file above, 
          then start chatting to help customers with orders, pricing, and product information.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Business Info</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Upload your business information text file to provide accurate responses
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Help customers with orders, pricing, delivery, and product questions
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Powered by advanced AI to provide natural, helpful conversations
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
