import { useRef, useState } from 'react';
import './PromptInput.css';

function PromptInput({ onSend, isLoading }) {
  const textAreaRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleInput = (e) => {
    setMessage(e.target.value);
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      const textArea = textAreaRef.current;
      if (textArea) {
        textArea.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-prompt-i">
      <div className="animated-border">
        <textarea
          ref={textAreaRef}
          className="user-input"
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you today...??"
          rows={1}
          disabled={isLoading}
        />
      </div>

      <div className="button-attribute">
        <button
          className="add-element"
          onClick={() => {
            // Placeholder for file attachment feature
            console.log('Add file clicked');
          }}
          disabled={isLoading}
        >
          +
        </button>
        <button
          className="send"
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
        >
          send
        </button>
      </div>
    </div>
  );
}

export default PromptInput;

