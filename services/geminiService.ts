
import { GoogleGenAI } from "@google/genai";
import { Message, SystemConfig } from "../types";

// Initialize the client
// Note: We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a suggested response based on chat history and system instructions.
 */
export const generateSuggestedResponse = async (
  history: Message[],
  config: SystemConfig
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';

    // Filter only approved messages and the pending one for context
    const contents = history.map((msg) => {
      // Map 'system' messages to 'user' role so the model sees them as input instructions/context
      const role = (msg.role === 'user' || msg.role === 'system') ? 'user' : 'model';
      return {
        role: role,
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating response:", error);
    return "Error: Could not generate a suggestion. Please check the API key or try again.";
  }
};
