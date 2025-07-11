import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

console.log('API_BASE_URL:', API_BASE_URL) // Debug log

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds (2 minutes) timeout for AI analysis
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('Response error:', error)
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again')
    }
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          throw new Error(data.message || data.error || 'Invalid request')
        case 429:
          throw new Error('Too many requests. Please wait a moment and try again.')
        case 500:
          throw new Error('Server error. Please try again later.')
        case 503:
          throw new Error('Service temporarily unavailable. Please try again later.')
        default:
          throw new Error(data.message || data.error || `Request failed with status ${status}`)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error details:', error.request)
      console.error('Error config:', error.config)
      throw new Error(`Network error - Cannot connect to API at ${error.config?.baseURL}. Please check if the backend server is running.`)
    } else {
      // Other error
      console.error('Request setup error:', error.message)
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// API functions
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

export const analyzeMedicine = async (medicineName, patientInfo = {}) => {
  try {
    const response = await apiClient.post('/api/medicine/analyze', {
      medicineName,
      patientInfo
    })
    return response.data
  } catch (error) {
    console.error('Medicine analysis failed:', error)
    throw error
  }
}

export const getAlternatives = async (medicineName, condition = '') => {
  try {
    const response = await apiClient.get('/api/medicine/alternatives', {
      params: { medicine: medicineName, condition }
    })
    return response.data
  } catch (error) {
    console.error('Failed to get alternatives:', error)
    throw error
  }
}

export const checkInteractions = async (medicines) => {
  try {
    const response = await apiClient.post('/api/medicine/interactions', {
      medicines
    })
    return response.data
  } catch (error) {
    console.error('Interaction check failed:', error)
    throw error
  }
}

// Medicine search and suggestions
export const searchMedicine = async (query) => {
  try {
    const response = await apiClient.get('/api/medicine/search', {
      params: { q: query }
    })
    return response.data
  } catch (error) {
    console.error('Medicine search failed:', error)
    throw error
  }
}

export const getMedicineSuggestions = async (query, limit = 5) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, suggestions: [] }
    }
    
    const response = await apiClient.get('/api/medicine/suggestions', {
      params: { q: query.trim(), limit }
    })
    return response.data
  } catch (error) {
    console.error('Failed to get medicine suggestions:', error)
    // Return empty suggestions on error to not break UX
    return { success: false, suggestions: [] }
  }
}

// Utility function to test API connectivity
export const testConnection = async () => {
  try {
    console.log('Testing connection to:', API_BASE_URL)
    const health = await healthCheck()
    return {
      connected: true,
      status: health.status,
      services: health.services
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return {
      connected: false,
      error: error.message
    }
  }
}

// Add a direct test function
export const directAPITest = async () => {
  try {
    console.log('Direct API test to:', `${API_BASE_URL}/api/health`)
    const response = await fetch(`${API_BASE_URL}/api/health`)
    const data = await response.json()
    console.log('Direct fetch success:', data)
    return data
  } catch (error) {
    console.error('Direct fetch failed:', error)
    throw error
  }
}

export default apiClient
