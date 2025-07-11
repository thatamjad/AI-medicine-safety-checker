const axios = require('axios');
const logger = require('../utils/logger');

class PerplexityService {
  constructor() {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    this.model = 'llama-3.1-sonar-large-128k-online'; // Perplexity's flagship model
  }

  async testConnection() {
    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Test connection - respond with "OK"'
          }
        ],
        max_tokens: 10,
        temperature: 0
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      logger.info('Perplexity API connection test successful');
      return true;
    } catch (error) {
      logger.error('Perplexity API connection test failed:', error.message);
      throw new Error('Perplexity API connection failed');
    }
  }

  async generateContent(prompt) {
    try {
      logger.info('Sending request to Perplexity API');
      
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant specializing in medication safety analysis, particularly for women and children. Provide detailed, accurate, and well-structured information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      const content = response.data.choices[0].message.content;
      logger.info('Perplexity API response received successfully');
      return content;
      
    } catch (error) {
      logger.error('Perplexity API request failed:', error.message);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        throw new Error('Invalid Perplexity API key');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Perplexity API rate limit exceeded');
      }
      
      if (error.response?.status === 402) {
        throw new Error('Perplexity API quota exceeded');
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Perplexity API request timed out');
      }
      
      throw new Error(`Perplexity API error: ${error.message}`);
    }
  }

  async generateStructuredContent(prompt) {
    try {
      logger.info('Generating structured content with Perplexity API');
      
      // Add instructions for structured response
      const structuredPrompt = `${prompt}

Please provide your response in a well-structured format with clear sections and subsections. Use markdown formatting where appropriate for better readability.`;

      const content = await this.generateContent(structuredPrompt);
      
      // Perplexity typically returns well-formatted content
      return content;
      
    } catch (error) {
      logger.error('Perplexity structured content generation failed:', error.message);
      throw error;
    }
  }

  // Method to check if service is available
  async isAvailable() {
    try {
      await this.testConnection();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = PerplexityService;
