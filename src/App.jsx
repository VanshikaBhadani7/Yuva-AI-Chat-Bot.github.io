import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import { sendMessage, createNewConversation } from './api/chat';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState(null);

  // Create a new conversation when the app loads
  useEffect(() => {
    const initConversation = async () => {
      try {
        const id = await createNewConversation();
        setConversationId(id);
        console.log('Conversation initialized:', id);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // Fallback: create a local conversation ID
        const fallbackId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setConversationId(fallbackId);
        console.log('Using fallback conversation ID:', fallbackId);
      }
    };
    initConversation();
  }, []);

  const handleSend = async (message) => {
    if (!message.trim() || isLoading) return;

    console.log('Sending message:', message);
    console.log('Conversation ID:', conversationId);

    // Add user message to UI immediately
    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Initialize streaming message
    setStreamingMessage({ role: 'assistant', content: '' });

    try {
      // Send message to API with streaming
      const response = await sendMessage(message, conversationId, (chunk) => {
        console.log('Received chunk:', chunk);
        // Update streaming message as chunks arrive
        setStreamingMessage((prev) => ({
          role: 'assistant',
          content: (prev?.content || '') + chunk,
        }));
      });

      console.log('Response received:', response);

      // Update conversation ID if needed
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
      }

      // Finalize the message - only if we have content
      if (response.response) {
        const aiMessage = { role: 'assistant', content: response.response };
        setMessages((prev) => [...prev, aiMessage]);
      }
      setStreamingMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create a more user-friendly error message
      let errorContent = '';
      if (error.message && error.message.includes('429')) {
        errorContent = `⚠️ **OpenAI API Quota Exceeded**\n\nYou've exceeded your current OpenAI API quota. Please:\n\n1. Check your OpenAI billing at: https://platform.openai.com/account/billing\n2. Add payment method or increase your quota\n3. Wait for your quota to reset (if you have a rate limit)\n\nFor more info: https://platform.openai.com/docs/guides/error-codes/api-errors`;
      } else if (error.message && error.message.includes('401')) {
        errorContent = `🔑 **API Key Issue**\n\nYour OpenAI API key is invalid or missing. Please:\n\n1. Check your API key in the backend/.env file\n2. Get a new key from: https://platform.openai.com/api-keys\n3. Make sure your API key is active and has credits`;
      } else if (error.message && error.message.includes('network')) {
        errorContent = `🌐 **Connection Error**\n\nCould not connect to the backend server. Please:\n\n1. Make sure the backend server is running (npm start in backend folder)\n2. Check that it's running on port 5000\n3. Check your network connection`;
      } else {
        errorContent = `❌ **Error**\n\n${error.message || 'An unknown error occurred'}\n\nPlease check the browser console (F12) for more details.`;
      }
      
      const errorMessage = {
        role: 'assistant',
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setStreamingMessage(null);
    createNewConversation()
      .then((id) => setConversationId(id))
      .catch((error) => console.error('Failed to create new conversation:', error));
  };

  return (
    <>
      <div className="nav">
        <h1 className="h1">Yuva</h1>
        <div className="nav-actions">
          <button className="share" onClick={handleClearChat}>
            New Chat
          </button>
        </div>
      </div>

      <div className="main-container">
        <ChatWindow 
          messages={messages} 
          isLoading={isLoading} 
          streamingMessage={streamingMessage}
          onSuggestionClick={handleSend}
        />
        <PromptInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </>
  );
}

export default App;
