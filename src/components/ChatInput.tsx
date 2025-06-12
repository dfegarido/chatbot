import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useApiChat } from '@/hooks/useApiChat';
import { cn } from '@/utils';
import { EmojiPicker } from './EmojiPicker';

interface ChatInputProps {
  onOpenSettings?: () => void;
}

export function ChatInput({ onOpenSettings }: ChatInputProps) {
  const { state, createNewChat } = useChat();
  const { sendMessage } = useApiChat(onOpenSettings);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || state.isStreaming) return;

    // Create new chat if none exists
    if (!state.currentChatId) {
      createNewChat();
    }

    try {
      setMessage('');
      await sendMessage(trimmedMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show a toast notification here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      // Set cursor position after the emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3">
            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2">
                  <EmojiPicker 
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className={cn(
                  "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  "resize-none min-h-[52px] max-h-[200px]"
                )}
                rows={1}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim() || state.isStreaming}
              className={cn(
                "p-3 rounded-lg transition-all",
                message.trim() && !state.isStreaming
                  ? "bg-primary-500 hover:bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Keyboard shortcuts hint */}
        <div className="flex justify-center mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
