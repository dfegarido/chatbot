import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TestTube } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { ChatApiService } from '@/services/api';
import { cn } from '@/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useChat();
  const [localSettings, setLocalSettings] = useState(state.settings);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    setLocalSettings(state.settings);
    if (isOpen) {
      fetchModels();
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [state.settings, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const fetchModels = async () => {
    try {
      const apiService = new ChatApiService(localSettings);
      const models = await apiService.fetchModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: localSettings });
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    
    try {
      const apiService = new ChatApiService(localSettings);
      const result = await apiService.testConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        await fetchModels();
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleApiProviderChange = (provider: 'ollama' | 'groq') => {
    const newSettings = { ...localSettings, apiProvider: provider };
    
    // Switch to compatible model
    if (provider === 'groq') {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (!groqModels.includes(newSettings.model)) {
        newSettings.model = 'llama-3.3-70b-versatile';
      }
    } else {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (groqModels.includes(newSettings.model)) {
        newSettings.model = 'llama3.2:latest';
      }
    }
    
    setLocalSettings(newSettings);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModelOptions = () => {
    if (localSettings.apiProvider === 'groq') {
      return ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    }
    return availableModels.length > 0 ? availableModels : ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Provider
            </label>
            <select
              value={localSettings.apiProvider}
              onChange={(e) => handleApiProviderChange(e.target.value as 'ollama' | 'groq')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="groq">Groq (Cloud)</option>
            </select>
          </div>

          {/* Ollama Settings */}
          {localSettings.apiProvider === 'ollama' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ollama Server URL
                </label>
                <input
                  type="url"
                  value={localSettings.ollamaUrl}
                  onChange={(e) => setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="http://localhost:11434"
                />
              </div>
            </div>
          )}

          {/* Groq Settings */}
          {localSettings.apiProvider === 'groq' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={localSettings.groqApiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, groqApiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your Groq API key"
                />
              </div>
            </div>
          )}

          {/* Test Connection */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <TestTube className="w-4 h-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            
            {connectionStatus && (
              <div className={cn(
                "mt-2 p-3 rounded-lg text-sm",
                connectionStatus.success 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              )}>
                {connectionStatus.message}
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <select
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {getModelOptions().map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature: {localSettings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="8000"
              value={localSettings.maxTokens}
              onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="You are a helpful AI assistant."
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.streamResponses}
                onChange={(e) => setLocalSettings({ ...localSettings, streamResponses: e.target.checked })}
                className="mr-3 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Stream responses</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.showThinking}
                onChange={(e) => setLocalSettings({ ...localSettings, showThinking: e.target.checked })}
                className="mr-3 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show thinking process</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
