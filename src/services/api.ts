import { Settings, ApiResponse, Message } from '@/types';

export class ChatApiService {
  constructor(private settings: Settings) {}

  validateConfiguration(): string | null {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey;
      if (!apiKey || apiKey.trim() === '') {
        return 'Please configure your Groq API key in settings before sending messages.';
      }
    } else if (this.settings.apiProvider === 'openai') {
      if (!this.settings.openaiApiKey || this.settings.openaiApiKey.trim() === '') {
        return 'Please configure your OpenAI API key in settings before sending messages.';
      }
    } else {
      if (!this.settings.ollamaUrl || this.settings.ollamaUrl.trim() === '') {
        return 'Please configure your Ollama server URL in settings before sending messages.';
      }
    }
    return null;
  }

  getApiUrl(): string {
    if (this.settings.apiProvider === 'groq') {
      return 'https://api.groq.com/openai/v1/chat/completions';
    } else if (this.settings.apiProvider === 'openai') {
      return 'https://api.openai.com/v1/chat/completions';
    } else {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      return `${cleanUrl}/api/generate`;
    }
  }

  getApiHeaders(): Record<string, string> {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey;
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
    } else if (this.settings.apiProvider === 'openai') {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.openaiApiKey}`
      };
    } else {
      return { 'Content-Type': 'application/json' };
    }
  }

  async buildRequestBody(message: string, chatHistory: Message[]): Promise<any> {
    if (this.settings.apiProvider === 'groq') {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const modelToUse = groqModels.includes(this.settings.model) ? this.settings.model : 'llama-3.3-70b-versatile';
      
      const messages = await this.buildChatMessages(message, chatHistory);
      return {
        model: modelToUse,
        messages: messages,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
        stream: this.settings.streamResponses
      };
    } else if (this.settings.apiProvider === 'openai') {
      const openaiModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      const modelToUse = openaiModels.includes(this.settings.model) ? this.settings.model : 'gpt-4';
      
      const messages = await this.buildChatMessages(message, chatHistory);
      return {
        model: modelToUse,
        messages: messages,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
        stream: this.settings.streamResponses
      };
    } else {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const openaiModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      const modelToUse = (groqModels.includes(this.settings.model) || openaiModels.includes(this.settings.model)) ? 'llama3.2:latest' : this.settings.model;
      
      return {
        model: modelToUse,
        prompt: this.buildPrompt(message, chatHistory),
        stream: this.settings.streamResponses,
        options: {
          temperature: this.settings.temperature,
          num_predict: this.settings.maxTokens
        }
      };
    }
  }

  private async loadBusinessFiles(): Promise<string> {
    try {
      // Determine the correct base path for business files
      const isProduction = import.meta.env.PROD && window.location.hostname === 'dfegarido.github.io';
      const basePath = isProduction ? '/chatbot' : '';
      
      // Load business files from the public docs folder
      const businessInfoResponse = await fetch(`${basePath}/src/docs/CUPCAKE_LAB_BUSINESS_INFO.txt`);
      const pricingResponse = await fetch(`${basePath}/src/docs/CUPCAKE_LAB_DETAILED_PRICING.txt`);
      
      let businessContent = '';
      
      if (businessInfoResponse.ok) {
        const businessInfo = await businessInfoResponse.text();
        businessContent += `\n\n[CUPCAKE LAB BUSINESS INFORMATION]\n${businessInfo}\n[END BUSINESS INFORMATION]\n`;
      }
      
      if (pricingResponse.ok) {
        const pricingInfo = await pricingResponse.text();
        businessContent += `\n\n[CUPCAKE LAB DETAILED PRICING]\n${pricingInfo}\n[END PRICING INFORMATION]\n`;
      }
      
      return businessContent;
    } catch (error) {
      console.warn('Could not load business files:', error);
      return '';
    }
  }

  private async buildChatMessages(message: string, chatHistory: Message[]): Promise<any[]> {
    const messages = [];
    
    // Check if there's uploaded business information
    const businessInfo = (window as any).__businessInfo;
    
    let systemPrompt = this.settings.systemPrompt;
    
    // First, try to load business files from docs folder
    const businessFilesContent = await this.loadBusinessFiles();
    if (businessFilesContent) {
      systemPrompt += businessFilesContent;
    }
    
    // Add uploaded business information if available (this takes precedence)
    if (businessInfo && businessInfo.content) {
      const businessContext = `

[UPLOADED_BUSINESS_INFORMATION - Use this data to answer business-related questions:]
${businessInfo.content}
[END_BUSINESS_INFORMATION]

