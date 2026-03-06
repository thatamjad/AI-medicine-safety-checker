import axios from 'axios'

// On Vercel, frontend & backend are on same domain — use relative URLs (empty base).
// For local dev, fall back to localhost:3001.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://localhost:3001' : '')

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again')
    }

    if (error.response) {
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
      throw new Error(`Network error - Cannot connect to API. Please check if the backend server is running.`)
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

// API functions
export const healthCheck = async () => {
  const response = await apiClient.get('/api/health')
  return response.data
}

export const analyzeMedicine = async (medicineName, patientInfo = {}) => {
  const response = await apiClient.post('/api/medicine/analyze', {
    medicineName,
    patientInfo
  })
  return response.data
}

export const getAlternatives = async (medicineName, condition = '') => {
  const response = await apiClient.get('/api/medicine/alternatives', {
    params: { medicine: medicineName, condition }
  })
  return response.data
}

export const checkInteractions = async (medicines) => {
  const response = await apiClient.post('/api/medicine/interactions', {
    medicines
  })
  return response.data
}

export const searchMedicine = async (query) => {
  const response = await apiClient.get('/api/medicine/search', {
    params: { q: query }
  })
  return response.data
}

export const getMedicineSuggestions = async (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return { success: true, suggestions: [] }
  }

  try {
    const response = await apiClient.get('/api/medicine/suggestions', {
      params: { q: query.trim(), limit }
    })
    return response.data
  } catch (error) {
    return { success: false, suggestions: [] }
  }
}

export const testConnection = async () => {
  try {
    const health = await healthCheck()
    return {
      connected: true,
      status: health.status,
      services: health.services
    }
  } catch (error) {
    return {
      connected: false,
      error: error.message
    }
  }
}

export default apiClient
