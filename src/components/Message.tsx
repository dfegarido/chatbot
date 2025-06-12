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
      "px-4 py-3 transition-all duration-200",
      isUser 
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" 
        : "bg-white dark:bg-gray-900/50"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "flex gap-3 items-end",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden",
              isUser 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600"
            )}>
              {isUser ? (
                <span className="text-xs font-semibold">👤</span>
              ) : (
                <img 
                  src="/sarah-avatar.svg" 
                  alt="Sarah" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div className={cn(
            "flex-1 min-w-0",
            isUser ? "text-right" : "text-left"
          )}>
            {/* Message bubble */}
            <div className={cn(
              "group relative inline-block max-w-xs sm:max-w-md md:max-w-lg rounded-2xl px-3 py-2 shadow-sm border transition-all duration-200 hover:shadow-md",
              isUser 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-200 dark:border-blue-800 ml-auto" 
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            )}>
              {/* Thinking content */}
              {message.thinking && state.settings.showThinking && (
                <div className={cn(
                  "thinking-content mb-2 rounded-xl p-2 text-xs border",
                  isUser
                    ? "bg-blue-100/20 text-blue-100 border-blue-300/30"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                )}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium opacity-75">💭</span>
                  </div>
                  {message.thinking}
                </div>
              )}

              {/* Main message content */}
              <div className={cn(
                "prose prose-sm max-w-none break-words",
                isUser 
                  ? "prose-invert" 
                  : "dark:prose-invert"
              )}>
                <MessageContent content={message.content} />
              </div>

              {/* Message tail */}
              <div className={cn(
                "absolute bottom-2 w-2 h-2 transform rotate-45",
                isUser 
                  ? "right-[-4px] bg-gradient-to-br from-blue-500 to-indigo-600" 
                  : "left-[-4px] bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700"
              )} />
            </div>

            {/* Header with actions */}
            <div className={cn(
              "flex items-center gap-2 mt-1 px-1",
              isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
            )}>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(new Date(message.timestamp))}
              </span>
              <button
                onClick={handleCopy}
                className={cn(
                  "p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 opacity-0 group-hover:opacity-100",
                  "hover:scale-110 active:scale-95"
                )}
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
