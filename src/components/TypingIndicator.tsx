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

// Modern bouncing dots component
function BouncingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce-typing-1"></div>
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce-typing-2"></div>
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce-typing-3"></div>
      </div>
    </div>
  );
}

// Pulsing wave animation component
function PulsingWave() {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-wave-1"></div>
        <div className="w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-wave-2"></div>
        <div className="w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-wave-3"></div>
        <div className="w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-wave-4"></div>
        <div className="w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-wave-5"></div>
      </div>
    </div>
  );
}

export function TypingIndicator({ message, className }: TypingIndicatorProps) {
  const [currentAnimation, setCurrentAnimation] = useState<'dots' | 'wave' | 'typewriter'>('dots');
  const [animationMessage, setAnimationMessage] = useState('');
  const [animationType, setAnimationType] = useState<'dots' | 'wave'>('dots');

  // Alternate between different animation types
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationType(prev => prev === 'dots' ? 'wave' : 'dots');
    }, 3000); // Switch animation every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (message && !message.startsWith('Thinking:')) {
      // Use typewriter animation for regular messages
      setCurrentAnimation('typewriter');
      setAnimationMessage(message);
    } else {
      // Use alternating animations for thinking or no message
      setCurrentAnimation(animationType);
    }
  }, [message, animationType]);

  const renderContent = () => {
    if (message?.startsWith('Thinking:')) {
      return (
        <div className="thinking-content bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl text-sm shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg animate-spin-slow">🧠</span>
            <span className="text-xs font-medium opacity-75 uppercase tracking-wide">Processing</span>
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

    // Modern typing animations - show only dots, no text
    return (
      <div className="flex items-center justify-center">
        {currentAnimation === 'wave' ? <PulsingWave /> : <BouncingDots />}
      </div>
    );
  };

  return (
    <div className={cn("px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-2", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* Enhanced Avatar with subtle animation */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 animate-pulse-gentle overflow-hidden">
              <img 
                src="/sarah-avatar.svg" 
                alt="Sarah" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Enhanced Content Bubble */}
          <div className="flex-1 min-w-0">
            {/* Modern typing bubble with enhanced styling */}
            <div className="group relative inline-block max-w-xs sm:max-w-md rounded-2xl px-4 py-3 shadow-lg border bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              {renderContent()}

              {/* Enhanced message tail with gradient */}
              <div className="absolute bottom-3 left-[-6px] w-3 h-3 transform rotate-45 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 border-l border-b border-gray-200 dark:border-gray-700" />
            </div>

            {/* Enhanced timestamp with status */}
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentAnimation === 'typewriter' ? 'responding...' : 'online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
