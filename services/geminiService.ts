import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRideDescription = async (origin: string, destination: string, date: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Comfortable and safe ride.";

  try {
    const prompt = `Write a short, professional yet friendly carpool description for an office commute in India from ${origin} to ${destination} on ${date}. 
    Mention things like "On time", "AC ride", or "Taking flyover" if relevant. Keep it under 25 words. No markdown.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A comfortable ride to your destination.";
  }
};

export const getRouteInsights = async (origin: string, destination: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Unable to fetch insights.";

  try {
    const prompt = `Provide 3 short, helpful traffic or route tips for a car drive from ${origin} to ${destination} in India. 
    Mention potential traffic bottlenecks (like Silk Board in Bangalore if applicable) or best times to leave. 
    Format as a simple bulleted list with emojis.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "No insights available at the moment.";
  }
};

export const askAiAssistant = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    const ai = getAiClient();
    if (!ai) return "AI unavailable.";

    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are EcoRide Bot, a helpful assistant for an Indian carpooling app. Help users with safety tips, route info, and carpool etiquette in India (like splitting tolls, being punctual). Keep answers concise."
            }
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        console.error("Gemini Chat Error", error);
        return "I'm having trouble connecting right now. Please try again.";
    }
}