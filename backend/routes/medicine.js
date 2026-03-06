const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const medicineAnalysis = require('../services/medicineAnalysis');
const medicineNameMapper = require('../services/medicineNameMapper');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

// Validation middleware for medicine analysis
const validateMedicineRequest = [
  body('medicineName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Medicine name is required and must be between 1-200 characters')
    .matches(/^[a-zA-Z0-9\s\-.,()]+$/)
    .withMessage('Medicine name contains invalid characters'),

  body('patientInfo.age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Age must be between 0 and 120'),

  body('patientInfo.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('patientInfo.isPregnant')
    .optional()
    .isBoolean()
    .withMessage('isPregnant must be a boolean'),

  body('patientInfo.isChild')
    .optional()
    .isBoolean()
    .withMessage('isChild must be a boolean')
];

// POST /api/medicine/analyze - Main analysis endpoint
router.post('/analyze', validateMedicineRequest, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { medicineName, patientInfo = {} } = req.body;

    logger.info(`Medicine analysis requested for: ${medicineName}`);

    // Check cache first
    const cacheKey = cache.generateKey('analysis', medicineName, patientInfo);
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      logger.info(`Returning cached analysis for: ${medicineName}`);
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Perform the analysis
    const analysisResult = await medicineAnalysis.analyzeMedicine(medicineName, patientInfo);

    logger.info(`Analysis completed for: ${medicineName}`);

    const response = {
      success: true,
      medicine: medicineName,
      patientInfo,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
      disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider before making any medical decisions."
    };

    // Cache the successful response (5 min TTL)
    cache.set(cacheKey, response, 300000);

    res.json(response);

  } catch (error) {
    logger.error('Medicine analysis failed:', error);

    // Handle specific errors
    if (error.message.includes('API_KEY')) {
      return res.status(500).json({
        error: 'AI service configuration error',
        message: 'Please check API configuration'
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/medicine/alternatives - Alternative medications endpoint
router.get('/alternatives', async (req, res) => {
  try {
    const { medicine, condition } = req.query;

    if (!medicine) {
      return res.status(400).json({
        error: 'Medicine parameter is required'
      });
    }

    logger.info(`Alternative medicines requested for: ${medicine}`);

    const alternatives = await medicineAnalysis.getAlternatives(medicine, condition);

    res.json({
      success: true,
      originalMedicine: medicine,
      condition: condition || 'general',
      alternatives,
      timestamp: new Date().toISOString(),
      disclaimer: "Alternative suggestions are for informational purposes only. Consult your healthcare provider before switching medications."
    });

  } catch (error) {
    logger.error('Alternative medicines lookup failed:', error);
    res.status(500).json({
      error: 'Failed to get alternatives',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/medicine/interactions - Drug interaction checker
router.post('/interactions', [
  body('medicines')
    .isArray({ min: 2, max: 10 })
    .withMessage('Please provide 2-10 medicines for interaction check'),
  body('medicines.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each medicine name must be between 1-200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { medicines } = req.body;

    logger.info(`Drug interaction check requested for: ${medicines.join(', ')}`);

    const interactions = await medicineAnalysis.checkInteractions(medicines);

    res.json({
      success: true,
      medicines,
      interactions,
      timestamp: new Date().toISOString(),
      disclaimer: "Interaction information is for educational purposes only. Always consult your healthcare provider about potential drug interactions."
    });

  } catch (error) {
    logger.error('Drug interaction check failed:', error);
    res.status(500).json({
      error: 'Interaction check failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/medicine/search - Search for medicine names and get suggestions
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
        example: '/api/medicine/search?q=dolo'
      });
    }

    logger.info(`Medicine search requested for: ${query}`);

    const searchResults = await medicineNameMapper.enhancedMedicineSearch(query.trim());

    res.json({
      success: true,
      query: query.trim(),
      results: searchResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Medicine search failed:', error);
    res.status(500).json({
      error: 'Search failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/medicine/suggestions - Get quick suggestions for autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        query: query || '',
        suggestions: []
      });
    }

    const suggestions = medicineNameMapper.getSuggestions(query.trim(), parseInt(limit));

    res.json({
      success: true,
      query: query.trim(),
      suggestions: suggestions.map(s => ({
        display: `${s.commonName} (${s.genericName})`,
        commonName: s.commonName,
        genericName: s.genericName,
        value: s.genericName // Use generic name for analysis
      }))
    });

  } catch (error) {
    logger.error('Medicine suggestions failed:', error);
    res.status(500).json({
      error: 'Suggestions failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
