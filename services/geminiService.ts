
import { GoogleGenAI } from "@google/genai";
import { Message, SystemConfig } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FAST_MODEL = 'gemini-2.5-flash';
const THINKING_MODEL = 'gemini-3-pro-preview';

// Regex patterns for routing logic
const EMOTIONAL_PATTERNS = {
  selfDirected: /I feel|I don't know what's wrong|I'm scared|I messed up|I'm embarrassed|I'm stressed|I worry|I feel weird/i,
  socialConflict: /Someone said|Someone blocked|ignored me|ghosted me|hurt someone/i,
  relationship: /crush|date|ex|best friend|drama|love|breakup/i,
  shame: /stupid|annoying|embarrassing|cringe|awkward|loser|pathetic/i,
  selfEsteem: /I hate|I don't feel like myself|I'm not enough/i,
};

const ADDITIONAL_EMOTIONAL_INDICATORS = [
    "bad day",
    "really bad day",
    "tough day",
    "rough day",
    "awful day",
    "terrible day",
    "hard day",
    "i'm not okay",
    "i feel awful",
    "i feel horrible",
    "everything sucks",
    "i'm overwhelmed",
    "i'm stressed",
    "i'm exhausted",
    "i feel like shit"
];

/**
 * Determines which model to use based on tags and text analysis.
 */
const determineModel = (text: string, tags: string[]) => {
  // 1. Tag-based Routing
  const criticalTags = ['safety', 'distress', 'boundary', 'risk', 'drift'];
  const hasCriticalTag = tags.some(t => criticalTags.includes(t));
  const hasHyperboleAndDistress = tags.includes('risk_lang') && tags.includes('distress');

  if (hasCriticalTag || hasHyperboleAndDistress) {
    return { useThinking: true, reason: 'Critical Tag Detected' };
  }

  // 2. Emotional Content Routing
  const isEmotionalRegex = Object.values(EMOTIONAL_PATTERNS).some(regex => regex.test(text));
  const hasEmotionalPhrase = ADDITIONAL_EMOTIONAL_INDICATORS.some(phrase => text.toLowerCase().includes(phrase));

  if (isEmotionalRegex || hasEmotionalPhrase) {
    return { useThinking: true, reason: 'Emotional Content Detected' };
  }

  // 3. Complexity/Length Routing
  const isLong = text.length > 150;
  // Heuristic: 3 or more sentences
  const sentenceCount = (text.match(/[.!?]/g) || []).length;
  if (isLong || sentenceCount > 2) {
    return { useThinking: true, reason: 'High Complexity' };
  }

  return { useThinking: false, reason: 'Standard Request' };
};

/**
 * Generates a suggested response based on chat history and system instructions.
 */
export const generateSuggestedResponse = async (
  history: Message[],
  config: SystemConfig,
  activeTags: string[] = []
): Promise<{ text: string; modelType: 'fast' | 'thinking' }> => {
  try {
    const lastMessage = history[history.length - 1];
    const userText = lastMessage?.role === 'user' ? lastMessage.content : '';
    
    const { useThinking, reason } = determineModel(userText, activeTags);
    
    console.log(`[Routing] Using ${useThinking ? 'Thinking' : 'Fast'} Model. Reason: ${reason}`);

    const modelId = useThinking ? THINKING_MODEL : FAST_MODEL;

    // Filter only approved messages and the pending one for context
    const contents = history.map((msg) => {
      const role = (msg.role === 'user' || msg.role === 'system') ? 'user' : 'model';
      return {
        role: role,
        parts: [{ text: msg.content }],
      };
    });

    const requestConfig: any = {
      systemInstruction: config.systemInstruction,
      temperature: config.temperature,
    };

    // Add Thinking Config if required
    if (useThinking) {
      requestConfig.thinkingConfig = { thinkingBudget: 32768 };
      // DO NOT set maxOutputTokens when using thinkingConfig
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
    console.error("Error generating response:", error);
    return { 
        text: "Error: Could not generate a suggestion. Please check the API key or try again.",
        modelType: 'fast'
    };
  }
};
