import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY is not set. AI features will be disabled.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRideDescription = async (
  origin: string,
  destination: string,
  date: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return 'Comfortable and safe ride.';

  try {
    const prompt = `Write a short, professional yet friendly carpool description for an office commute in India from ${origin} to ${destination} on ${date}.
    Mention things like "On time", "AC ride", or "Taking flyover" if relevant. Keep it under 25 words. No markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    logger.info(`Generated ride description for ${origin} to ${destination}`);
    return response.text.trim();
  } catch (error) {
    logger.error('Gemini API Error in generateRideDescription:', error);
    return 'A comfortable ride to your destination.';
  }
};

export const getRouteInsights = async (
  origin: string,
  destination: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return 'Unable to fetch insights.';

  try {
    const prompt = `Provide 3 short, helpful traffic or route tips for a car drive from ${origin} to ${destination} in India.
    Mention potential traffic bottlenecks (like Silk Board in Bangalore if applicable) or best times to leave.
    Format as a simple bulleted list with emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    logger.info(`Generated route insights for ${origin} to ${destination}`);
    return response.text;
  } catch (error) {
    logger.error('Gemini API Error in getRouteInsights:', error);
    return 'No insights available at the moment.';
  }
};

export const askAiAssistant = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return 'AI assistant is currently unavailable.';

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction:
          "You are EcoRide Bot, a helpful assistant for an Indian carpooling app. Help users with safety tips, route info, and carpool etiquette in India (like splitting tolls, being punctual). Keep answers concise.",
      },
    });

    const result = await chat.sendMessage({ message: newMessage });

    logger.info('AI assistant responded to user query');
    return result.text;
  } catch (error) {
    logger.error('Gemini Chat Error in askAiAssistant:', error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

export const suggestMeetingPoints = async (
  origin: string,
  destination: string
): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `Suggest 3 popular and easily accessible meeting points (like metro stations, malls, or landmarks)
    between ${origin} and ${destination} in India. Return only the names as a comma-separated list without any explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const points = response.text
      .trim()
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    logger.info(`Generated meeting points for ${origin} to ${destination}`);
    return points.slice(0, 3);
  } catch (error) {
    logger.error('Gemini API Error in suggestMeetingPoints:', error);
    return [];
  }
};
