# AI Chat Assistant - React.js Application

A modern, responsive AI chatbot application built with React.js, TypeScript, and Tailwind CSS. This application supports both local Ollama models and cloud-based Groq API.

## 🚀 Features

- **Modern React Architecture**: Built with React 18, TypeScript, and modern hooks
- **Real-time Streaming**: Stream responses from AI models in real-time
- **Multiple AI Providers**: Support for both Ollama (local) and Groq (cloud) APIs
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Chat Management**: Create, delete, and manage multiple chat sessions
- **Message History**: Persistent chat history stored locally
- **Code Syntax Highlighting**: Beautiful code blocks with syntax highlighting
- **Emoji Support**: Built-in emoji picker for enhanced messaging
- **Markdown Support**: Full markdown rendering in messages
- **Thinking Process**: Optional display of AI thinking process
- **Customizable Settings**: Adjust temperature, max tokens, system prompts, and more

## 🛠 Technologies Used

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **Lucide React** - Beautiful icons

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- For Ollama: Local Ollama installation
- For Groq: Valid Groq API key

## 🚀 Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /path/to/chatbot/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## ⚙️ Configuration

### Ollama Setup (Local AI)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. In the app settings, set API Provider to "Ollama"
4. Set Ollama URL to `http://localhost:11434` (default)
5. Test the connection

### Groq Setup (Cloud AI)

1. Get an API key from [Groq](https://groq.com)
2. In the app settings, set API Provider to "Groq"
3. Enter your Groq API key
4. Test the connection

## 🎮 Usage

### Basic Chat
1. Start a new chat by clicking "New Chat"
2. Type your message in the input field
3. Press Enter or click Send
4. Watch the AI respond in real-time

### Keyboard Shortcuts
- `Cmd/Ctrl + N` - Create new chat
- `Cmd/Ctrl + K` - Focus message input
- `Enter` - Send message
- `Shift + Enter` - New line in message

### Settings
Access settings via the gear icon in the header:
- **API Provider**: Choose between Ollama or Groq
- **Model Selection**: Choose from available models
- **Temperature**: Control response creativity (0-2)
- **Max Tokens**: Set maximum response length
- **System Prompt**: Customize AI behavior
- **Stream Responses**: Toggle real-time streaming
- **Show Thinking**: Display AI reasoning process

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ChatArea.tsx    # Main chat display area
│   ├── ChatInput.tsx   # Message input component
│   ├── Header.tsx      # App header with controls
│   ├── Message.tsx     # Individual message component
│   ├── Sidebar.tsx     # Chat sessions sidebar
│   └── ...
├── contexts/           # React Context providers
│   └── ChatContext.tsx # Main app state management
├── hooks/              # Custom React hooks
│   ├── useApiChat.ts   # Chat API integration
│   └── useLocalStorage.ts # Local storage management
├── services/           # API services
│   └── api.ts          # Chat API service class
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── utils/              # Utility functions
│   └── index.ts        # Helper functions
├── App.tsx             # Main App component
├── main.tsx            # React entry point
└── index.css           # Global styles
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

The application uses Tailwind CSS for styling with:
- Responsive design patterns
- Dark/light theme support
- Custom CSS components for complex elements
- Smooth animations and transitions

## 🔒 Privacy & Security

- All chat data is stored locally in your browser
- No data is sent to external services except to your configured AI provider
- API keys are stored locally and never transmitted to unauthorized services

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.

### Deployment Options
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Upload `dist/` contents
- **Static hosting**: Upload `dist/` to your web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Verify your API configuration
3. Ensure Ollama is running (for local setup)
4. Check network connectivity (for Groq setup)

---

**Enjoy chatting with your AI assistant!** 🤖✨
