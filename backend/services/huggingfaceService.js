const axios = require('axios');
const logger = require('../utils/logger');

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HF_TOKEN;
    this.baseURL = 'https://api.huggingface.co/v1/chat/completions';
    // Using Meta-Llama-3.1-8B-Instruct as recommended model for medical content
    this.model = 'meta-llama/Meta-Llama-3.1-8B-Instruct';
    this.provider = 'huggingface';
    
    if (!this.apiKey) {
      logger.warn('HF_TOKEN not found in environment variables');
    }
  }

  async generateStructuredContent(prompt) {
    try {
      logger.info('Sending request to Hugging Face API');
      
      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant providing accurate, evidence-based information about medications. Always structure your responses clearly and include safety warnings when appropriate.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: parseInt(process.env.API_TIMEOUT_MS) || 30000
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        const content = response.data.choices[0].message.content;
        logger.info('Successfully received response from Hugging Face API');
        
        return {
          content: content,
          usage: response.data.usage,
          model: response.data.model,
          provider: this.provider
        };
      } else {
        throw new Error('Invalid response structure from Hugging Face API');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Hugging Face API request timeout after ${process.env.API_TIMEOUT_MS || 30000}ms`);
      }
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 401:
            throw new Error('Invalid Hugging Face API token');
          case 403:
            throw new Error('Hugging Face API access forbidden - check your token permissions');
          case 429:
            throw new Error('Hugging Face API rate limit exceeded');
          case 503:
            throw new Error('Hugging Face API service temporarily unavailable');
          default:
            throw new Error(`Hugging Face API error (${status}): ${message}`);
        }
      }
      
      throw new Error(`Hugging Face API request failed: ${error.message}`);
    }
  }

  async generateText(prompt) {
    try {
      const result = await this.generateStructuredContent(prompt);
      return {
        text: result.content,
        usage: result.usage,
        model: result.model,
        provider: result.provider
      };
    } catch (error) {
      throw error;
    }
  }

  async testConnection() {
    try {
      logger.info('Testing Hugging Face API connection');
      
      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a connection test.'
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.choices) {
        logger.info('Hugging Face API connection successful');
        return true;
      } else {
        throw new Error('Invalid response from Hugging Face API');
      }
    } catch (error) {
      logger.error('Hugging Face API connection test failed:', error.message);
      throw error;
    }
  }

  // Method to switch models if needed
  setModel(modelName) {
    this.model = modelName;
    logger.info(`Hugging Face model changed to: ${modelName}`);
  }

  // Get available models (for reference)
  getRecommendedModels() {
    return [
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'microsoft/phi-4',
      'google/gemma-2-2b-it',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
      'Qwen/Qwen2.5-7B-Instruct-1M',
      'deepseek-ai/DeepSeek-R1'
    ];
  }
}

module.exports = HuggingFaceService;
