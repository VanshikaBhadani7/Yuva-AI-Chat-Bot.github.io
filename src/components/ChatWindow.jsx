import { useEffect, useRef } from 'react';
import Message from './Message';
import './ChatWindow.css';

function ChatWindow({ messages, isLoading, streamingMessage, onSuggestionClick }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="chat-window empty">
        <div className="welcome-message">
          <div className="welcome-icon">
            <div className="yuva-logo">
              <span className="yuva-letter">Y</span>
            </div>
          </div>
          <h1 className="welcome">Hello! I'm Yuva</h1>
          <p>Your AI assistant ready to help you with anything!</p>
          <div className="welcome-suggestions">
            <div   
              className="suggestion-chip" 
              onClick={() => onSuggestionClick && onSuggestionClick("Hello! What can you help me with?")}
            >
              👋 Ask me anything
            </div>
            <div 
              className="suggestion-chip"
              onClick={() => onSuggestionClick && onSuggestionClick("Help me write code")}
            >
              💻 Get help with coding
            </div>
            <div 
              className="suggestion-chip"
              onClick={() => onSuggestionClick && onSuggestionClick("Write a creative story")}
            >
              ✍️ Write creative content
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message, index) => (
          <Message
            key={index}
            role={message.role}
            content={message.content}
            isStreaming={false}
          />
        ))}
        {streamingMessage && (
          <Message
            role={streamingMessage.role}
            content={streamingMessage.content}
            isStreaming={true}
          />
        )}
        {isLoading && !streamingMessage && (
          <Message
            role="assistant"
            content=""
            isLoading={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;

