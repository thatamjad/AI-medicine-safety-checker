const OpenAI = require('openai');
const logger = require('../utils/logger');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async testConnection() {
    try {
      // Simple test request
      await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      });
      
      logger.info('OpenAI API connection test successful');
      return true;
    } catch (error) {
      logger.error('OpenAI API connection test failed:', error.message);
      throw new Error('OpenAI API connection failed');
    }
  }

  async generateContent(prompt) {
    try {
      logger.info('Sending request to OpenAI API');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      const text = response.choices[0].message.content;
      
      logger.info('OpenAI API response received successfully');
      return text;
      
    } catch (error) {
      logger.error('OpenAI API request failed:', error.message);
      
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key configuration');
      }
      
      if (error.message.includes('quota') || error.message.includes('exceeded')) {
        throw new Error('OpenAI API quota exceeded');
      }
      
      if (error.message.includes('rate limit')) {
        throw new Error('OpenAI API rate limit exceeded');
      }
      
      throw new Error(`OpenAI API error: ${error.message}`);
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
          logger.warn('Failed to parse JSON response from OpenAI, returning as text');
          return { content: response };
        }
      }
      
      return { content: response };
      
    } catch (error) {
      if (retryCount < maxRetries) {
        logger.warn(`Retrying OpenAI request (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.generateStructuredContent(prompt, retryCount + 1);
      }
      
      throw error;
    }
  }
}

module.exports = new OpenAIService();
