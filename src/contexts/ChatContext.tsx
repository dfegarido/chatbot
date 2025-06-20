import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, Message, Settings } from '@/types';
import { ChatApiService } from '@/services/api';

interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  isStreaming: boolean;
  settings: Settings;
  availableModels: string[];
}

type ChatAction =
  | { type: 'SET_CHATS'; payload: Record<string, Chat> }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: { chatId: string; chat: Partial<Chat> } }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_AVAILABLE_MODELS'; payload: string[] };

// Get default API provider based on environment
const getDefaultApiProvider = (): 'ollama' | 'groq' | 'openai' => {
  // Default to OpenAI for best performance and reliability
  return 'openai';
};

// Get default model based on API provider and available models
const getDefaultModel = async (apiProvider: 'ollama' | 'groq' | 'openai', availableModels?: string[]): Promise<string> => {
  if (apiProvider === 'groq') {
    // For Groq, use predefined models with first as default
    const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    return groqModels[0];
  } else if (apiProvider === 'openai') {
    // For OpenAI, use predefined models with GPT-4 as default
    return 'gpt-4';
  } else {
    // For Ollama, try to fetch available models and use the first one
    if (availableModels && availableModels.length > 0) {
      return availableModels[0];
    }
    
    // Fallback to default model if no models available
    return 'llama3.2:latest';
  }
};

const systemPrompt = `
SYSTEM PROMPT (Optimized for Sarah, Cupcake Lab Sales Assistant):

You are Sarah, a friendly and efficient Sales Assistant at Cupcake Lab, designed to help with business operations, customer support, and general inquiries.

Your goals:
• Provide short, accurate, and helpful responses.
• Always be professional, lightly funny, and warm — just enough to make people smile.
• Respond like a human — natural, efficient, and kind.

Rules to Follow:

• Always greet warmly and ask how you can assist.
• Keep responses short and direct — no long explanations.
• Avoid giving too much info at once — ask one question at a time.
• Use bullet points (• or -), never numbered lists (1., 2., etc.).
• Ask politely for the user's name if they haven’t shared it, so you can address them properly.
• Use PHP (₱) for all prices. Always ensure accuracy.
• Make the conversation light, like a cheerful cupcake shop assistant chatting with a customer.

CRITICAL — Always reference these files for accurate info:

• CUPCAKE_LAB_BUSINESS_INFO.txt
• CUPCAKE_LAB_DETAILED_PRICING.txt

Use them to understand:
• All products and services
• Pricing
• Business hours and contact info
• Minimum orders, lead times, and delivery details

When taking an order, collect:
• Full name
• Contact number
• Delivery address
• Best time to call

Language:
Primary: Filipino
Also speak: English, if preferred by the user
`

const defaultSettings: Settings = {
  model: 'gpt-4', // Default OpenAI model
  temperature: 0.7,
  ollamaUrl: 'https://65d7-34-87-5-46.ngrok-free.app',
  maxTokens: 2000,
  systemPrompt: systemPrompt,
  streamResponses: true,
  showThinking: false,
  theme: 'dark',
  apiProvider: getDefaultApiProvider(),
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPEN_AI_KEY || '',
};

