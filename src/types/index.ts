export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinking?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  model: string;
  temperature: number;
  ollamaUrl: string;
  maxTokens: number;
  systemPrompt: string;
  streamResponses: boolean;
  showThinking: boolean;
  theme: 'light' | 'dark';
  apiProvider: 'ollama' | 'groq' | 'openai';
  groqApiKey: string;
  openaiApiKey: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface StreamingResponse {
  response?: string;
  thought?: string;
  thinking?: string;
  done?: boolean;
}

export interface GroqStreamingResponse {
  choices?: Array<{
    delta: {
      content?: string;
    };
  }>;
}

export type ApiProvider = 'ollama' | 'groq' | 'openai';

export interface ModelInfo {
  name: string;
  model?: string;
}
