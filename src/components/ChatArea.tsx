import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useApiChat } from '@/hooks/useApiChat';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeMessage } from './WelcomeMessage';

export function ChatArea() {
  const { state } = useChat();
  const { isTyping, typingMessage } = useApiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = state.currentChatId ? state.chats[state.currentChatId] : null;
  const messages = currentChat?.messages || [];
  
  // Show typing indicator when either isTyping is true OR when streaming
  const showTypingIndicator = isTyping || state.isStreaming;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTypingIndicator, typingMessage]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar">
      {messages.length === 0 && !showTypingIndicator ? (
        <WelcomeMessage />
      ) : (
        <div className="space-y-0">
          {messages.map((message, index) => (
            <div key={message.id} className="message-animate" style={{ animationDelay: `${index * 0.1}s` }}>
              <Message message={message} />
            </div>
          ))}
          
          {showTypingIndicator && (
            <div className="message-animate">
              <TypingIndicator message={typingMessage} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
