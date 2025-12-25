
import { GoogleGenAI } from "@google/genai";
import { Message, SystemConfig } from "../types";

// Initialize the client following standard GenAI patterns
// Note: In a production Vertex AI environment on GCP, authentication is typically handled via service accounts,
// but we utilize the provided API_KEY bridge for this implementation.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FAST_MODEL = 'gemini-2.0-flash';
const THINKING_MODEL = 'gemini-3-pro-preview';

// Patterns for routing to complex reasoning models (Thinking)
const EMOTIONAL_PATTERNS = {
  selfDirected: /I feel|I don't know what's wrong|I'm scared|I messed up|I'm embarrassed|I'm stressed|I worry|I feel weird/i,
  socialConflict: /Someone said|Someone blocked|ignored me|ghosted me|hurt someone/i,
  relationship: /crush|date|ex|best friend|drama|love|breakup/i,
  shame: /stupid|annoying|embarrassing|cringe|awkward|loser|pathetic/i,
  selfEsteem: /I hate|I don't feel like myself|I'm not enough/i,
};

const EMOTIONAL_INDICATORS = [
    "bad day", "really bad day", "tough day", "rough day", "awful day", 
    "terrible day", "hard day", "i'm not okay", "i feel awful", "everything sucks"
];

/**
 * Determines which model to use based on message content and operator tags.
 */
const determineModel = (text: string, tags: string[]) => {
  // 1. Critical Safety/Risk Routing
  const criticalTags = ['safety', 'distress', 'boundary', 'risk'];
  if (tags.some(t => criticalTags.includes(t))) {
    return { useThinking: true, reason: 'High-Risk Context' };
  }

  // 2. Emotional Depth Analysis
  const isEmotional = Object.values(EMOTIONAL_PATTERNS).some(regex => regex.test(text)) ||
                    EMOTIONAL_INDICATORS.some(phrase => text.toLowerCase().includes(phrase));
  if (isEmotional) {
    return { useThinking: true, reason: 'Emotional Nuance Required' };
  }

  // 3. Length/Complexity
  if (text.length > 180 || (text.match(/[.!?]/g) || []).length > 2) {
    return { useThinking: true, reason: 'High Complexity' };
  }

  return { useThinking: false, reason: 'Standard Interaction' };
};

/**
 * Generates a suggested response using Vertex-grade models.
 */
export const generateSuggestedResponse = async (
  history: Message[],
  config: SystemConfig,
  activeTags: string[] = []
): Promise<{ text: string; modelType: 'fast' | 'thinking' }> => {
  try {
    const lastUserMessage = [...history].reverse().find(m => m.role === 'user');
    const userText = lastUserMessage?.content || '';
    
    const { useThinking, reason } = determineModel(userText, activeTags);
    const modelId = useThinking ? THINKING_MODEL : FAST_MODEL;

    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const requestConfig: any = {
      systemInstruction: config.systemInstruction,
      temperature: config.temperature,
    };

    if (useThinking) {
      // Use max thinking budget for complex coaching tasks
      requestConfig.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: requestConfig,
    });

    return { 
        text: response.text || "", 
        modelType: useThinking ? 'thinking' : 'fast' 
    };
  } catch (error) {
    console.error("[GeminiService] Suggestion generation failed:", error);
    return { 
        text: "I'm having a quick moment to think. Could you try that again?",
        modelType: 'fast'
    };
  }
};
