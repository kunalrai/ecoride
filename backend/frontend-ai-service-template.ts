/**
 * EcoRide AI Service - Frontend Integration Template
 *
 * Copy this file to your frontend project:
 * frontend/src/services/aiService.ts
 *
 * Update API_BASE_URL with your backend URL
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from your auth system
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// Configure axios instance
const aiApi = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
aiApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
const handleError = (error: AxiosError): string => {
  if (error.response?.data) {
    return (error.response.data as any).error || 'An error occurred';
  }
  return 'Network error. Please try again.';
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const aiService = {
  /**
   * Generate a professional ride description
   *
   * @param origin - Starting location
   * @param destination - End location
   * @param date - Ride date
   * @returns AI-generated description
   */
  generateRideDescription: async (
    origin: string,
    destination: string,
    date: string
  ): Promise<string> => {
    try {
      const { data } = await aiApi.post('/generate-ride-description', {
        origin,
        destination,
        date,
      });
      return data.description;
    } catch (error) {
      console.error('Error generating ride description:', error);
      return 'Comfortable and safe ride.';
    }
  },

  /**
   * Get traffic and route insights
   *
   * @param origin - Starting location
   * @param destination - End location
   * @returns Route tips and insights
   */
  getRouteInsights: async (
    origin: string,
    destination: string
  ): Promise<string> => {
    try {
      const { data } = await aiApi.post('/route-insights', {
        origin,
        destination,
      });
      return data.insights;
    } catch (error) {
      console.error('Error getting route insights:', error);
      return 'Unable to fetch route insights at this time.';
    }
  },

  /**
   * Chat with AI assistant
   *
   * @param message - User message
   * @param history - Previous conversation history
   * @returns AI response
   */
  askAssistant: async (
    message: string,
    history: ChatMessage[] = []
  ): Promise<string> => {
    try {
      const { data } = await aiApi.post('/assistant', {
        message,
        history,
      });
      return data.response;
    } catch (error) {
      console.error('Error asking AI assistant:', error);
      return "I'm having trouble connecting right now. Please try again.";
    }
  },

  /**
   * Get meeting point suggestions
   *
   * @param origin - Starting location
   * @param destination - End location
   * @returns Array of meeting point suggestions
   */
  suggestMeetingPoints: async (
    origin: string,
    destination: string
  ): Promise<string[]> => {
    try {
      const { data } = await aiApi.post('/suggest-meeting-points', {
        origin,
        destination,
      });
      return data.meetingPoints;
    } catch (error) {
      console.error('Error suggesting meeting points:', error);
      return [];
    }
  },
};

// Export for backward compatibility
export default aiService;

// ============================================================================
// REACT HOOKS (Optional - for easier integration)
// ============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook for generating ride descriptions
 */
export const useRideDescription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (origin: string, destination: string, date: string) => {
    setLoading(true);
    setError(null);
    try {
      const description = await aiService.generateRideDescription(origin, destination, date);
      return description;
    } catch (err) {
      setError('Failed to generate description');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
};

/**
 * Hook for AI chat assistant
 */
export const useAIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: message }],
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await aiService.askAssistant(message, messages);

      const aiMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response }],
      };

      setMessages((prev) => [...prev, aiMessage]);
      return response;
    } catch (err) {
      setError('Failed to get response');
      return '';
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sendMessage, clearHistory, loading, error };
};

/**
 * Hook for route insights
 */
export const useRouteInsights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInsights = useCallback(async (origin: string, destination: string) => {
    setLoading(true);
    setError(null);
    try {
      const insights = await aiService.getRouteInsights(origin, destination);
      return insights;
    } catch (err) {
      setError('Failed to get insights');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return { getInsights, loading, error };
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Generate Ride Description
import { aiService } from './services/aiService';

const CreateRide = () => {
  const [description, setDescription] = useState('');

  const handleGenerate = async () => {
    const desc = await aiService.generateRideDescription(
      'Koramangala',
      'Electronic City',
      '2024-12-05'
    );
    setDescription(desc);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Description</button>
      <p>{description}</p>
    </div>
  );
};

// Example 2: Using Hook
import { useRideDescription } from './services/aiService';

const CreateRideWithHook = () => {
  const { generate, loading, error } = useRideDescription();
  const [description, setDescription] = useState('');

  const handleGenerate = async () => {
    const desc = await generate('Koramangala', 'Electronic City', '2024-12-05');
    setDescription(desc);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Description'}
      </button>
      {error && <p className="error">{error}</p>}
      <p>{description}</p>
    </div>
  );
};

// Example 3: AI Chat Assistant
import { useAIAssistant } from './services/aiService';

const ChatBot = () => {
  const { messages, sendMessage, loading } = useAIAssistant();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role}>
            {msg.parts[0].text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={loading}>
        Send
      </button>
    </div>
  );
};

// Example 4: Route Insights
import { useRouteInsights } from './services/aiService';

const RouteInfo = ({ origin, destination }) => {
  const { getInsights, loading } = useRouteInsights();
  const [insights, setInsights] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      const result = await getInsights(origin, destination);
      setInsights(result);
    };
    fetchInsights();
  }, [origin, destination]);

  if (loading) return <div>Loading insights...</div>;

  return (
    <div className="insights">
      <h3>Route Tips</h3>
      <p>{insights}</p>
    </div>
  );
};

*/
