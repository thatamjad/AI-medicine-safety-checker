import { useState } from 'react'

function InteractionChecker({ onInteractionResult, onError }) {
  const [medicines, setMedicines] = useState(['', ''])
  const [isChecking, setIsChecking] = useState(false)

  const addMedicineField = () => {
    if (medicines.length < 10) {
      setMedicines([...medicines, ''])
    }
  }

  const removeMedicineField = (index) => {
    if (medicines.length > 2) {
      const newMedicines = medicines.filter((_, i) => i !== index)
      setMedicines(newMedicines)
    }
  }

  const updateMedicine = (index, value) => {
    const newMedicines = [...medicines]
    newMedicines[index] = value
    setMedicines(newMedicines)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const filledMedicines = medicines.filter(med => med.trim() !== '')
    
    if (filledMedicines.length < 2) {
      onError('Please enter at least 2 medications to check for interactions.')
      return
    }

    setIsChecking(true)
    
    try {
      const { checkInteractions } = await import('../services/api')
      const result = await checkInteractions(filledMedicines)
      onInteractionResult(result)
    } catch (error) {
      onError(error.message || 'Failed to check drug interactions.')
    } finally {
      setIsChecking(false)
    }
  }

  const resetForm = () => {
    setMedicines(['', ''])
  }

  return (
    <div className="interaction-checker">
      <div className="checker-header">
        <h3>🔄 Drug Interaction Checker</h3>
        <p>Check for potential interactions between multiple medications</p>
      </div>

      <form onSubmit={handleSubmit} className="interaction-form">
        <div className="medicine-inputs">
          {medicines.map((medicine, index) => (
            <div key={index} className="medicine-input-row">
              <div className="input-number">{index + 1}</div>
              <input
                type="text"
                value={medicine}
                onChange={(e) => updateMedicine(index, e.target.value)}
                placeholder={`Medicine ${index + 1} (e.g., Ibuprofen)`}
                className="medicine-interaction-input"
                disabled={isChecking}
              />
              {medicines.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeMedicineField(index)}
                  className="remove-medicine-btn"
                  disabled={isChecking}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="interaction-actions">
          <button
            type="button"
            onClick={addMedicineField}
            className="add-medicine-btn"
            disabled={medicines.length >= 10 || isChecking}
          >
            + Add Medicine
          </button>
          
          <div className="form-buttons">
            <button
              type="button"
              onClick={resetForm}
              className="reset-btn"
              disabled={isChecking}
            >
              Reset
            </button>
            <button
              type="submit"
              className="check-interactions-btn"
              disabled={isChecking || medicines.filter(m => m.trim()).length < 2}
            >
              {isChecking ? 'Checking...' : 'Check Interactions'}
            </button>
          </div>
        </div>
      </form>

      <div className="interaction-info">
        <h4>💡 What We Check</h4>
        <ul>
          <li>Drug-drug interactions and their severity</li>
          <li>Women-specific interaction risks</li>
          <li>Pediatric interaction considerations</li>
          <li>Pregnancy-related interaction effects</li>
          <li>Monitoring and management recommendations</li>
        </ul>
      </div>
    </div>
  )
}

export default InteractionChecker
