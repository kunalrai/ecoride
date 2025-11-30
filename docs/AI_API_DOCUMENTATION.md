# AI Features API Documentation

## Overview

EcoRide uses Google Gemini AI to provide intelligent features like ride descriptions, route insights, meeting point suggestions, and an AI assistant. The Gemini API key is securely stored on the backend to prevent exposure.

## Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment

Add to your `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

## API Endpoints

All endpoints require authentication via JWT token.

### 1. Generate Ride Description

**Endpoint:** `POST /api/ai/generate-ride-description`

Generates a professional and friendly carpool ride description.

**Request:**
```json
{
  "origin": "Koramangala, Bangalore",
  "destination": "Electronic City, Bangalore",
  "date": "2024-12-05"
}
```

**Response:**
```json
{
  "description": "Daily office commute via Hosur Road. AC ride, on-time departure at 8:30 AM. Taking Silk Board flyover to avoid traffic."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/ai/generate-ride-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Koramangala",
    "destination": "Electronic City",
    "date": "2024-12-05"
  }'
```

### 2. Get Route Insights

**Endpoint:** `POST /api/ai/route-insights`

Provides traffic tips and route suggestions for a journey.

**Request:**
```json
{
  "origin": "Indiranagar, Bangalore",
  "destination": "Whitefield, Bangalore"
}
```

**Response:**
```json
{
  "insights": "🚦 Avoid Outer Ring Road during peak hours (8-10 AM, 6-8 PM)\n🛣️ Old Airport Road is faster in evenings\n⏰ Best time to leave: Before 8 AM or after 10 AM"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/ai/route-insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Indiranagar",
    "destination": "Whitefield"
  }'
```

### 3. Ask AI Assistant

**Endpoint:** `POST /api/ai/assistant`

Chat with EcoRide AI assistant for carpooling tips, safety advice, and general help.

**Request:**
```json
{
  "message": "How should I split toll charges?",
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Hello" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Hi! How can I help you with carpooling today?" }]
    }
  ]
}
```

**Response:**
```json
{
  "response": "In Indian carpools, it's common to split toll charges equally among all passengers. For example, if there are 3 passengers and the toll is ₹60, each person pays ₹20. Some drivers include it in the ride price upfront. Always discuss this before the ride starts to avoid confusion."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/ai/assistant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are safety tips for carpooling?",
    "history": []
  }'
```

### 4. Suggest Meeting Points

**Endpoint:** `POST /api/ai/suggest-meeting-points`

Suggests convenient meeting points between origin and destination.

**Request:**
```json
{
  "origin": "HSR Layout, Bangalore",
  "destination": "Marathahalli, Bangalore"
}
```

**Response:**
```json
{
  "meetingPoints": [
    "Silk Board Junction",
    "BTM Layout Metro Station",
    "Forum Mall, Koramangala"
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/ai/suggest-meeting-points \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "HSR Layout",
    "destination": "Marathahalli"
  }'
```

## Frontend Integration

### React Example

```tsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get token from your auth system
const token = localStorage.getItem('authToken');

// 1. Generate Ride Description
const generateDescription = async () => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/ai/generate-ride-description`,
      {
        origin: 'Koramangala',
        destination: 'Electronic City',
        date: '2024-12-05'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Description:', data.description);
  } catch (error) {
    console.error('Error:', error);
  }
};

// 2. Get Route Insights
const getInsights = async () => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/ai/route-insights`,
      {
        origin: 'Indiranagar',
        destination: 'Whitefield'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Insights:', data.insights);
  } catch (error) {
    console.error('Error:', error);
  }
};

