import { useState, useCallback } from 'react';
import { ChatApiService } from '@/services/api';
import { ImageMatchingService } from '@/services/imageMatching';
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
      'Looking through our cupcake menu...',
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

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentChatId || state.isStreaming) return;

    const imageService = new ImageMatchingService();
    let imageResponse = null;
    const isImageRequest = imageService.isImageRequest(content);
    const isProductSpecificQuery = imageService.isProductSpecificQuery(content);
    if (isImageRequest || isProductSpecificQuery) {
      imageResponse = imageService.answerProductQuestion(content);
      if (!imageResponse) {
        imageResponse = imageService.generateImageResponse(content);
      }
    }

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId, message: userMessage } });

    // Only include product context if we have relevant images and the query is product-related
    if (imageResponse && (isImageRequest || isProductSpecificQuery)) {
      // Get detailed image information for AI processing
      const relevantImages = imageService.findRelevantImages(content, 5);
      const imageDetails = relevantImages.map(img => ({
        description: img.description,
        category: img.category,
        keywords: img.keywords,
        prices: img.prices,
        filename: img.filename
      }));

      // Store both image response and product details for the API to use
      (window as any).__tempImageResponse = imageResponse;
      (window as any).__tempProductDetails = imageDetails;
    } else {
      (window as any).__tempImageResponse = undefined;
      (window as any).__tempProductDetails = undefined;
    }

    const apiService = new ChatApiService(state.settings);
    
    // Validate configuration
    const validationError = apiService.validateConfiguration();
    if (validationError) {
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
  }, [state, dispatch]);

  const handleStreamingResponse = async (
    apiService: ChatApiService, 
    message: string, 
    chatHistory: Message[]
  ) => {
    setIsTyping(true);
    setTypingMessage('Processing your request...');
    const imageService = new ImageMatchingService();
    
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
      
      if (state.settings.apiProvider === 'groq') {
        // Handle Groq streaming format
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
      
      // Check if we have stored image response for this query
      const storedImageResponse = (window as any).__tempImageResponse;
      let imagesToSend = undefined;
      if (imageService.isImageRequest(message) || imageService.isProductSpecificQuery(message)) {
        imagesToSend = storedImageResponse?.images || undefined;
      }
      // Create assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        images: imagesToSend
      };
      
      // Clear stored data
      (window as any).__tempImageResponse = undefined;
      (window as any).__tempProductDetails = undefined;
      
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId!, message: assistantMessage } });
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
    const imageService = new ImageMatchingService();
    
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
      
      if (state.settings.apiProvider === 'groq') {
        if (data.choices && data.choices.length > 0) {
          assistantResponse = data.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from Groq API');
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
      
      // Check if we have stored image response for this query
      const storedImageResponse = (window as any).__tempImageResponse;
      let imagesToSend = undefined;
      if (imageService.isImageRequest(message) || imageService.isProductSpecificQuery(message)) {
        imagesToSend = storedImageResponse?.images || undefined;
      }
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
        thinking: thinkingContent || undefined,
        images: imagesToSend
      };
      
      // Clear stored data
      (window as any).__tempImageResponse = undefined;
      (window as any).__tempProductDetails = undefined;
      
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.currentChatId!, message: assistantMessage } });
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
