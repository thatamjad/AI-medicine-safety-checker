const geminiService = require('./geminiService');
const huggingfaceService = require('./huggingfaceService');
const PerplexityService = require('./perplexityService');
const logger = require('../utils/logger');

class AIServiceFactory {
  constructor() {
    this.services = {
      perplexity: new PerplexityService(),
      huggingface: new huggingfaceService(),
      gemini: geminiService
    };
    
    // Gemini timeout of 25 seconds, then fallback to Perplexity
    this.geminiTimeout = 25000; // 25 seconds
    this.defaultTimeout = parseInt(process.env.API_TIMEOUT_MS || '30000', 10);
    
    // Service order for fallback (gemini primary -> perplexity fallback -> huggingface)
    this.serviceOrder = ['gemini', 'perplexity', 'huggingface'];
    
    // Debug flag to help with testing
    this.debugMode = process.env.NODE_ENV === 'development';
    
    logger.info(`AI Service Factory initialized with Gemini primary (${this.geminiTimeout}ms timeout) -> Perplexity fallback`);
    
    if (this.debugMode) {
      logger.info(`AI Service Factory running in debug mode`);
    }
  }

  /**
   * Creates a promise that rejects after the specified timeout
   */
  createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
  }

  /**
   * Makes a request with timeout and fallback
   */
  async requestWithFallback(operation, ...args) {
    let lastError = null;
    let serviceUsed = null;
    
    for (const serviceName of this.serviceOrder) {
      const service = this.services[serviceName];
      
      // Set timeout based on service (25s for Gemini, default for others)
      const timeoutMs = serviceName === 'gemini' ? this.geminiTimeout : this.defaultTimeout;
      
      try {
        logger.info(`Attempting request with ${serviceName} service (timeout: ${timeoutMs}ms)`);
        
        // In debug mode, use shorter prompts to improve response likelihood
        if (this.debugMode && operation === 'generateStructuredContent' && args[0] && args[0].length > 1000) {
          logger.info('Debug mode: Truncating long prompt for testing');
          const shortenedPrompt = args[0].substring(0, 1000) + "\n\n[Prompt truncated for testing]";
          args[0] = shortenedPrompt;
        }
        
        // Create a promise that resolves when the API responds or rejects after timeout
        const result = await Promise.race([
          service[operation](...args),
          this.createTimeoutPromise(timeoutMs)
        ]);
        
        logger.info(`Successfully got response from ${serviceName} service`);
        serviceUsed = serviceName;
        return { result, serviceUsed };
        
      } catch (error) {
        lastError = error;
        const isTimeout = error.message === 'Operation timed out';
        const isOverloaded = error.message && error.message.includes('overloaded');
        const isQuotaExceeded = error.message && error.message.includes('quota');
        
        if (isTimeout) {
          logger.warn(`${serviceName} service timed out after ${timeoutMs}ms, trying next service`);
        } else if (isOverloaded) {
          logger.warn(`${serviceName} service is overloaded, trying next service`);
        } else if (isQuotaExceeded) {
          logger.warn(`${serviceName} service quota exceeded, trying next service`);
        } else {
          logger.error(`${serviceName} service error:`, error.message);
        }
        
        // Continue to the next service in the loop
      }
    }
    
    // If we get here, all services failed
    logger.error('All AI services failed');
    
    // In debug mode, return a detailed mock response if all services fail
    if (this.debugMode && operation === 'generateStructuredContent') {
      logger.warn('Debug mode: Returning enhanced mock response since all services failed');
      
      // Extract medicine name from prompt for better message
      const promptText = args[0] || '';
      const medicineName = promptText.match(/medication["\s]*([a-zA-Z0-9\s]+)["\s]/i)?.[1]?.trim() || 'this medication';
      
      // Use enhanced mock analysis for better fallback responses
      const enhancedAnalysis = this.createEnhancedMockAnalysis(medicineName);
      
      return {
        result: enhancedAnalysis,  // Return the object directly
        serviceUsed: 'enhanced_mock_service'
      };
    }
    
    throw lastError || new Error('All AI services failed');
  }
  
  /**
   * Create enhanced mock analysis for common medications
   */
  createEnhancedMockAnalysis(medicineName) {
    const name = medicineName.toLowerCase();
    
    // Common medication database for fallback
    const commonMeds = {
      'paracetamol': {
        overview: 'Paracetamol (acetaminophen) is a widely used analgesic and antipyretic medication available over-the-counter.',
        safety: 'Generally well-tolerated when used as directed. Maximum daily dose should not exceed 4000mg for adults.',
        sideEffects: ['Nausea (rare)', 'Allergic reactions (very rare)', 'Liver damage (with overdose)'],
        contraindications: 'Severe liver disease, known hypersensitivity to paracetamol',
        dosing: 'Adults: 500-1000mg every 4-6 hours, maximum 4000mg/24 hours'
      },
      'ibuprofen': {
        overview: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used for pain, fever, and inflammation.',
        safety: 'Use with caution in elderly, those with heart/kidney disease, or stomach ulcers.',
        sideEffects: ['Stomach upset', 'Nausea', 'Dizziness', 'Headache'],
        contraindications: 'Active peptic ulcer, severe heart failure, severe kidney disease',
        dosing: 'Adults: 200-400mg every 4-6 hours, maximum 1200mg/24 hours for OTC use'
      },
      'aspirin': {
        overview: 'Aspirin is an NSAID and antiplatelet medication used for pain, fever, inflammation, and cardiovascular protection.',
        safety: 'Increased bleeding risk. Not recommended for children under 16 due to Reye\'s syndrome risk.',
        sideEffects: ['Stomach irritation', 'Increased bleeding', 'Nausea', 'Tinnitus (high doses)'],
        contraindications: 'Active bleeding, severe liver disease, children under 16 with viral infections',
        dosing: 'Pain/fever: 300-600mg every 4 hours; Cardioprotection: 75-100mg daily'
      }
    };
    
    // Find closest match
    let medInfo = null;
    for (const [key, info] of Object.entries(commonMeds)) {
      if (name.includes(key) || key.includes(name)) {
        medInfo = info;
        break;
      }
    }
    
    // Default fallback if medication not in database
    if (!medInfo) {
      medInfo = {
        overview: `${medicineName} analysis requires access to current medical databases.`,
        safety: 'Complete safety information is not available in offline mode.',
        sideEffects: ['Information unavailable - consult healthcare provider'],
        contraindications: 'Consult healthcare provider for contraindications',
        dosing: 'Follow healthcare provider instructions or official prescribing information'
      };
    }
    
    return {
      medicationOverview: medInfo.overview,
      generalSafety: medInfo.safety,
      womensSafety: 'Consult healthcare provider for women-specific considerations.',
      pediatricSafety: 'Consult pediatrician for children\'s dosing and safety.',
      pregnancySafety: 'Consult healthcare provider before use during pregnancy or breastfeeding.',
      clinicalTrials: 'Refer to medical literature and clinical databases for current research.',
      sideEffects: {
        common: medInfo.sideEffects,
        serious: ['Severe allergic reactions', 'Organ toxicity (with misuse)'],
        rare: ['Anaphylaxis', 'Stevens-Johnson syndrome'],
        genderSpecific: [],
        ageSpecific: [],
        summary: `Common side effects may include: ${medInfo.sideEffects.join(', ')}`
      },
      contraindications: medInfo.contraindications,
      dosing: medInfo.dosing,
      interactions: 'Check with pharmacist for drug interactions.',
      monitoring: 'Follow healthcare provider monitoring recommendations.',
      summary: `${medInfo.overview} Always consult healthcare providers for personalized medical advice.`,
      riskLevel: 'low-moderate',
      confidenceLevel: 'limited',
      evidenceQuality: 'offline_database',
      blackBoxWarnings: null,
      specialPopulations: {
        renalImpairment: 'Dose adjustment may be needed',
        hepaticImpairment: 'Use with caution',
        elderly: 'Consider reduced dosing',
        pediatric: 'Consult pediatrician for appropriate dosing'
      }
    };
  }
  
  /**
   * Generate content with fallback between services
   */
  async generateContent(prompt) {
    try {
      const { result, serviceUsed } = await this.requestWithFallback('generateContent', prompt);
      return { text: result, serviceUsed };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Generate structured content with fallback between services
   */
  async generateStructuredContent(prompt) {
    try {
      const { result, serviceUsed } = await this.requestWithFallback('generateStructuredContent', prompt);
      return { ...result, serviceUsed };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Test all service connections
   */
  async testConnections() {
    const results = {};
    
    for (const [name, service] of Object.entries(this.services)) {
      try {
        await service.testConnection();
        results[name] = 'operational';
      } catch (error) {
        results[name] = 'error';
      }
    }
    
    return results;
  }
}

module.exports = new AIServiceFactory();
