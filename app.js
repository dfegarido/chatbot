// Enhanced AI Chat Assistant
class ChatApp {
  constructor() {
    this.currentChatId = null;
    this.chats = this.loadChats();
    this.settings = this.loadSettings();
    this.isStreaming = false;
    this.showThinking = this.settings.showThinking || false;
    
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeEmojiPicker();
    this.loadInitialChat();
    this.applyTheme();
  }

  initializeElements() {
    // Main elements
    this.chatForm = document.getElementById('chat-form');
    this.chatMessage = document.getElementById('chat-message');
    this.chatHistory = document.getElementById('chat-history');
    this.chatSessions = document.getElementById('chat-sessions');
    this.chatTitle = document.getElementById('chat-title');
    
    // Buttons and controls
    this.newChatBtn = document.getElementById('new-chat-btn');
    this.clearChatBtn = document.getElementById('clear-chat');
    this.themeToggle = document.getElementById('theme-toggle');
    this.settingsBtn = document.getElementById('settings-btn');
    this.modelSelector = document.getElementById('model-selector');
    this.sendBtn = document.getElementById('send-btn');
    
    // Emoji picker elements
    this.emojiBtn = document.getElementById('emoji-btn');
    this.emojiPicker = document.getElementById('emoji-picker');
    this.emojiPickerClose = document.getElementById('emoji-picker-close');
    this.emojiGrid = document.getElementById('emoji-grid');
    
    // Modal elements
    this.settingsModal = document.getElementById('settings-modal');
    this.modalClose = document.getElementById('modal-close');
    this.temperatureSlider = document.getElementById('temperature');
    this.temperatureValue = document.getElementById('temperature-value');
    this.ollamaUrlInput = document.getElementById('ollama-url');
    this.maxTokensInput = document.getElementById('max-tokens');
    this.systemPromptInput = document.getElementById('system-prompt');
    this.streamResponsesCheckbox = document.getElementById('stream-responses');
    this.testConnectionBtn = document.getElementById('test-connection-btn');
    this.connectionStatus = document.getElementById('connection-status');
    
    // API provider elements
    this.apiProviderSelect = document.getElementById('api-provider');
    this.ollamaSettings = document.getElementById('ollama-settings');
    this.groqSettings = document.getElementById('groq-settings');
    this.groqApiKeyInput = document.getElementById('groq-api-key');
    this.testGroqBtn = document.getElementById('test-groq-btn');
    this.groqConnectionStatus = document.getElementById('groq-connection-status');
    
    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.toggleSidebar = document.getElementById('toggle-sidebar');
    this.mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    
    // Download model elements
    this.downloadModelInput = document.getElementById('download-model-input');
    this.downloadModelBtn = document.getElementById('download-model-btn');
    this.downloadModelStatus = document.getElementById('download-model-status');
    
    // Show thinking toggle
    this.showThinkingCheckbox = document.getElementById('show-thinking');
  }

