import React from 'react';
import { cn } from '@/utils';

interface TypingIndicatorProps {
  message?: string;
  className?: string;
}

export function TypingIndicator({ message, className }: TypingIndicatorProps) {
  return (
    <div className={cn("message-bubble message-assistant", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
            AI
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Assistant
              </span>
            </div>

            {message ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.startsWith('Thinking:') ? (
                  <div className="thinking-content">
                    {message}
                  </div>
                ) : (
                  <div className="text-gray-800 dark:text-gray-200">
                    {message}
                  </div>
                )}
              </div>
            ) : (
              <div className="typing-dots">
                <span style={{ '--i': 0 } as React.CSSProperties}></span>
                <span style={{ '--i': 1 } as React.CSSProperties}></span>
                <span style={{ '--i': 2 } as React.CSSProperties}></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
