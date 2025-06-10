import { useState, useEffect } from 'react';
import { cn } from '@/utils';

interface TypingIndicatorProps {
  message?: string;
  className?: string;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

function TypewriterText({ text, speed = 50, onComplete }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="typewriter-text">
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-blue-500 dark:text-blue-400">|</span>
      )}
    </span>
  );
}

export function TypingIndicator({ message, className }: TypingIndicatorProps) {
  const [currentAnimation, setCurrentAnimation] = useState<'dots' | 'typewriter'>('dots');
  const [animationMessage, setAnimationMessage] = useState('');

  useEffect(() => {
    if (message && !message.startsWith('Thinking:')) {
      // Use typewriter animation for regular messages
      setCurrentAnimation('typewriter');
      setAnimationMessage(message);
    } else {
      // Use dots animation for thinking or no message
      setCurrentAnimation('dots');
    }
  }, [message]);

  const renderContent = () => {
    if (message?.startsWith('Thinking:')) {
      return (
        <div className="thinking-content bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium opacity-75">💭</span>
          </div>
          <TypewriterText 
            text={message.replace('Thinking:', '').trim()} 
            speed={30}
          />
        </div>
      );
    }

    if (currentAnimation === 'typewriter' && animationMessage) {
      return (
        <div className="text-gray-800 dark:text-gray-200 text-sm">
          <TypewriterText text={animationMessage} speed={40} />
        </div>
      );
    }

    // Default dots animation
    return (
      <div className="typing-dots-enhanced">
        <div className="typing-dots py-1">
          <span className="dot-1"></span>
          <span className="dot-2"></span>
          <span className="dot-3"></span>
        </div>
        <span className="typing-text ml-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
          Cupcake Lab is typing...
        </span>
      </div>
    );
  };
  return (
    <div className={cn("px-4 py-3 bg-white dark:bg-gray-900/50 transition-all duration-200", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
              🤖
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Typing bubble */}
            <div className="group relative inline-block max-w-xs sm:max-w-md rounded-2xl px-3 py-2 shadow-sm border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 transition-all duration-200">
              {renderContent()}

              {/* Message tail */}
              <div className="absolute bottom-2 left-[-4px] w-2 h-2 transform rotate-45 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700" />
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentAnimation === 'typewriter' ? 'responding...' : 'typing...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
