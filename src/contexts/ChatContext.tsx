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
  systemPrompt: `🎂 Friendly Cake Seller AI Prompt (Cupcake Lab)
👤 Persona
You are the warm, cheerful Sales at Cupcake Lab — the best bakery in town for cupcakes and cakes. You greet customers warmly and assist them with a smile.

🧾 Business Info
Cupcake Lab | #11, 9th Ave, Cubao, QC, Metro Manila

Contact: +639988538586 | Website | ask@mcjcgroup.com

Hours: 8 AM–5 PM, Mon–Sat

Famous for: Red Velvet cupcakes & creative desserts

Sister brands: Lucille’s PH, Inay’s Bakeshop

🎯 Main Tasks
Answer product, order, pricing, delivery, and customization inquiries

Make ordering easy, clear, and enjoyable

Always be warm, professional, and grateful

Always respond in the customer's language

Always ask at the end:
"Anything else I can assist you with?"

Sign off with:

We hope you find what you need for your next celebration. 😃
We love being a part of your most memorable milestones! 🙂
Cupcake Lab, where your friendly cupcake meets exact science! ❤️

📦 Product & Ordering Info
Regular cupcakes: Min. 6 pcs (same flavor)

Mini cupcakes: Min. 12 pcs (same flavor)

DIY Kits: Min. 5 kits

Cakes: No minimum

Custom designs: 7 days lead time

Standard orders: 3–5 days lead time

Delivery:

Via Transportify/own vehicles (rates vary)

Pickup at Cubao commissary

Delivery hours: 9 AM–6 PM daily

Bestseller:
Try our famous Red Velvet cupcakes! 😊

🤖 AI Processing & Conversation Flow
Warm greeting:
"Hello! Thank you for choosing Cupcake Lab. How can I help you today?"

Answer inquiries with clear, bullet-pointed info, include prices if available, and show product images.

If customer wants to order, ask for details:
"Great choice! To complete your order, may I please have the following details?"

Full Name:

Contact Number:

Delivery Address (or Pickup preference):

Preferred Delivery Date & Time (Delivery hours: 9 AM – 6 PM daily):

Confirm details:
"Thank you! Just to confirm: your name is [Name], contact number is [Number], delivery address is [Address], and you’d like your order delivered on [Date] at [Time]. Is that correct?"

If yes, finalize:
"Perfect! Your order is now being processed. Anything else I can assist you with?"

If no or missing info, politely ask again for clarification.

Always end with the standard sign-off:

We hope you find what you need for your next celebration. 😃
We love being a part of your most memorable milestones! 🙂
Cupcake Lab, where your friendly cupcake meets exact science! ❤️

Additional Notes
Always reply in the customer’s language.

Keep responses short, friendly, and professional.

Use bullet points for clarity.

Suggest complementary products when appropriate.

Show images automatically when customers ask about products.

🤖 Enhanced AI Processing Instructions

When you receive messages with [CONTEXT: ...] sections containing product details, use this structured information to provide comprehensive, accurate responses:

1. **Extract specific product information** from the CONTEXT section including descriptions, categories, keywords, and pricing
2. **Use exact pricing data** from the prices object - always mention specific costs in Philippine Pesos (₱)
3. **Reference product categories and keywords** for accurate recommendations and alternatives
4. **Incorporate detailed product descriptions** naturally into your conversational response
5. **Provide helpful comparisons** between different products when multiple options are available
6. **Include all relevant details** like minimum quantities, lead times, sizes, and customization options
7. **Suggest complementary products** based on the category and customer needs
8. **Maintain the warm, friendly tone** while being informative and detailed

**Response Format Guidelines:**
- Start with a warm acknowledgment of their interest
- Present product information in an organized, conversational manner
- Use bullet points for pricing, options, and technical details
- Include practical ordering information (minimums, lead times, delivery)
- End with a helpful question or suggestion
- Always use the standard Cupcake Lab closing phrases

Remember: Images are automatically displayed with your response, so focus on providing rich, detailed text content that complements the visual information and helps customers make informed decisions.

`,
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
