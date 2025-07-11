import { useState, useEffect, useRef } from 'react'
import { analyzeMedicine } from '../services/api'
import { 
  validateForm, 
  ValidationDebouncer, 
  sanitizeFormData,
  getFieldAriaAttributes 
} from '../utils/validation'
import MedicineSearchInput from './MedicineSearchInput'

function MedicineInput({ onAnalysisStart, onAnalysisComplete, onAnalysisError }) {
  const [formData, setFormData] = useState({
    medicineName: '',
    age: '',
    gender: '',
    isPregnant: false,
    isChild: false
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldTouched, setFieldTouched] = useState({})
  
  const validationDebouncer = useRef(new ValidationDebouncer(500))

  // Cleanup debouncer on unmount
  useEffect(() => {
    return () => {
      validationDebouncer.current.cleanup()
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      validationDebouncer.current.validate(name, newValue, (fieldName, result) => {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error
        }))
      })
    }
  }

  // Handle medicine name change from search component
  const handleMedicineNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      medicineName: value
    }))

    // Real-time validation for touched fields
    if (fieldTouched.medicineName) {
      validationDebouncer.current.validate('medicineName', value, (fieldName, result) => {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error
        }))
      })
    }
  }

  // Handle medicine selection from suggestions
  const handleMedicineSelect = (suggestion) => {
    const selectedValue = suggestion.genericName || suggestion.value || suggestion.display
    setFormData(prev => ({
      ...prev,
      medicineName: selectedValue
    }))
    
    // Clear any validation errors for medicine name
    setErrors(prev => ({
      ...prev,
      medicineName: null
    }))
  }

  const handleFieldBlur = (fieldName) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }))
    
    // Validate on blur
    const validation = validateForm({ ...formData, [fieldName]: formData[fieldName] })
    if (validation.errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched for validation display
    const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setFieldTouched(allFieldsTouched)

    // Validate entire form
    const validation = validateForm(formData)
    setErrors(validation.errors)

    if (!validation.isValid) {
      const firstErrorField = Object.keys(validation.errors)[0]
      onAnalysisError(`Please fix the following error: ${validation.errors[firstErrorField]}`)
      
      // Focus on first error field
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
        errorElement?.focus()
      }, 100)
      return
    }

    setIsSubmitting(true)
    onAnalysisStart()

    try {
      // Sanitize and prepare form data
      const sanitizedData = sanitizeFormData(formData)
      
      // Prepare patient info
      const patientInfo = {
        ...(sanitizedData.age && { age: sanitizedData.age }),
        ...(sanitizedData.gender && { gender: sanitizedData.gender }),
        isPregnant: sanitizedData.isPregnant,
        isChild: sanitizedData.isChild || (sanitizedData.age && sanitizedData.age < 18)
      }

      console.log('MedicineInput: Making API call with:', { medicineName: sanitizedData.medicineName, patientInfo });
      const result = await analyzeMedicine(sanitizedData.medicineName, patientInfo)
      console.log('MedicineInput: API call successful, result:', result);
      onAnalysisComplete(result)
      
      // Clear form errors on successful submission
      setErrors({})
    } catch (error) {
      console.error('MedicineInput: API call failed:', error);
      onAnalysisError(error.message || 'Failed to analyze medicine. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      medicineName: '',
      age: '',
      gender: '',
      isPregnant: false,
      isChild: false
    })
    setErrors({})
    setFieldTouched({})
    setSuggestions([])
    setShowSuggestions(false)
    
    // Focus on medicine name input after reset
    setTimeout(() => {
      medicineInputRef.current?.focus()
    }, 100)
  }

  return (
    <div className="medicine-input-container">
      <div className="input-card">
        <h3>Enter Medicine Information</h3>
        
        <form onSubmit={handleSubmit} className="medicine-form" noValidate>
          <div className="form-group medicine-group">
            <label htmlFor="medicineName" className="form-label">
              <span>Medicine Name *</span>
              <span className="label-tip">Enter brand name or generic name</span>
            </label>
            
            <MedicineSearchInput
              value={formData.medicineName}
              onChange={handleMedicineNameChange}
              onSelect={handleMedicineSelect}
              placeholder="e.g., Dolo, Pantop D, Crocin, Paracetamol, Ibuprofen"
              disabled={isSubmitting}
            />
            
            {errors.medicineName && (
              <div id="medicineName-error" className="form-error" role="alert">
                <span aria-hidden="true">⚠️</span>
                {errors.medicineName}
              </div>
            )}
            
            <div className="medicine-tips">
              <h4>💡 Tip: You can search using common names</h4>
              <div className="medicine-examples">
                <span className="medicine-example" onClick={() => handleMedicineNameChange('Dolo')}>Dolo</span>
                <span className="medicine-example" onClick={() => handleMedicineNameChange('Pantop D')}>Pantop D</span>
                <span className="medicine-example" onClick={() => handleMedicineNameChange('Crocin')}>Crocin</span>
                <span className="medicine-example" onClick={() => handleMedicineNameChange('Brufen')}>Brufen</span>
                <span className="medicine-example" onClick={() => handleMedicineNameChange('Omez')}>Omez</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age" className="form-label">Age (optional)</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('age')}
                placeholder="Age in years"
                min="0"
                max="120"
                className={errors.age ? 'field-error' : ''}
                {...getFieldAriaAttributes('age', errors, 'Enter age to get age-specific safety information')}
                disabled={isSubmitting}
              />
              {errors.age && (
                <div id="age-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠️</span>
                  {errors.age}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender (optional)</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('gender')}
                className={errors.gender ? 'field-error' : ''}
                {...getFieldAriaAttributes('gender', errors, 'Select gender for gender-specific safety information')}
                disabled={isSubmitting}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <div id="gender-error" className="form-error" role="alert">
                  <span aria-hidden="true">⚠️</span>
                  {errors.gender}
                </div>
              )}
            </div>
          </div>

          <div className="form-checkboxes">
            <h4>Special Considerations</h4>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="isPregnant"
                  name="isPregnant"
                  checked={formData.isPregnant}
                  onChange={handleInputChange}
                  className="form-checkbox"
                  disabled={isSubmitting || formData.gender === 'male'}
                  aria-describedby="pregnancy-help"
                />
                <label htmlFor="isPregnant" className="checkbox-label">
                  Currently pregnant or breastfeeding
                </label>
              </div>
              <small id="pregnancy-help" className="checkbox-help">
                For women who are pregnant, trying to conceive, or breastfeeding
              </small>
            </div>

            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="isChild"
                  name="isChild"
                  checked={formData.isChild}
                  onChange={handleInputChange}
                  className="form-checkbox"
                  disabled={isSubmitting}
                  aria-describedby="child-help"
                />
                <label htmlFor="isChild" className="checkbox-label">
                  For a child (under 18 years)
                </label>
              </div>
              <small id="child-help" className="checkbox-help">
                Check this for pediatric safety information
              </small>
            </div>
            
            {(errors.isPregnant || errors.isChild) && (
              <div className="form-error" role="alert">
                <span aria-hidden="true">⚠️</span>
                {errors.isPregnant || errors.isChild}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="reset-button btn-secondary"
              disabled={isSubmitting}
              aria-label="Reset form to default values"
            >
              <span>🔄</span>
              Reset
            </button>
            <button
              type="submit"
              className="analyze-button btn-primary"
              disabled={isSubmitting || !formData.medicineName.trim()}
              aria-label="Start medicine safety analysis"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔬</span>
                  Analyze Safety
                </>
              )}
            </button>
          </div>
        </form>

        <div className="input-disclaimer">
          <p>
            💡 <strong>Tip:</strong> Providing age and gender helps us give more 
            specific safety information relevant to your situation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MedicineInput
