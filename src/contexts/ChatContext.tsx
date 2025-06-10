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
const getDefaultApiProvider = (): 'ollama' | 'groq' => {
  // Default to Groq for better reliability and online availability
  return 'groq';
};

// Get default model based on API provider and available models
const getDefaultModel = async (apiProvider: 'ollama' | 'groq', availableModels?: string[]): Promise<string> => {
  if (apiProvider === 'groq') {
    // For Groq, use predefined models with first as default
    const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    return groqModels[0];
  } else {
    // For Ollama, try to fetch available models and use the first one
    if (availableModels && availableModels.length > 0) {
      return availableModels[0];
    }
    
    // Fallback to default model if no models available
    return 'llama3.2:latest';
  }
};

const defaultSettings: Settings = {
  model: 'llama-3.3-70b-versatile', // Default Groq model
  temperature: 0.7,
  ollamaUrl: 'https://65d7-34-87-5-46.ngrok-free.app',
  maxTokens: 2000,
  systemPrompt: `🎂 Cupcake Lab AI Assistant Prompt (Sales Assistant Only, Short & Clear)
👤 Persona
You are the friendly Sales Assistant at Cupcake Lab, ready to help customers with cupcakes, cakes, orders, and delivery.

🧾 Business Info
Cupcake Lab | #11, 9th Ave, Cubao, QC, Metro Manila

Contact: +639988538586 | Website

Hours: 8 AM–5 PM, Mon–Sat

Famous for Red Velvet cupcakes and creative desserts.

🎯 Main Tasks
Answer product, order, price, and delivery questions briefly.

Help customers place orders smoothly.

Collect order details simply and clearly.

Use the customer’s language.

End with:
"Anything else I can assist you with?"

Sign off with:

We hope you find what you need for your next celebration. 😃
We love being a part of your most memorable milestones! 🙂
Cupcake Lab, where your friendly cupcake meets exact science! ❤️

📦 Product & Ordering Info
Regular cupcakes: min 6 pcs (same flavor)

Mini cupcakes: min 12 pcs (same flavor)

DIY Kits: min 5 kits

Cakes: no minimum

Custom designs: 7 days lead time

Standard orders: 3–5 days lead time

Delivery: 9 AM–6 PM daily, pickup at Cubao.

🤖 AI Conversation Flow (Sales Only, Short & Clear)
Greeting:
"Hi! How can I help you today?"

Answer questions briefly:

Use simple bullet points.

Include prices if available.

Show images when asked.

If ordering, ask for details:
"To place your order, please provide:"

Name

Contact number

Delivery address or pickup

Delivery date & time (9 AM–6 PM)

Confirm details:
"Thanks! Just to confirm: Name: [Name], Number: [Number], Address: [Address], Delivery: [Date & Time]. Correct?"

If yes:
"Your order is confirmed. Anything else I can assist you with?"

If no or missing info:
"Please provide the correct details."

Closing:

We hope you find what you need for your next celebration. 😃
We love being a part of your most memorable milestones! 🙂
Cupcake Lab, where your friendly cupcake meets exact science! ❤️

Notes
Always reply in the customer’s language.

Keep answers short, clear, and polite.

Suggest related products briefly if relevant.`,
  streamResponses: true,
  showThinking: false,
  theme: 'dark',
  apiProvider: getDefaultApiProvider(),
  groqApiKey: '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'
};

const initialState: ChatState = {
  chats: {},
  currentChatId: null,
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
    const chatId = 'chat_' + Date.now();
    const chat: Chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_CHAT', payload: chat });
  };

  const loadChats = () => {
    try {
      const saved = localStorage.getItem('chatAppChats');
      if (saved) {
        const chats = JSON.parse(saved);
        dispatch({ type: 'SET_CHATS', payload: chats });
        
        // Set current chat to most recent
        const chatIds = Object.keys(chats);
        if (chatIds.length > 0) {
          const sortedChats = Object.values(chats) as Chat[];
          const mostRecent = sortedChats.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          dispatch({ type: 'SET_CURRENT_CHAT', payload: mostRecent.id });
        }
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
      
      // Set default model to first available model if not already set
      if (models.length > 0 && (!state.settings.model || state.settings.model === 'llama3.2:latest' || state.settings.model === 'llama-3.3-70b-versatile')) {
        const defaultModel = await getDefaultModel(state.settings.apiProvider, models);
        dispatch({ type: 'UPDATE_SETTINGS', payload: { model: defaultModel } });
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      // Set fallback models based on API provider - default to Groq models
      const fallbackModels = state.settings.apiProvider === 'groq' 
        ? ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it']
        : ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b'];
      
      dispatch({ type: 'SET_AVAILABLE_MODELS', payload: fallbackModels });
      
      if (!state.settings.model || state.settings.model === 'llama3.2:latest' || state.settings.model === 'llama-3.3-70b-versatile') {
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