// 3. Chat with AI Assistant
const chatWithAssistant = async (message: string, history: any[]) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/ai/assistant`,
      {
        message,
        history
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('AI Response:', data.response);
    return data.response;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, I encountered an error.';
  }
};

// 4. Get Meeting Point Suggestions
const getMeetingPoints = async () => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/ai/suggest-meeting-points`,
      {
        origin: 'HSR Layout',
        destination: 'Marathahalli'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Meeting Points:', data.meetingPoints);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Chat Component Example

```tsx
import { useState } from 'react';
import axios from 'axios';

function AIChatAssistant() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/ai/assistant',
        {
          message: input,
          history: messages
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const aiMessage = { role: 'model', parts: [{ text: data.response }] };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
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
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

## Use Cases

### 1. Create Ride Page
- Auto-generate ride description when user enters route
- Show route insights to help driver plan journey
- Suggest meeting points for passenger pickup

### 2. Search Results
- Display AI-generated insights for each route
- Help passengers choose best rides

### 3. Help & Support
- AI assistant for common questions
- Safety tips and carpool etiquette
- Route and traffic advice

### 4. Profile Enhancement
- Generate professional bio for drivers
- Suggest improvements to profile

## Security

### Why Backend-Only?

The Gemini API key is stored **only on the backend** for security:

1. **Prevent Exposure**: API keys in frontend can be extracted from browser
2. **Rate Limiting**: Backend can control API usage
3. **Cost Control**: Prevent abuse by malicious users
4. **Monitoring**: Track and log all AI requests
5. **Caching**: Cache common requests to reduce API calls

### Best Practices

1. Never expose `GEMINI_API_KEY` in frontend code
2. Always authenticate requests with JWT
3. Implement rate limiting for AI endpoints
4. Cache frequent requests (e.g., route insights)
5. Set reasonable timeouts for AI requests
6. Log all AI interactions for monitoring

## Rate Limiting

AI endpoints are subject to the same rate limiting as other API endpoints:
- 100 requests per 15 minutes per IP address

Additional AI-specific limits can be added:
```typescript
// In aiRoutes.ts
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Lower limit for AI endpoints
  message: 'Too many AI requests, please try again later.',
});

router.use(aiLimiter);
```

## Caching

To reduce API costs, implement caching for common requests:

```typescript
// Simple in-memory cache
const cache = new Map();

const getCachedOrGenerate = async (key: string, generator: () => Promise<string>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await generator();
  cache.set(key, result);

  // Expire after 1 hour
  setTimeout(() => cache.delete(key), 60 * 60 * 1000);

  return result;
};
```

## Error Handling

All AI endpoints return fallback responses if Gemini API is unavailable:

| Endpoint | Fallback Response |
|----------|------------------|
| generate-ride-description | "Comfortable and safe ride." |
| route-insights | "Unable to fetch insights." |
| assistant | "AI assistant is currently unavailable." |
| suggest-meeting-points | Empty array `[]` |

## Cost Optimization

1. **Cache Common Routes**: Store insights for popular routes
2. **Batch Requests**: Generate multiple descriptions in one call
3. **Use Shorter Prompts**: Keep prompts concise
4. **Set Max Tokens**: Limit response length
5. **Monitor Usage**: Track API calls via Google Cloud Console

## Gemini AI Models

Currently using: **gemini-2.5-flash**

- Fast responses (< 2 seconds)
- Cost-effective
- Good quality for short-form content
- Suitable for chat and descriptions

Alternative models:
- `gemini-pro` - Higher quality, slower, more expensive
- `gemini-ultra` - Best quality, premium pricing

## Testing

### Test Without API Key

If `GEMINI_API_KEY` is not set, all endpoints return fallback responses. This allows development without API costs.

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Test AI description (requires auth token)
curl -X POST http://localhost:5000/api/ai/generate-ride-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"origin":"Bangalore","destination":"Mysore","date":"2024-12-05"}'
```

## Monitoring

All AI requests are logged via Winston:

```
INFO: Generated ride description for Bangalore to Mysore
INFO: Generated route insights for HSR Layout to Marathahalli
INFO: AI assistant responded to user query
```

Check logs:
```bash
tail -f logs/combined.log | grep "Gemini"
```

## Support

- **Gemini Docs**: https://ai.google.dev/docs
- **API Keys**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Rate Limits**: https://ai.google.dev/docs/rate_limits

---

**Status**: ✅ Production Ready
**Security**: ✅ API Key Protected
**Version**: 1.0.0
