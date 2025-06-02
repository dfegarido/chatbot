// Enhanced AI Chat Assistant
class ChatApp {
  constructor() {
    this.currentChatId = null;
    this.chats = this.loadChats();
    this.settings = this.loadSettings();
    this.isStreaming = false;
    
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
    
    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.toggleSidebar = document.getElementById('toggle-sidebar');
    this.mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
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
    this.testConnectionBtn.addEventListener('click', () => this.handleTestConnection());
    
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
  }

  async handleSubmit(e) {
    e.preventDefault();
    const message = this.chatMessage.value.trim();
    if (!message || this.isStreaming) return;

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
      
      let errorMessage = 'Sorry, there was an error processing your request.';
      if (error.message.includes('fetch')) {
        errorMessage += ` Please check your Ollama server URL (${this.settings.ollamaUrl}) and make sure Ollama is running.`;
      } else {
        errorMessage += ' Please try again.';
      }
      
      this.addMessage('assistant', errorMessage);
    } finally {
      this.isStreaming = false;
      this.sendBtn.disabled = false;
    }
  }

  async handleStreamingResponse(message) {
    this.removeTypingIndicator();
    
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
      const response = await fetch(this.getOllamaApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.settings.model,
          prompt: this.buildPrompt(message),
          stream: true,
          options: {
            temperature: this.settings.temperature,
            num_predict: this.settings.maxTokens
          }
        })
      });

      if (!response.ok) throw new Error('Ollama server error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              messageContent.innerHTML = this.formatStreamingMessage(fullResponse);
              this.scrollToBottom();
            }
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }

      // Update chat with final response and apply final formatting
      this.updateCurrentChat(message, fullResponse);
      
      // Remove the streaming message and replace with properly formatted messages
      streamingMessageDiv.remove();
      this.addAssistantMessageWithCodeBlocks(fullResponse);
      
    } catch (error) {
      streamingMessageDiv.remove();
      throw error;
    }
  }

  async handleRegularResponse(message) {
    try {
      const response = await fetch(this.getOllamaApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.settings.model,
          prompt: this.buildPrompt(message),
          stream: false,
          options: {
            temperature: this.settings.temperature,
            num_predict: this.settings.maxTokens
          }
        })
      });

      if (!response.ok) throw new Error('Ollama server error');
      
      const data = await response.json();
      this.removeTypingIndicator();
      
      const assistantResponse = data.response || 'No response received.';
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

  getOllamaApiUrl() {
    const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
    // Remove trailing slash if present
    const cleanUrl = baseUrl.replace(/\/$/, '');
    return `${cleanUrl}/api/generate`;
  }

  // Test connection to Ollama server
  async testOllamaConnection() {
    try {
      const baseUrl = this.settings.ollamaUrl || 'http://localhost:11434';
      const cleanUrl = baseUrl.replace(/\/$/, '');
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
    const parts = this.parseContentWithCodeBlocks(content);
    
    parts.forEach((part, index) => {
      if (part.type === 'text' && part.content.trim()) {
        this.addRegularMessage('assistant', part.content);
      } else if (part.type === 'code') {
        this.addCodeBlockMessage(part.content, part.language);
      }
    });
  }

  parseContentWithCodeBlocks(content) {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        const textContent = content.substring(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
      }

      // Add the code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last code block
    if (lastIndex < content.length) {
      const textContent = content.substring(lastIndex).trim();
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    // If no code blocks found, return the entire content as text
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
    this.modelSelector.value = this.settings.model;
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

  saveSettings() {
    this.settings = {
      model: this.modelSelector.value,
      temperature: parseFloat(this.temperatureSlider.value),
      ollamaUrl: this.ollamaUrlInput.value,
      maxTokens: parseInt(this.maxTokensInput.value),
      systemPrompt: this.systemPromptInput.value,
      streamResponses: this.streamResponsesCheckbox.checked,
      theme: this.settings.theme || 'dark'
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
      theme: 'dark'
    };
    
    const saved = localStorage.getItem('chatAppSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
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
