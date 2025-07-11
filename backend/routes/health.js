const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        api: 'operational',
        huggingface: 'checking...',
        gemini: 'checking...',
        openai: 'checking...'
      }
    };

    // Check AI services connection using the factory
    try {
      const aiServiceFactory = require('../services/aiServiceFactory');
      const serviceStatuses = await aiServiceFactory.testConnections();
      
      // Update service statuses
      Object.assign(healthStatus.services, serviceStatuses);
      
      // Add warnings for any non-operational services
      const warnings = Object.entries(serviceStatuses)
        .filter(([_, status]) => status !== 'operational')
        .map(([name]) => `${name.charAt(0).toUpperCase() + name.slice(1)} API connection failed`);
      
      if (warnings.length > 0) {
        healthStatus.warnings = warnings;
      }
      
    } catch (error) {
      healthStatus.services.gemini = 'error';
      healthStatus.services.openai = 'error';
      healthStatus.warnings = ['AI services connection check failed'];
      logger.warn('AI services health check failed:', error.message);
    }

    // If all AI services are down, return 503, otherwise 200
    const allAIServicesDown = Object.entries(healthStatus.services)
      .filter(([key]) => key !== 'api')
      .every(([_, status]) => status === 'error');
    
    const statusCode = allAIServicesDown ? 503 : 200;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check with system info
router.get('/detailed', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        },
        pid: process.pid
      },
      services: {
        api: 'operational',
        cors: process.env.CORS_ORIGIN ? 'configured' : 'default',
        rateLimit: 'active'
      }
    });
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed'
    });
  }
});

module.exports = router;
