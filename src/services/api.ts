import { Settings, ApiResponse, Message } from '@/types';

export class ChatApiService {
  constructor(private settings: Settings) {}

  validateConfiguration(): string | null {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey || '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';
      if (!apiKey || apiKey.trim() === '') {
        return 'Please configure your Groq API key in settings before sending messages.';
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
    } else {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      return `${cleanUrl}/api/generate`;
    }
  }

  getApiHeaders(): Record<string, string> {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey || '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';
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
    } else {
      return { 'Content-Type': 'application/json' };
    }
  }

  buildRequestBody(message: string, chatHistory: Message[]): any {
    if (this.settings.apiProvider === 'groq') {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const modelToUse = groqModels.includes(this.settings.model) ? this.settings.model : 'llama-3.3-70b-versatile';
      
      const messages = this.buildGroqMessages(message, chatHistory);
      return {
        model: modelToUse,
        messages: messages,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
        stream: this.settings.streamResponses
      };
    } else {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const modelToUse = groqModels.includes(this.settings.model) ? 'llama3.2:latest' : this.settings.model;
      
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

  private buildGroqMessages(message: string, chatHistory: Message[]): any[] {
    const messages = [];
    
    // Check if there are product details to include
    const productDetails = (window as any).__tempProductDetails;
    let systemPrompt = this.settings.systemPrompt;
    
    if (productDetails && productDetails.length > 0) {
      const productContext = `

[AVAILABLE_PRODUCT_INFORMATION - Use this data to answer product-related questions:]
${productDetails.map((img: any) => `
- PRODUCT: ${img.description}
- CATEGORY: ${img.category}
- KEYWORDS: ${img.keywords.join(', ')}
- PRICING: ${JSON.stringify(img.prices, null, 2)}
- IMAGE: ${img.filename}
`).join('')}
[END_PRODUCT_INFORMATION]

When users ask about products, pricing, or related information, use the data above to provide accurate, specific details. Keep responses concise and focused on what the user actually asked.`;
      
      systemPrompt += productContext;
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
    
    // Check if there are product details to include
    const productDetails = (window as any).__tempProductDetails;
    
    if (productDetails && productDetails.length > 0) {
      const productContext = `

[AVAILABLE_PRODUCT_INFORMATION - Use this data to answer product-related questions:]
${productDetails.map((img: any) => `
- PRODUCT: ${img.description}
- CATEGORY: ${img.category}
- KEYWORDS: ${img.keywords.join(', ')}
- PRICING: ${JSON.stringify(img.prices, null, 2)}
- IMAGE: ${img.filename}
`).join('')}
[END_PRODUCT_INFORMATION]

When users ask about products, pricing, or related information, use the data above to provide accurate, specific details. Keep responses concise and focused on what the user actually asked.`;
      
      systemPrompt += productContext;
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

  private async testGroqConnection(): Promise<ApiResponse> {
    try {
      const apiKey = this.settings.groqApiKey || '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';
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