  initializeEventListeners() {
    // Chat form submission
    this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Auto-resize textarea
    this.chatMessage.addEventListener('input', () => this.autoResizeTextarea());
    
    // Enter key handling
    this.chatMessage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit(e);
      }
    });
    
    // Button event listeners
    this.newChatBtn.addEventListener('click', () => this.createNewChat());
    this.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.modalClose.addEventListener('click', () => this.closeSettings());
    
    // Settings event listeners
    this.temperatureSlider.addEventListener('input', () => this.updateTemperatureValue());
    this.ollamaUrlInput.addEventListener('change', () => this.saveSettings());
    this.maxTokensInput.addEventListener('change', () => this.saveSettings());
    this.systemPromptInput.addEventListener('change', () => this.saveSettings());
    this.streamResponsesCheckbox.addEventListener('change', () => this.saveSettings());
    this.showThinkingCheckbox.addEventListener('change', () => this.toggleShowThinking());
    this.testConnectionBtn.addEventListener('click', () => this.handleTestConnection());
    
    // API provider event listeners
    this.apiProviderSelect.addEventListener('change', () => this.handleApiProviderChange());
    this.groqApiKeyInput.addEventListener('change', () => this.saveSettings());
    this.testGroqBtn.addEventListener('click', () => this.handleTestGroqConnection());
    
    // Sidebar toggles
    this.toggleSidebar.addEventListener('click', () => this.toggleSidebarVisibility());
    this.mobileSidebarToggle.addEventListener('click', () => this.toggleMobileSidebar());
    
    // Model selection
    this.modelSelector.addEventListener('change', () => this.saveSettings());
    
    // Emoji picker events
    this.emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
    this.emojiPickerClose.addEventListener('click', () => this.closeEmojiPicker());
    
    // Emoji category selection
    document.querySelectorAll('.emoji-category').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectEmojiCategory(e.target.dataset.category));
    });
    
    // Modal outside click
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeSettings();
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.emojiPicker.contains(e.target) && !this.emojiBtn.contains(e.target)) {
        this.closeEmojiPicker();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          this.createNewChat();
        } else if (e.key === 'k') {
          e.preventDefault();
          this.chatMessage.focus();
        }
      }
    });
    
    // Download model button
    this.downloadModelBtn.addEventListener('click', () => this.handleDownloadModel());
  }

  async handleSubmit(e) {
    e.preventDefault();
    const message = this.chatMessage.value.trim();
    if (!message || this.isStreaming) return;

    // Validate API configuration
    const validationError = this.validateApiConfiguration();
    if (validationError) {
      alert(validationError);
      return;
    }

    // Ensure we have a current chat
    if (!this.currentChatId) {
      this.createNewChat();
    }

    this.addMessage('user', message);
    this.chatMessage.value = '';
    this.autoResizeTextarea();
    
    this.showTypingIndicator();
    this.isStreaming = true;
    this.sendBtn.disabled = true;

    try {
      if (this.settings.streamResponses) {
        await this.handleStreamingResponse(message);
      } else {
        await this.handleRegularResponse(message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.removeTypingIndicator();
      
      let errorMessage = this.getContextualErrorMessage(error);
      this.addMessage('assistant', errorMessage);
    } finally {
      this.isStreaming = false;
      this.sendBtn.disabled = false;
    }
  }

  validateApiConfiguration() {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey || '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'; // Fallback key
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

  getContextualErrorMessage(error) {
    const baseMessage = 'Sorry, there was an error processing your request.';
    
    if (this.settings.apiProvider === 'groq') {
      if (error.message.includes('401')) {
        return `${baseMessage} Please check your Groq API key in settings.`;
      } else if (error.message.includes('429')) {
        return `${baseMessage} Rate limit exceeded. Please try again later.`;
      } else if (error.message.includes('404') && error.message.includes('model')) {
        return `${baseMessage} The selected model is not available on Groq. Please select a different model in the header.`;
      } else if (error.message.includes('modelnotfound')) {
        return `${baseMessage} The model "${this.settings.model}" is not available on Groq. Please select a Groq-compatible model like "llama-3.3-70b-versatile".`;
      } else if (error.message.includes('fetch')) {
        return `${baseMessage} Please check your internet connection.`;
      } else {
        return `${baseMessage} Groq API error: ${error.message}`;
      }
    } else {
      if (error.message.includes('fetch')) {
        return `${baseMessage} Please check your Ollama server URL (${this.settings.ollamaUrl}) and make sure Ollama is running.`;
      } else {
        return `${baseMessage} Ollama error: ${error.message}`;
      }
    }
  }

  async handleStreamingResponse(message) {
    this.removeTypingIndicator();
    this.showTypingIndicator();
    
    const streamingMessageDiv = document.createElement('div');
    streamingMessageDiv.className = 'message assistant streaming';
    streamingMessageDiv.innerHTML = `
      <div class="message-header">
        <span>Assistant</span>
        <div class="message-actions">
          <button class="message-action" onclick="app.copyMessage(this)" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <span class="message-time">${this.formatTime(new Date())}</span>
      </div>
      <div class="message-content"></div>
    `;
    this.chatHistory.appendChild(streamingMessageDiv);
    this.scrollToBottom();
    const messageContent = streamingMessageDiv.querySelector('.message-content');
    
    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: this.getApiHeaders(),
        body: JSON.stringify(this.buildRequestBody(message))
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let lastThought = '';
      
      if (this.settings.apiProvider === 'groq') {
        // Handle Groq streaming format (Server-Sent Events)
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
                  // Remove typing indicator when we start getting actual response
                  this.removeTypingIndicator();
                  fullResponse += delta.content;
                  messageContent.innerHTML = this.formatStreamingMessage(fullResponse);
                  this.scrollToBottom();
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
                if (thoughtText !== lastThought && this.showThinking) {
                  lastThought = thoughtText;
                  this.updateTypingIndicatorWithThinking(thoughtText);
                }
              }
              if (data.response) {
                // Remove typing indicator when we start getting actual response
                this.removeTypingIndicator();
                fullResponse += data.response;
                messageContent.innerHTML = this.formatStreamingMessage(fullResponse);
                this.scrollToBottom();
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
      
      this.updateCurrentChat(message, fullResponse);
      streamingMessageDiv.remove();
      this.addAssistantMessageWithCodeBlocks(fullResponse);
    } catch (error) {
      if (streamingMessageDiv) streamingMessageDiv.remove();
      this.removeTypingIndicator();
      throw error;
    }
  }

  async handleRegularResponse(message) {
    try {
      // Keep typing animation running during the entire fetch
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: this.getApiHeaders(),
        body: JSON.stringify(this.buildRequestBody(message))
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      let assistantResponse;
      let thinkingContent = null;
      
      if (this.settings.apiProvider === 'groq') {
        // Handle Groq response format
        if (data.choices && data.choices.length > 0) {
          assistantResponse = data.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from Groq API');
        }
      } else {
        // Handle Ollama response format
        assistantResponse = data.response || 'No response received.';
        thinkingContent = data.thought || data.thinking;
      }
      
      // Show thinking in typing indicator if available and enabled
      if (thinkingContent && this.showThinking) {
        this.updateTypingIndicatorWithThinking(thinkingContent);
        // Wait a bit to show the thinking before proceeding
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Now remove typing indicator and show response
      this.removeTypingIndicator();
      this.addMessage('assistant', assistantResponse);
      this.updateCurrentChat(message, assistantResponse);
    } catch (error) {
      this.removeTypingIndicator();
      throw error;
    }
  }

  buildPrompt(message) {
    const chat = this.chats[this.currentChatId];
    const systemPrompt = this.settings.systemPrompt || "You are a helpful AI assistant.";
    
    let prompt = systemPrompt + "\n\n";
    
    // Add conversation history for context
    if (chat && chat.messages.length > 0) {
      const recentMessages = chat.messages.slice(-10); // Last 10 messages for context
      for (const msg of recentMessages) {
        prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
      }
    }
    
    prompt += `Human: ${message}\nAssistant:`;
    return prompt;
  }

  getApiUrl() {
    if (this.settings.apiProvider === 'groq') {
      return 'https://api.groq.com/openai/v1/chat/completions';
    } else {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      return `${cleanUrl}/api/generate`;
    }
  }

  getApiHeaders() {
    if (this.settings.apiProvider === 'groq') {
      const apiKey = this.settings.groqApiKey || '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'; // Fallback key
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
    } else {
      return { 'Content-Type': 'application/json' };
    }
  }

  buildRequestBody(message) {
    if (this.settings.apiProvider === 'groq') {
      // Ensure we're using a Groq-compatible model
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const modelToUse = groqModels.includes(this.settings.model) ? this.settings.model : 'llama-3.3-70b-versatile';
      
      const messages = this.buildGroqMessages(message);
      return {
        model: modelToUse,
        messages: messages,
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
        stream: this.settings.streamResponses
      };
    } else {
      // Ensure we're using an Ollama-compatible model
      const ollamaModels = ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      const modelToUse = groqModels.includes(this.settings.model) ? 'llama3.2:latest' : this.settings.model;
      
      return {
        model: modelToUse,
        prompt: this.buildPrompt(message),
        stream: this.settings.streamResponses,
        options: {
          temperature: this.settings.temperature,
          num_predict: this.settings.maxTokens
        }
      };
    }
  }

  buildGroqMessages(message) {
    const messages = [];
    
    // Add system message
    if (this.settings.systemPrompt) {
      messages.push({
        role: 'system',
        content: this.settings.systemPrompt
      });
    }
    
    // Add conversation history
    const chat = this.chats[this.currentChatId];
    if (chat && chat.messages.length > 0) {
      const recentMessages = chat.messages.slice(-10); // Last 10 messages for context
      for (const msg of recentMessages) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }
    
    // Add current message
    messages.push({
      role: 'user',
      content: message
    });
    
    return messages;
  }

  // Test connection to Ollama server
  async testOllamaConnection() {
    try {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
      // Always use corsproxy.io
      const response = await fetch(`${cleanUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        return { success: true, message: 'Connected successfully' };
      } else {
        return { success: false, message: `Server responded with status ${response.status}` };
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        return { success: false, message: 'Connection timeout - check if Ollama is running' };
      }
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  addMessage(role, content) {
    // Remove welcome message if it exists
    const welcomeMessage = this.chatHistory.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    if (role === 'assistant') {
      this.addAssistantMessageWithCodeBlocks(content);
    } else {
      this.addRegularMessage(role, content);
    }
  }

  addRegularMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    const timestamp = new Date();
    
    // Use markdown formatting for assistant messages, plain text for user messages
    const formattedContent = role === 'assistant' ? this.formatMessage(content) : this.escapeHtml(content);
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span>${role === 'user' ? 'You' : 'Assistant'}</span>
        <div class="message-actions">
          <button class="message-action" onclick="app.copyMessage(this)" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <span class="message-time">${this.formatTime(timestamp)}</span>
      </div>
      <div class="message-content">${formattedContent}</div>
    `;
    this.chatHistory.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addAssistantMessageWithCodeBlocks(content) {
    // Remove <think> blocks from the content before parsing
    const cleanedContent = this.removeThinkingBlocks(content);
    const parts = this.parseContentWithCodeBlocks(cleanedContent);
    
    parts.forEach((part, index) => {
      if (part.type === 'text' && part.content.trim()) {
        this.addRegularMessage('assistant', part.content);
      } else if (part.type === 'code') {
        this.addCodeBlockMessage(part.content, part.language);
      }
    });
  }

  removeThinkingBlocks(content) {
    // Remove all <think>...</think> blocks from the content
    return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  }

  parseContentWithCodeBlocks(content) {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let matches = [];

    // Find all code blocks
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        type: 'code',
        start: match.index,
        end: match.index + match[0].length,
        language: match[1] || 'text',
        content: match[2].trim()
      });
    }

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Process matches and extract text parts
    for (const match of matches) {
      // Add text before the current block
      if (match.start > lastIndex) {
        const textContent = content.substring(lastIndex, match.start).trim();
        if (textContent) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
      }

      // Add the code block
      parts.push(match);
      lastIndex = match.end;
    }

    // Add remaining text after the last block
    if (lastIndex < content.length) {
      const textContent = content.substring(lastIndex).trim();
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    // If no blocks found, return the entire content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content
      });
    }

    return parts;
  }

  addCodeBlockMessage(code, language = 'text') {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant code-block-message';
    const timestamp = new Date();
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span>Assistant</span>
        <div class="message-actions">
          <button class="message-action" onclick="app.copyCodeBlock(this)" title="Copy code">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <span class="message-time">${this.formatTime(timestamp)}</span>
      </div>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-language">${language}</span>
        </div>
        <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
      </div>
    `;
    
    this.chatHistory.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addThinkingMessage(thinkingContent) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant thinking-message';
    const timestamp = new Date();
    
    messageDiv.innerHTML = `
      <div class="message-header">
        <span>Assistant is thinking...</span>
        <div class="message-actions">
          <button class="message-action" onclick="app.copyMessage(this)" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <span class="message-time">${this.formatTime(timestamp)}</span>
      </div>
      <div class="message-content">${this.formatMarkdown(thinkingContent)}</div>
    `;
    
    this.chatHistory.appendChild(messageDiv);
    this.scrollToBottom();
  }

  // Format message with markdown support (excluding code blocks)
  formatMessage(content) {
    return this.formatMarkdown(content);
  }

  // Format streaming message with markdown support (excluding code blocks)
  formatStreamingMessage(content) {
    return this.formatMarkdown(content);
  }

  formatMarkdown(content) {
    let formatted = this.escapeHtml(content);
    
    // Bold text (**text** or __text__)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic text (*text* or _text_)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Headers
    formatted = formatted.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Inline code `code` (but not code blocks)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Process lists before line breaks
    const lines = formatted.split('\n');
    let inList = false;
    let listType = null;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isUnorderedListItem = /^- (.+)/.test(line);
      const isOrderedListItem = /^\d+\. (.+)/.test(line);
      
      if (isUnorderedListItem || isOrderedListItem) {
        const currentListType = isUnorderedListItem ? 'ul' : 'ol';
        
        if (!inList) {
          processedLines.push(`<${currentListType}>`);
          inList = true;
          listType = currentListType;
        } else if (listType !== currentListType) {
          processedLines.push(`</${listType}>`);
          processedLines.push(`<${currentListType}>`);
          listType = currentListType;
        }
        
        const content = isUnorderedListItem 
          ? line.replace(/^- (.+)/, '$1')
          : line.replace(/^\d+\. (.+)/, '$1');
        processedLines.push(`<li>${content}</li>`);
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push(`</${listType}>`);
    }
    
    formatted = processedLines.join('\n');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Blockquotes
    formatted = formatted.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    formatted = formatted.replace(/^---$/gm, '<hr>');
    formatted = formatted.replace(/^\*\*\*$/gm, '<hr>');
    
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  copyCodeBlock(button) {
    const codeBlock = button.closest('.code-block-message').querySelector('code');
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
      const icon = button.querySelector('i');
      const originalClass = icon.className;
      icon.className = 'fas fa-check';
      button.style.color = 'var(--success-color)';
      
      setTimeout(() => {
        icon.className = originalClass;
        button.style.color = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  }

  copyMessage(button) {
    const messageContent = button.closest('.message').querySelector('.message-content');
    const text = messageContent.textContent || messageContent.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
      const icon = button.querySelector('i');
      icon.className = 'fas fa-check';
      setTimeout(() => {
        icon.className = 'fas fa-copy';
      }, 2000);
    });
  }

  showTypingIndicator() {
    this.removeTypingIndicator(); // Remove any existing indicator
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-header">
        <span>Assistant</span>
      </div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    
    this.chatHistory.appendChild(typingDiv);
    this.scrollToBottom();
  }

  updateTypingIndicatorWithThinking(thinkingText) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      const header = indicator.querySelector('.message-header span');
      const content = indicator.querySelector('.typing-dots');
      
      if (this.showThinking) {
        header.textContent = 'Assistant is thinking...';
        content.innerHTML = `<div class="thinking-content">${this.escapeHtml(thinkingText)}</div>`;
        content.className = 'thinking-content-wrapper';
      }
    }
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  createNewChat() {
    const chatId = 'chat_' + Date.now();
    const chat = {
      id: chatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.chats[chatId] = chat;
    this.currentChatId = chatId;
    this.saveChats();
    this.renderChatSessions();
    this.loadChat(chatId);
  }

  loadChat(chatId) {
    this.currentChatId = chatId;
    this.chatHistory.innerHTML = '';
    
    const chat = this.chats[chatId];
    if (!chat) return;

    this.chatTitle.textContent = chat.title;
    
    if (chat.messages.length === 0) {
      this.showWelcomeMessage();
    } else {
      chat.messages.forEach(message => {
        this.addMessage(message.role, message.content);
      });
    }
    
    this.renderChatSessions();
  }

  updateCurrentChat(userMessage, assistantMessage) {
    if (!this.currentChatId) return;
    
    const chat = this.chats[this.currentChatId];
    if (!chat) return;
    
    // Add user message
    chat.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Add assistant message
    chat.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString()
    });
    
    // Update chat title if it's the first message
    if (chat.title === 'New Chat' && userMessage.length > 0) {
      chat.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
      this.chatTitle.textContent = chat.title;
    }
    
    chat.updatedAt = new Date().toISOString();
    this.saveChats();
    this.renderChatSessions();
  }

  clearCurrentChat() {
    if (!this.currentChatId || !confirm('Are you sure you want to clear this chat?')) return;
    
    const chat = this.chats[this.currentChatId];
    if (chat) {
      chat.messages = [];
      chat.title = 'New Chat';
      this.saveChats();
      this.loadChat(this.currentChatId);
    }
  }

  deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    delete this.chats[chatId];
    this.saveChats();
    
    if (this.currentChatId === chatId) {
      // Find another chat to load or create a new one
      const chatIds = Object.keys(this.chats);
      if (chatIds.length > 0) {
        this.loadChat(chatIds[0]);
      } else {
        this.createNewChat();
      }
    }
    
    this.renderChatSessions();
  }

  renderChatSessions() {
    const sortedChats = Object.values(this.chats)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    this.chatSessions.innerHTML = sortedChats.map(chat => {
      const isActive = chat.id === this.currentChatId;
      const preview = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + '...'
        : 'No messages yet';
      
      return `
        <div class="chat-session ${isActive ? 'active' : ''}" onclick="app.loadChat('${chat.id}')">
          <div class="chat-session-title">${chat.title}</div>
          <div class="chat-session-preview">${preview}</div>
        </div>
      `;
    }).join('');
  }

  showWelcomeMessage() {
    this.chatHistory.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">
          <i class="fas fa-robot"></i>
        </div>
        <h2>Welcome to AI Chat Assistant</h2>
        <p>Start a conversation with your local AI model. Ask questions, get help with code, or just chat!</p>
      </div>
    `;
  }

  autoResizeTextarea() {
    this.chatMessage.style.height = 'auto';
    this.chatMessage.style.height = Math.min(this.chatMessage.scrollHeight, 200) + 'px';
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }, 100);
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Settings Management
  openSettings() {
    this.settingsModal.classList.add('active');
    this.loadSettingsToForm();
    this.updateModelList(); // Fetch models when opening settings
  }

  closeSettings() {
    this.settingsModal.classList.remove('active');
    this.saveSettings();
  }

  loadSettingsToForm() {
    this.temperatureSlider.value = this.settings.temperature;
    this.temperatureValue.textContent = this.settings.temperature;
    this.ollamaUrlInput.value = this.settings.ollamaUrl;
    this.maxTokensInput.value = this.settings.maxTokens;
    this.systemPromptInput.value = this.settings.systemPrompt;
    this.streamResponsesCheckbox.checked = this.settings.streamResponses;
    this.showThinkingCheckbox.checked = this.settings.showThinking;
    this.modelSelector.value = this.settings.model;
    this.apiProviderSelect.value = this.settings.apiProvider;
    this.groqApiKeyInput.value = this.settings.groqApiKey;
    
    // Show/hide appropriate settings sections
    this.handleApiProviderChange();
  }

  toggleShowThinking() {
    this.showThinking = this.showThinkingCheckbox.checked;
    this.saveSettings();
  }

  updateTemperatureValue() {
    this.temperatureValue.textContent = this.temperatureSlider.value;
    this.saveSettings();
  }

  async handleTestConnection() {
    this.testConnectionBtn.disabled = true;
    this.testConnectionBtn.textContent = 'Testing...';
    this.connectionStatus.style.display = 'none';
    // Update the URL from the input field temporarily for testing
    const originalUrl = this.settings.ollamaUrl;
    this.settings.ollamaUrl = this.ollamaUrlInput.value;
    const result = await this.testOllamaConnection();
    // Restore original URL if test failed
    if (!result.success) {
      this.settings.ollamaUrl = originalUrl;
    } else {
      // If connection is successful, update model list
      await this.updateModelList();
    }
    // Show result
    this.connectionStatus.textContent = result.message;
    this.connectionStatus.className = `connection-status ${result.success ? 'success' : 'error'}`;
    this.connectionStatus.style.display = 'block';
    // Reset button
    this.testConnectionBtn.disabled = false;
    this.testConnectionBtn.textContent = 'Test';
    // Save settings if connection was successful
    if (result.success) {
      this.saveSettings();
    }
  }

  handleApiProviderChange() {
    const provider = this.apiProviderSelect.value;
    
    // Show/hide relevant settings sections
    if (provider === 'groq') {
      this.ollamaSettings.style.display = 'none';
      this.groqSettings.style.display = 'block';
      
      // Switch to a Groq-compatible model if current model is Ollama-specific
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (!groqModels.includes(this.settings.model)) {
        this.settings.model = 'llama-3.3-70b-versatile';
        this.modelSelector.value = 'llama-3.3-70b-versatile';
      }
    } else {
      this.ollamaSettings.style.display = 'block';
      this.groqSettings.style.display = 'none';
      
      // Switch to an Ollama-compatible model if current model is Groq-specific
      const ollamaModels = ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (groqModels.includes(this.settings.model)) {
        this.settings.model = 'llama3.2:latest';
        this.modelSelector.value = 'llama3.2:latest';
      }
    }
    
    this.saveSettings();
  }

  async handleTestGroqConnection() {
    this.testGroqBtn.disabled = true;
    this.testGroqBtn.textContent = 'Testing...';
    this.groqConnectionStatus.style.display = 'none';
    
    const result = await this.testGroqConnection();
    
    // Show result
    this.groqConnectionStatus.textContent = result.message;
    this.groqConnectionStatus.className = `connection-status ${result.success ? 'success' : 'error'}`;
    this.groqConnectionStatus.style.display = 'block';
    
    // Reset button
    this.testGroqBtn.disabled = false;
    this.testGroqBtn.textContent = 'Test';
    
    // Save settings if connection was successful
    if (result.success) {
      this.saveSettings();
    }
  }

  async testGroqConnection() {
    try {
      const apiKey = this.groqApiKeyInput.value.trim() ; // Fallback key
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
    } catch (error) {
      if (error.name === 'TimeoutError') {
        return { success: false, message: 'Connection timeout - check your internet connection' };
      }
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async updateModelList() {
    const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/api/tags`;
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      if (data && Array.isArray(data.models)) {
        this.populateModelSelector(data.models);
      } else if (data && Array.isArray(data.tags)) {
        // Some Ollama versions use 'tags' instead of 'models'
        const tagNames = data.tags.map(tag => tag.name);
        this.populateModelSelector(tagNames);
      }
    } catch (error) {
      // Optionally show a warning or fallback
      console.warn('Could not update model list:', error.message);
    }
  }

  populateModelSelector(models) {
    // Remove all options
    while (this.modelSelector.firstChild) {
      this.modelSelector.removeChild(this.modelSelector.firstChild);
    }
    // Add new options
    models.forEach(model => {
      let value, label;
      if (typeof model === 'string') {
        value = label = model;
      } else if (model && typeof model === 'object') {
        // Try to use 'name' or 'model' property
        value = model.name || model.model || JSON.stringify(model);
        label = model.name || model.model || '[unknown model]';
      } else {
        value = label = String(model);
      }
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      this.modelSelector.appendChild(option);
    });
    // Set current value if available
    const modelValues = models.map(m => (typeof m === 'string' ? m : (m.name || m.model)));
    if (modelValues.includes(this.settings.model)) {
      this.modelSelector.value = this.settings.model;
    } else if (modelValues.length > 0) {
      this.modelSelector.value = modelValues[0];
      this.settings.model = modelValues[0];
      this.saveSettings();
    }
  }

  async handleDownloadModel() {
    const model = this.downloadModelInput.value.trim();
    if (!model) {
      this.downloadModelStatus.textContent = 'Please enter a model name.';
      this.downloadModelStatus.className = 'download-model-status error';
      return;
    }
    this.downloadModelBtn.disabled = true;
    this.downloadModelStatus.textContent = 'Downloading...';
    this.downloadModelStatus.className = 'download-model-status';
    const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/api/pull`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model })
      });
      if (!response.ok) throw new Error('Failed to start download');
      // Ollama streams progress as JSON lines
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let lastPercent = 0;
      let finished = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value);
        // Each line is a JSON object
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status === 'success' || data.completed) {
              finished = true;
              this.downloadModelStatus.textContent = `Download complete for model: ${model}`;
              this.downloadModelStatus.className = 'download-model-status success';
            } else if (typeof data.total === 'number' && typeof data.completed === 'number') {
              // Calculate percent
              const percent = Math.floor((data.completed / data.total) * 100);
              if (percent !== lastPercent) {
                this.downloadModelStatus.textContent = `Downloading ${model}: ${percent}%`;
                this.downloadModelStatus.className = 'download-model-status';
                lastPercent = percent;
              }
            } else if (data.status) {
              this.downloadModelStatus.textContent = `Downloading ${model}: ${data.status}`;
              this.downloadModelStatus.className = 'download-model-status';
            }
          } catch (e) {
            // Ignore malformed lines
          }
        }
      }
      if (!finished) {
        this.downloadModelStatus.textContent = `Download started for model: ${model}`;
        this.downloadModelStatus.className = 'download-model-status';
      }
    } catch (error) {
      this.downloadModelStatus.textContent = `Download failed: ${error.message}`;
      this.downloadModelStatus.className = 'download-model-status error';
    } finally {
      this.downloadModelBtn.disabled = false;
    }
  }

  saveSettings() {
    this.settings = {
      model: this.modelSelector.value,
      temperature: parseFloat(this.temperatureSlider.value),
      ollamaUrl: this.ollamaUrlInput.value,
      maxTokens: parseInt(this.maxTokensInput.value),
      systemPrompt: this.systemPromptInput.value,
      streamResponses: this.streamResponsesCheckbox.checked,
      showThinking: this.showThinkingCheckbox.checked,
      theme: this.settings.theme || 'dark',
      apiProvider: this.apiProviderSelect.value,
      groqApiKey: this.groqApiKeyInput.value
    };
    
    localStorage.setItem('chatAppSettings', JSON.stringify(this.settings));
  }

  loadSettings() {
    const defaultSettings = {
      model: 'llama3.2:latest',
      temperature: 0.7,
      ollamaUrl: 'http://localhost:11434',
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant.',
      streamResponses: true,
      showThinking: false,
      theme: 'dark',
      apiProvider: 'ollama',
      groqApiKey: ''
    };
    
    const saved = localStorage.getItem('chatAppSettings');
    const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    
    // Ensure correct model for API provider
    if (settings.apiProvider === 'groq') {
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (!groqModels.includes(settings.model)) {
        settings.model = 'llama-3.3-70b-versatile';
      }
    } else {
      const ollamaModels = ['llama3.2:latest', 'deepseek-coder:1.3b', 'deepseek-r1:8b', 'deepseek-coder-v2:latest'];
      const groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
      if (groqModels.includes(settings.model)) {
        settings.model = 'llama3.2:latest';
      }
    }
    
    return settings;
  }

  // Theme Management
  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveSettings();
  }

  applyTheme() {
    document.body.classList.toggle('light-theme', this.settings.theme === 'light');
    const icon = this.themeToggle.querySelector('i');
    icon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Sidebar Management
  toggleSidebarVisibility() {
    this.sidebar.classList.toggle('collapsed');
  }

  toggleMobileSidebar() {
    this.sidebar.classList.toggle('active');
  }

  // Data Management
  saveChats() {
    localStorage.setItem('chatAppChats', JSON.stringify(this.chats));
  }

  loadChats() {
    const saved = localStorage.getItem('chatAppChats');
    return saved ? JSON.parse(saved) : {};
  }

  loadInitialChat() {
    const chatIds = Object.keys(this.chats);
    if (chatIds.length > 0) {
      // Load the most recently updated chat
      const sortedChats = Object.values(this.chats)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      this.loadChat(sortedChats[0].id);
    } else {
      this.createNewChat();
    }
  }

  // Emoji functionality
  initializeEmojiPicker() {
    this.emojiData = {
      smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
      people: ['👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🧔', '👮', '👷', '💂', '🕵️', '👩‍⚕️', '👨‍🌾', '👩‍🍳', '👨‍🎓', '👩‍🎤', '👨‍🏫'],
      nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🌾', '🌺', '🌻'],
      food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐'],
      activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛴'],
      objects: ['📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️'],
      symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐']
    };
    
    this.loadEmojiCategory('smileys');
  }

  toggleEmojiPicker() {
    this.emojiPicker.classList.toggle('active');
    if (this.emojiPicker.classList.contains('active')) {
      this.loadEmojiCategory('smileys');
    }
  }

  closeEmojiPicker() {
    this.emojiPicker.classList.remove('active');
  }

  selectEmojiCategory(category) {
    // Update active category
    document.querySelectorAll('.emoji-category').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    this.loadEmojiCategory(category);
  }

  loadEmojiCategory(category) {
    const emojis = this.emojiData[category] || this.emojiData.smileys;
    this.emojiGrid.innerHTML = emojis.map(emoji => 
      `<button class="emoji-item" onclick="app.insertEmoji('${emoji}')">${emoji}</button>`
    ).join('');
  }

  insertEmoji(emoji) {
    const cursorPos = this.chatMessage.selectionStart;
    const textBefore = this.chatMessage.value.substring(0, cursorPos);
    const textAfter = this.chatMessage.value.substring(this.chatMessage.selectionEnd);
    
    this.chatMessage.value = textBefore + emoji + textAfter;
    this.chatMessage.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    this.chatMessage.focus();
    this.autoResizeTextarea();
    this.closeEmojiPicker();
  }
}

// Initialize the app
const app = new ChatApp();
