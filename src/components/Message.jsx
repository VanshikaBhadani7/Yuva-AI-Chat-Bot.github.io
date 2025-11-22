import './Message.css';

function Message({ role, content, isLoading, isStreaming }) {
  const isUser = role === 'user';

  if (isLoading && !content) {
    return (
      <div className={`message ${isUser ? 'user' : 'assistant'}`}>
        <div className="message-content">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : <span className="avatar-logo">Y</span>}
      </div>
      <div className="message-content">
        <div className="message-text">
          {content ? (
            content.split('\n').map((line, index, array) => (
              <p key={index}>
                {line || (index < array.length - 1 ? '\u00A0' : '')}
                {isStreaming && index === array.length - 1 && (
                  <span className="streaming-cursor">▊</span>
                )}
              </p>
            ))
          ) : (
            <p>Thinking...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;

