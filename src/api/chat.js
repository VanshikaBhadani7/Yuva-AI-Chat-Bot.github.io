const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send a message to the AI chat API with streaming response
 * @param {string} message - The user's message
 * @param {string} conversationId - The conversation ID (optional)
 * @param {Function} onChunk - Callback function called with each chunk of the response
 * @returns {Promise<Object>} The final response with conversationId
 */
export async function sendMessage(message, conversationId = null, onChunk = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }),
    });

    // Check if response is OK - but for SSE, we need to handle it differently
    if (!response.ok) {
      // Try to read error message
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get response', message: response.statusText };
      }
      throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
    }

    // Check if it's a streaming response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/event-stream')) {
      // Fallback to regular JSON response
      const data = await response.json();
      return {
        response: data.response || '',
        conversationId: data.conversationId || conversationId,
      };
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    let finalConversationId = conversationId;
    let hasError = false;
    let errorMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (hasError) {
          throw new Error(errorMessage || 'An error occurred while streaming');
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        // Skip empty lines and comments
        if (!line.trim() || line.startsWith(':')) {
          continue;
        }

        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            const data = JSON.parse(jsonStr);
            
            if (data.error) {
              hasError = true;
              errorMessage = data.message || 'An error occurred';
              throw new Error(errorMessage);
            }

            if (data.content !== undefined) {
              fullResponse += data.content;
              // Call the callback with each chunk
              if (onChunk) {
                onChunk(data.content);
              }
            }

            if (data.done) {
              finalConversationId = data.conversationId || finalConversationId;
              return {
                response: fullResponse,
                conversationId: finalConversationId,
              };
            }
          } catch (e) {
            // If it's our error, re-throw it
            if (hasError) {
              throw e;
            }
            // Otherwise, skip invalid JSON (might be partial data)
            if (e instanceof SyntaxError) {
              console.warn('Skipping invalid SSE JSON:', e.message);
            } else {
              throw e;
            }
          }
        }
      }
    }

    // If we get here, return what we have
    return {
      response: fullResponse,
      conversationId: finalConversationId,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Create a new conversation
 * @returns {Promise<string>} The new conversation ID
 */
export async function createNewConversation() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create new conversation');
    }

    const data = await response.json();
    return data.conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Clear conversation history
 * @param {string} conversationId - The conversation ID to clear
 */
export async function clearConversation(conversationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear conversation');
    }
  } catch (error) {
    console.error('Error clearing conversation:', error);
    throw error;
  }
}
