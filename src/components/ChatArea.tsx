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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, typingMessage]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 && !isTyping ? (
        <WelcomeMessage />
      ) : (
        <div className="space-y-0">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <TypingIndicator message={typingMessage} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
