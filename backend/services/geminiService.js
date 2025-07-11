const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  }

  async testConnection() {
    try {
      const result = await this.model.generateContent('Test connection');
      const response = await result.response;
      logger.info('Gemini API connection test successful');
      return true;
    } catch (error) {
      logger.error('Gemini API connection test failed:', error.message);
      throw new Error('Gemini API connection failed');
    }
  }

  async generateContent(prompt) {
    try {
      logger.info('Sending request to Gemini API');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Gemini API response received successfully');
      return text;
      
    } catch (error) {
      logger.error('Gemini API request failed:', error.message);
      
      // Handle specific error types
      if (error.message.includes('API_KEY')) {
        throw new Error('Invalid API key configuration');
      }
      
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded');
      }
      
      if (error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded');
      }
      
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async generateStructuredContent(prompt, retryCount = 0) {
    const maxRetries = 2;
    
    try {
      const response = await this.generateContent(prompt);
      
      // Try to parse as JSON if it looks like structured data
      if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
        try {
          return JSON.parse(response);
        } catch (parseError) {
          logger.warn('Failed to parse JSON response, returning as text');
          return { content: response };
        }
      }
      
      return { content: response };
      
    } catch (error) {
      if (retryCount < maxRetries) {
        logger.warn(`Retrying Gemini request (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.generateStructuredContent(prompt, retryCount + 1);
      }
      
      throw error;
    }
  }
}

module.exports = new GeminiService();
