import { useState, useCallback } from 'react';
import { ChatApiService } from '@/services/api';
import { useChat } from '@/contexts/ChatContext';
import { Message } from '@/types';

export function useApiChat() {
  const { state, dispatch } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');

  // Enhanced typing simulation
  const simulateTyping = useCallback(async (duration: number = 2000) => {
    const typingMessages = [
      '',
      'Thinking about your request...',
      'Looking through our information...',
      'Preparing your response...',
      'Just a moment...'
    ];

    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < typingMessages.length) {
        setTypingMessage(typingMessages[currentIndex]);
        currentIndex++;
      }
    }, duration / typingMessages.length);

    return () => clearInterval(typingInterval);
  }, []);

  // Split text into sentences and send them with random delays
  const sendSentencesWithDelay = useCallback(async (text: string, baseMessageId: string) => {
    // Split text into sentences using regex that handles common punctuation
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    
    // Filter out empty sentences and trim whitespace
    const validSentences = sentences
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

    // Sarah's emoticons - only face expressions and hearts
    const emoticons = {
      happy: ['😊', '😄', '🙂', '😌'],
      excited: ['😍', '🤩', '😆'],
      grateful: ['😇', '☺️'],
      love: ['💖', '💕', '❤️']
    };

    // Function to get a random emoticon based on text content (only when really appropriate)
    const getEmoticon = (sentence: string) => {
      const lowerSentence = sentence.toLowerCase();
      
      // Only add emoticons for very specific, emotionally charged contexts
      if (lowerSentence.includes('welcome') || lowerSentence.includes('hello') || lowerSentence.includes('nice to meet')) {
        return emoticons.happy[Math.floor(Math.random() * emoticons.happy.length)];
      } else if (lowerSentence.includes('amazing') || lowerSentence.includes('wonderful') || lowerSentence.includes('fantastic') || lowerSentence.includes('perfect') || lowerSentence.includes('love it')) {
        return emoticons.excited[Math.floor(Math.random() * emoticons.excited.length)];
      } else if (lowerSentence.includes('congratulations') || lowerSentence.includes('great choice') || lowerSentence.includes('excellent')) {
        return emoticons.excited[Math.floor(Math.random() * emoticons.excited.length)];
      } else if (lowerSentence.includes('thank you') || lowerSentence.includes('thanks') || lowerSentence.includes('appreciate')) {
        return emoticons.grateful[Math.floor(Math.random() * emoticons.grateful.length)];
      } else if (lowerSentence.includes('love') || lowerSentence.includes('adore') || lowerSentence.includes('treasure')) {
        return emoticons.love[Math.floor(Math.random() * emoticons.love.length)];
      }
      
      // No emoticon for most regular responses
      return '';
    };

    if (validSentences.length <= 1) {
      // If only one sentence or no sentences, send as single message
      const emoticon = getEmoticon(text);
      const assistantMessage: Message = {
        id: baseMessageId,
        role: 'assistant',
        content: emoticon ? `${text} ${emoticon}` : text,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId!, message: assistantMessage } });
      return;
    }

    // Send each sentence as a separate message with random delays
    for (let i = 0; i < validSentences.length; i++) {
      const sentence = validSentences[i];
      
      // Add random delay between 3-5 seconds (except for first sentence)
      if (i > 0) {
        const delay = Math.random() * 2000 + 3000; // 3000ms to 5000ms
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Only add emoticon to sentences that really warrant it (much more selective)
      const emoticon = getEmoticon(sentence);

      const assistantMessage: Message = {
        id: `${baseMessageId}_sentence_${i}`,
        role: 'assistant',
        content: emoticon ? `${sentence} ${emoticon}` : sentence,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId!, message: assistantMessage } });
    }
  }, [state.currentChatId, dispatch]);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentChatId || state.isStreaming) return;

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId, message: userMessage } });

    // Show typing indicator immediately
    setIsTyping(true);
    setTypingMessage('');

    // Add a 3-second delay to make conversation feel more natural
    await new Promise(resolve => setTimeout(resolve, 3000));

    const apiService = new ChatApiService(state.settings);
    
    // Validate configuration
    const validationError = apiService.validateConfiguration();
    if (validationError) {
      setIsTyping(false);
      setTypingMessage('');
      throw new Error(validationError);
    }

    dispatch({ type: 'SET_STREAMING', payload: true });
    
    try {
      const currentChat = state.chats[state.currentChatId];
      const chatHistory = currentChat ? currentChat.messages : [];

      if (state.settings.streamResponses) {
        await handleStreamingResponse(apiService, content, chatHistory);
      } else {
        await handleRegularResponse(apiService, content, chatHistory);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = apiService.getContextualErrorMessage(error);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId!, message: assistantMessage } });
    } finally {
      dispatch({ type: 'SET_STREAMING', payload: false });
      setIsTyping(false);
      setTypingMessage('');
    }
  }, [state, dispatch, sendSentencesWithDelay]);

  const handleStreamingResponse = async (
    apiService: ChatApiService, 
    message: string, 
    chatHistory: Message[]
  ) => {
    setIsTyping(true);
    setTypingMessage('');
    
    try {
      const response = await fetch(apiService.getApiUrl(), {
        method: 'POST',
        headers: apiService.getApiHeaders(),
        body: JSON.stringify(apiService.buildRequestBody(message, chatHistory))
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let lastThought = '';
      
      if (state.settings.apiProvider === 'groq' || state.settings.apiProvider === 'openai') {
        // Handle Groq and OpenAI streaming format (both use Server-Sent Events)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '));
          
          for (const line of lines) {
            if (line.trim() === 'data: [DONE]') continue;
            
            try {
              const jsonStr = line.replace('data: ', '');
              const data = JSON.parse(jsonStr);
              
              if (data.choices && data.choices.length > 0) {
                const delta = data.choices[0].delta;
                if (delta && delta.content) {
                  fullResponse += delta.content;
                  setTypingMessage(fullResponse);
                }
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      } else {
        // Handle Ollama streaming format
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.thought || data.thinking) {
                const thoughtText = data.thought || data.thinking;
                if (thoughtText !== lastThought && state.settings.showThinking) {
                  lastThought = thoughtText;
                  setTypingMessage(`Thinking: ${thoughtText}`);
                }
              }
              if (data.response) {
                fullResponse += data.response;
                setTypingMessage(fullResponse);
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
      
      // Create assistant message with sentence splitting
      const baseMessageId = `msg_${Date.now()}_assistant`;
      await sendSentencesWithDelay(fullResponse, baseMessageId);
    } finally {
      setIsTyping(false);
      setTypingMessage('');
    }
  };

  const handleRegularResponse = async (
    apiService: ChatApiService, 
    message: string, 
    chatHistory: Message[]
  ) => {
    setIsTyping(true);
    
    // Start typing simulation
    const clearTyping = await simulateTyping(3000);
    
    try {
      const response = await fetch(apiService.getApiUrl(), {
        method: 'POST',
        headers: apiService.getApiHeaders(),
        body: JSON.stringify(apiService.buildRequestBody(message, chatHistory))
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      let assistantResponse: string;
      let thinkingContent: string | null = null;
      
      if (state.settings.apiProvider === 'groq' || state.settings.apiProvider === 'openai') {
        if (data.choices && data.choices.length > 0) {
          assistantResponse = data.choices[0].message.content;
        } else {
          throw new Error(`Invalid response format from ${state.settings.apiProvider.toUpperCase()} API`);
        }
      } else {
        assistantResponse = data.response || 'No response received.';
        thinkingContent = data.thought || data.thinking;
      }
      
      // Show thinking if available
      if (thinkingContent && state.settings.showThinking) {
        setTypingMessage(`Thinking: ${thinkingContent}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Send response with sentence splitting
      const baseMessageId = `msg_${Date.now()}_assistant`;
      await sendSentencesWithDelay(assistantResponse, baseMessageId);
    } finally {
      setIsTyping(false);
      setTypingMessage('');
      clearTyping();
    }
  };

  return {
    sendMessage,
    isTyping,
    typingMessage
  };
}