When users ask about the business, products, pricing, services, or related information, use the data above to provide accurate, specific details. Keep responses concise and focused on what the user actually asked.`;
      
      systemPrompt += businessContext;
    }
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    const recentMessages = chatHistory.slice(-10);
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    messages.push({
      role: 'user',
      content: message
    });
    
    return messages;
  }

  private buildPrompt(message: string, chatHistory: Message[]): string {
    let systemPrompt = this.settings.systemPrompt || "You are a helpful AI assistant.";
    
    // Check if there's uploaded business information
    const businessInfo = (window as any).__businessInfo;
    
    // Add uploaded business information if available
    if (businessInfo && businessInfo.content) {
      const businessContext = `

[UPLOADED_BUSINESS_INFORMATION - Use this data to answer business-related questions:]
${businessInfo.content}
[END_BUSINESS_INFORMATION]

When users ask about the business, products, pricing, services, or related information, use the data above to provide accurate, specific details. Keep responses concise and focused on what the user actually asked.`;
      
      systemPrompt += businessContext;
    }
    
    let prompt = systemPrompt + "\n\n";
    
    const recentMessages = chatHistory.slice(-10);
    for (const msg of recentMessages) {
      prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
    }
    
    prompt += `Human: ${message}\nAssistant:`;
    return prompt;
  }

  async testConnection(): Promise<ApiResponse> {
    if (this.settings.apiProvider === 'groq') {
      return this.testGroqConnection();
    } else if (this.settings.apiProvider === 'openai') {
      return this.testOpenAIConnection();
    } else {
      return this.testOllamaConnection();
    }
  }

  private async testOllamaConnection(): Promise<ApiResponse> {
    try {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return { success: true, message: 'Connected successfully' };
      } else {
        return { success: false, message: `Server responded with status ${response.status}` };
      }
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        return { success: false, message: 'Connection timeout - check if Ollama is running' };
      }
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  private async testOpenAIConnection(): Promise<ApiResponse> {
    try {
      if (!this.settings.openaiApiKey) {
        return { success: false, message: 'Please enter your OpenAI API key' };
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.settings.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return { success: true, message: 'Connected successfully to OpenAI API' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: `API Error: ${errorData.error?.message || response.statusText}` };
      }
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        return { success: false, message: 'Connection timeout - check your internet connection' };
      }
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  private async testGroqConnection(): Promise<ApiResponse> {
    try {
      const apiKey = this.settings.groqApiKey;
      if (!apiKey) {
        return { success: false, message: 'Please enter your Groq API key' };
      }
      
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return { success: true, message: 'Connected successfully to Groq API' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: `API Error: ${errorData.error?.message || response.statusText}` };
      }
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        return { success: false, message: 'Connection timeout - check your internet connection' };
      }
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async fetchModels(): Promise<string[]> {
    if (this.settings.apiProvider === 'groq') {
      return ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    } else if (this.settings.apiProvider === 'openai') {
      return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
    
    try {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      const url = `${cleanUrl}/api/tags`;
      
      const response = await fetch(url, { 
        method: 'GET', 
        signal: AbortSignal.timeout(5000) 
      });
      
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      if (data && Array.isArray(data.models)) {
        return data.models.map((model: any) => model.name || model);
      } else if (data && Array.isArray(data.tags)) {
        return data.tags.map((tag: any) => tag.name || tag);
      }
      
      return [];
    } catch (error) {
      console.warn('Could not fetch models:', error);
      return ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
    }
  }

  getContextualErrorMessage(error: any): string {
    const baseMessage = 'Sorry, there was an error processing your request.';
    
    if (this.settings.apiProvider === 'groq') {
      if (error.message.includes('401')) {
        return `${baseMessage} Please check your Groq API key in settings.`;
      } else if (error.message.includes('429')) {
        return `${baseMessage} Rate limit exceeded. Please try again later.`;
      } else if (error.message.includes('404') && error.message.includes('model')) {
        return `${baseMessage} The selected model is not available on Groq. Please select a different model.`;
      }
    } else if (this.settings.apiProvider === 'openai') {
      if (error.message.includes('401')) {
        return `${baseMessage} Please check your OpenAI API key in settings.`;
      } else if (error.message.includes('429')) {
        return `${baseMessage} Rate limit exceeded. Please try again later.`;
      } else if (error.message.includes('404') && error.message.includes('model')) {
        return `${baseMessage} The selected model is not available on OpenAI. Please select a different model.`;
      } else if (error.message.includes('insufficient_quota')) {
        return `${baseMessage} OpenAI API quota exceeded. Please check your billing settings.`;
      }
    } else {
      if (error.message.includes('fetch')) {
        return `${baseMessage} Please check your Ollama server URL (${this.settings.ollamaUrl}) and make sure Ollama is running.`;
      } else {
        return `${baseMessage} Ollama error: ${error.message}`;
      }
    }
    
    return baseMessage;
  }
}
