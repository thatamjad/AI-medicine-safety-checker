// Enhanced form validation utilities for Phase 3

export const validationRules = {
  medicineName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\(\)]+$/,
    message: 'Medicine name must be 2-100 characters and contain only letters, numbers, spaces, hyphens, and parentheses'
  },
  age: {
    required: false,
    min: 0,
    max: 120,
    pattern: /^\d+$/,
    message: 'Age must be a number between 0 and 120'
  },
  gender: {
    required: false,
    enum: ['male', 'female', 'other'],
    message: 'Please select a valid gender option'
  }
}

export const validateField = (name, value, rules = validationRules) => {
  const rule = rules[name]
  if (!rule) return { isValid: true, error: null }

  const errors = []

  // Required validation
  if (rule.required && (!value || value.toString().trim() === '')) {
    errors.push(`${name.charAt(0).toUpperCase() + name.slice(1)} is required`)
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return { isValid: errors.length === 0, error: errors[0] || null }
  }

  // Length validation
  if (rule.minLength && value.length < rule.minLength) {
    errors.push(`${name} must be at least ${rule.minLength} characters`)
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    errors.push(`${name} must be no more than ${rule.maxLength} characters`)
  }

  // Numeric range validation
  const numValue = parseFloat(value)
  if (rule.min !== undefined && numValue < rule.min) {
    errors.push(`${name} must be at least ${rule.min}`)
  }

  if (rule.max !== undefined && numValue > rule.max) {
    errors.push(`${name} must be no more than ${rule.max}`)
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    errors.push(rule.message || `${name} format is invalid`)
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(rule.message || `${name} must be one of: ${rule.enum.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    error: errors[0] || null
  }
}

export const validateForm = (formData, rules = validationRules) => {
  const errors = {}
  let isValid = true

  Object.keys(formData).forEach(fieldName => {
    if (rules[fieldName]) {
      const validation = validateField(fieldName, formData[fieldName], rules)
      if (!validation.isValid) {
        errors[fieldName] = validation.error
        isValid = false
      }
    }
  })

  // Custom business logic validations
  if (formData.isPregnant && formData.gender === 'male') {
    errors.gender = 'Pregnancy option is only applicable for females'
    isValid = false
  }

  if (formData.age && parseInt(formData.age) >= 18 && formData.isChild) {
    errors.isChild = 'Child option should not be selected for adults (18+)'
    isValid = false
  }

  return {
    isValid,
    errors
  }
}

export const formatValidationMessage = (error) => {
  if (!error) return null
  
  return {
    type: 'error',
    message: error,
    icon: '⚠️'
  }
}

export const getFieldStatus = (fieldName, errors) => {
  if (errors[fieldName]) {
    return {
      className: 'field-error',
      'aria-invalid': true,
      'aria-describedby': `${fieldName}-error`
    }
  }
  return {
    className: 'field-valid',
    'aria-invalid': false
  }
}

// Real-time validation debouncing
export class ValidationDebouncer {
  constructor(delay = 300) {
    this.delay = delay
    this.timeouts = new Map()
  }

  validate(fieldName, value, callback, rules = validationRules) {
    // Clear existing timeout for this field
    if (this.timeouts.has(fieldName)) {
      clearTimeout(this.timeouts.get(fieldName))
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      const result = validateField(fieldName, value, rules)
      callback(fieldName, result)
      this.timeouts.delete(fieldName)
    }, this.delay)

    this.timeouts.set(fieldName, timeoutId)
  }

  cleanup() {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    this.timeouts.clear()
  }
}

// Accessibility helpers
export const getFieldAriaAttributes = (fieldName, errors, description) => {
  const attributes = {
    'aria-label': fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
    'aria-required': validationRules[fieldName]?.required || false
  }

  if (errors[fieldName]) {
    attributes['aria-invalid'] = true
    attributes['aria-describedby'] = `${fieldName}-error`
  }

  if (description) {
    attributes['aria-description'] = description
  }

  return attributes
}

// Medicine name suggestions (for autocomplete)
export const commonMedicines = [
  'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Lisinopril',
  'Metformin', 'Amlodipine', 'Atorvastatin', 'Levothyroxine', 'Omeprazole',
  'Losartan', 'Gabapentin', 'Hydrochlorothiazide', 'Sertraline', 'Montelukast',
  'Furosemide', 'Prednisone', 'Tramadol', 'Trazodone', 'Albuterol'
]

export const getMedicineSuggestions = (input) => {
  if (!input || input.length < 2) return []
  
  const lowercaseInput = input.toLowerCase()
  return commonMedicines.filter(medicine => 
    medicine.toLowerCase().includes(lowercaseInput)
  ).slice(0, 5) // Limit to 5 suggestions
}

// Form submission helpers
export const sanitizeFormData = (formData) => {
  const sanitized = { ...formData }
  
  // Trim string fields
  if (sanitized.medicineName) {
    sanitized.medicineName = sanitized.medicineName.trim()
  }
  
  // Convert age to number
  if (sanitized.age) {
    sanitized.age = parseInt(sanitized.age)
  }
  
  // Ensure boolean fields are actual booleans
  sanitized.isPregnant = Boolean(sanitized.isPregnant)
  sanitized.isChild = Boolean(sanitized.isChild)
  
  return sanitized
}

export default {
  validationRules,
  validateField,
  validateForm,
  formatValidationMessage,
  getFieldStatus,
  ValidationDebouncer,
  getFieldAriaAttributes,
  getMedicineSuggestions,
  sanitizeFormData
}