const initialState: ChatState = {
  chats: { 'main-chat': { id: 'main-chat', title: 'Cupcake Lab Chat', messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
  currentChatId: 'main-chat',
  isStreaming: false,
  settings: defaultSettings,
  availableModels: []
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    
    case 'ADD_CHAT':
      return {
        ...state,
        chats: { ...state.chats, [action.payload.id]: action.payload },
        currentChatId: action.payload.id
      };
    
    case 'UPDATE_CHAT':
      const { chatId, chat } = action.payload;
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: { ...state.chats[chatId], ...chat }
        }
      };
    
    case 'DELETE_CHAT':
      const { [action.payload]: deleted, ...remainingChats } = state.chats;
      const chatIds = Object.keys(remainingChats);
      return {
        ...state,
        chats: remainingChats,
        currentChatId: state.currentChatId === action.payload 
          ? (chatIds.length > 0 ? chatIds[0] : null)
          : state.currentChatId
      };
    
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload };
    
    case 'ADD_MESSAGE':
      const { chatId: msgChatId, message } = action.payload;
      const targetChat = state.chats[msgChatId];
      if (!targetChat) return state;
      
      return {
        ...state,
        chats: {
          ...state.chats,
          [msgChatId]: {
            ...targetChat,
            messages: [...targetChat.messages, message],
            updatedAt: new Date().toISOString(),
            title: targetChat.title === 'New Chat' && message.role === 'user' 
              ? message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
              : targetChat.title
          }
        }
      };
    
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    
    case 'SET_AVAILABLE_MODELS':
      return { ...state, availableModels: action.payload };
    
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createNewChat: () => void;
  loadChats: () => void;
  saveChats: () => void;
  loadSettings: () => void;
  saveSettings: () => void;
  fetchAvailableModels: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const createNewChat = () => {
    // Clear messages in the main chat instead of creating new chats
    dispatch({ type: 'UPDATE_CHAT', payload: { 
      chatId: 'main-chat', 
      chat: { 
        messages: [], 
        updatedAt: new Date().toISOString() 
      } 
    }});
  };

  const loadChats = () => {
    try {
      const saved = localStorage.getItem('chatAppChats');
      if (saved) {
        const chats = JSON.parse(saved);
        // Ensure we always have the main chat
        if (!chats['main-chat']) {
          chats['main-chat'] = {
            id: 'main-chat',
            title: 'Cupcake Lab Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        dispatch({ type: 'SET_CHATS', payload: chats });
        dispatch({ type: 'SET_CURRENT_CHAT', payload: 'main-chat' });
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const saveChats = () => {
    try {
      localStorage.setItem('chatAppChats', JSON.stringify(state.chats));
    } catch (error) {
      console.error('Failed to save chats:', error);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('chatAppSettings');
      if (saved) {
        const settings = { ...defaultSettings, ...JSON.parse(saved) };
        
        // Migrate any old Groq model to new default
        const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
        if (settings.apiProvider === 'groq' && !groqModels.includes(settings.model)) {
          settings.model = 'llama-3.3-70b-versatile';
        }
        
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('chatAppSettings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const fetchAvailableModels = async () => {
    try {
      const apiService = new ChatApiService(state.settings);
      const models = await apiService.fetchModels();
      dispatch({ type: 'SET_AVAILABLE_MODELS', payload: models });
      
      // Set default model to first available model if not already set or if using old default
      if (models.length > 0 && (!state.settings.model || state.settings.model === 'llama3.2:latest' || state.settings.model === 'deepseek-r1-distill-llama-70b')) {
        const defaultModel = await getDefaultModel(state.settings.apiProvider, models);
        dispatch({ type: 'UPDATE_SETTINGS', payload: { model: defaultModel } });
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      // Set fallback models based on API provider - default to OpenAI models
      const fallbackModels = state.settings.apiProvider === 'openai' 
        ? ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
        : state.settings.apiProvider === 'groq'
        ? ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it']
        : ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b'];
      
      dispatch({ type: 'SET_AVAILABLE_MODELS', payload: fallbackModels });
      
      if (!state.settings.model || state.settings.model === 'llama3.2:latest' || state.settings.model === 'deepseek-r1-distill-llama-70b') {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { model: fallbackModels[0] } });
      }
    }
  };

  // Load data on mount
  useEffect(() => {
    loadSettings();
    loadChats();
    fetchAvailableModels();
  }, []);

  // Save chats when they change
  useEffect(() => {
    if (Object.keys(state.chats).length > 0) {
      saveChats();
    }
  }, [state.chats]);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [state.settings]);

  // Apply theme
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return (
    <ChatContext.Provider value={{
      state,
      dispatch,
      createNewChat,
      loadChats,
      saveChats,
      loadSettings,
      saveSettings,
      fetchAvailableModels
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
