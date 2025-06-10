import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Message as MessageType } from '@/types';
import { useChat } from '@/contexts/ChatContext';
import { cn, formatTime, copyToClipboard } from '@/utils';
import { MessageContent } from './MessageContent';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const { state } = useChat();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "message-bubble",
      isUser ? "message-user" : "message-assistant"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            isUser 
              ? "bg-primary-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}>
            {isUser ? 'U' : 'AI'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isUser ? 'You' : 'Assistant'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(new Date(message.timestamp))}
                </span>
              </div>
            </div>

            {/* Message content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {message.thinking && state.settings.showThinking && (
                <div className="thinking-content mb-4">
                  <strong>Thinking:</strong> {message.thinking}
                </div>
              )}
              <MessageContent content={message.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
