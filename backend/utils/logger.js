const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'INFO',
      message,
      ...meta
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] INFO: ${message}`, meta);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'WARN',
      message,
      ...meta
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${timestamp}] WARN: ${message}`, meta);
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  },

  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'ERROR',
      message,
      ...meta
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${timestamp}] ERROR: ${message}`, meta);
    } else {
      console.error(JSON.stringify(logEntry));
    }
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] DEBUG: ${message}`, meta);
    }
  }
};

module.exports = logger;
