const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ChatRequest {
  username: string;
  message: string;
}

export interface ChatResponse {
  _id?: string;
  username: string;
  chats: {
    message: string;
    reply: string;
    createdAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const sendChatMessage = async (request: ChatRequest): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    const data = await response.json() as ChatResponse;
    
    // Extract the latest reply from the chat array
    if (data.chats && data.chats.length > 0) {
      const latestReply = data.chats[data.chats.length - 1]?.reply;
      if (latestReply) {
        return latestReply;
      }
    }
    
    throw new Error('No response received from chat service.');
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to send message. Please try again.');
  }
};

export const getChatHistory = async (username: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/chat/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No chat history found, return empty chats
        return {
          username,
          chats: [],
        };
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Server error: ${response.status}`);
    }

    const data = await response.json() as ChatResponse;
    return data;
  } catch (error) {
    console.error('Get chat history error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to fetch chat history.');
  }
};
