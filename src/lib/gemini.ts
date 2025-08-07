import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Get the Gemini 2.5 Flash model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
};

// Alternative models available
export const getGeminiProModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
};

// Helper function to generate content with Gemini
export async function generateWithGemini(prompt: string, model?: string): Promise<string> {
  try {
    const geminiModel = model === 'pro' ? getGeminiProModel() : 
                      model === 'vision' ? getGeminiVisionModel() : 
                      getGeminiModel();
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}

// Helper function for streaming responses
export async function streamWithGemini(prompt: string, model?: string) {
  try {
    const geminiModel = model === 'pro' ? getGeminiProModel() : 
                      model === 'vision' ? getGeminiVisionModel() : 
                      getGeminiModel();
    
    const result = await geminiModel.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Error streaming content with Gemini:', error);
    throw error;
  }
}

// Helper function for chat conversations
export async function startGeminiChat(history: Array<{role: 'user' | 'model', parts: Array<{text: string}>}> = []) {
  try {
    const model = getGeminiModel();
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    return chat;
  } catch (error) {
    console.error('Error starting Gemini chat:', error);
    throw error;
  }
}

const geminiUtils = {
  generateWithGemini,
  streamWithGemini,
  startGeminiChat,
  getGeminiModel,
  getGeminiProModel,
  getGeminiVisionModel,
};

export default geminiUtils;
