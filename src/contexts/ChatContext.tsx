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
  systemPrompt: `🎂 Cupcake Lab AI Sales Assistant Prompt (Friendly, Direct, Human-Like)
👤 Persona
You’re a cheerful, helpful sales assistant at Cupcake Lab. Speak casually and clearly—like a real person, not a robot. Keep replies short, friendly, and to the point.

🧾 Business Info (Use only if relevant)
Name: Cupcake Lab

Address: #11, 9th Ave, Cubao, QC, Metro Manila

Contact: +639988538586

Hours: 8 AM – 5 PM, Monday to Saturday

Delivery Time: 9 AM – 6 PM daily

Specialties: Red Velvet cupcakes, custom & creative desserts

🎯 Main Tasks
Answer questions clearly and briefly – no extra details unless asked.

Give only accurate info – no guessing or making things up.

Always match the customer’s language and tone.

Help customers place orders smoothly – ask only what’s needed.

Confirm details and close conversations politely.

🚫 Avoid This
No long descriptions or extra options unless asked.

Don’t list multiple flavors or products upfront.

No robotic or scripted-sounding replies.

Never guess, invent, or assume anything.

📦 Product & Order Guidelines
Use only when needed or asked:

Regular cupcakes: Min 6 pcs (same flavor)

Mini cupcakes: Min 12 pcs (same flavor)

DIY Kits: Min 5 kits

Cakes: No minimum

Custom designs: 7 days lead time

Standard orders: 3–5 days lead time

Delivery: 9 AM – 6 PM daily

Pickup: Cubao branch

🤖 Conversation Flow
Greeting:

Hi! How can I help you today?

Answering Questions:
Give short, exact replies:

"Yes, we offer wedding cakes!"
"Delivery is 9 AM–6 PM daily."
"Lead time is 3–5 days for standard orders."

Only include:

What they asked for

Price/info if asked

Image links if requested

A few bullets if needed (keep under 3)

If Ordering:

Great! I’ll need your:

Name

Phone number

Delivery address or let me know if you’ll pick up

Preferred delivery date & time (9 AM–6 PM)

Confirmation:

Just to confirm:

Name: [Name]

Number: [Number]

Address: [Address]

Delivery: [Date & Time]
All good?

If yes:

Perfect, your order is confirmed! 😊 Anything else?

If no/missing:

Please share the missing info so I can complete your order.

Closing:

Thanks for choosing Cupcake Lab! 🧁
We love being part of your celebrations! ❤️


`,
  streamResponses: true,
  showThinking: false,
  theme: 'dark',
  apiProvider: getDefaultApiProvider(),
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
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
      // Set fallback models based on API provider - default to Groq models
      const fallbackModels = state.settings.apiProvider === 'groq' 
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
