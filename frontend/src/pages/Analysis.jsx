import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AdvancedSafetyReport from '../components/AdvancedSafetyReport'
import { useAnalysisHistory } from '../hooks/useAnalysisHistory'

const Analysis = () => {
    const [medicineName, setMedicineName] = useState('')
    const [isPregnant, setIsPregnant] = useState(false)
    const [isBreastfeeding, setIsBreastfeeding] = useState(false)
    const [isChild, setIsChild] = useState(false)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [error, setError] = useState(null)

    // Custom hook for history
    const { addHistoryEntry } = useAnalysisHistory()
    const resultsRef = useRef(null)

    // Auto scroll to results when they arrive
    useEffect(() => {
        if (analysisResult && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [analysisResult])

    const analyzeSafety = async (e) => {
        e.preventDefault()

        if (!medicineName.trim()) {
            setError('Please enter a medicine name')
            return
        }

        setIsAnalyzing(true)
        setError(null)
        setAnalysisResult(null)

        try {
            const patientInfo = {
                isPregnant,
                isBreastfeeding,
                isChild
            }

            const response = await fetch('http://localhost:5000/api/medicine/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ medicineName, patientInfo }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Analysis failed. Please try again.')
            }

            setAnalysisResult(data.analysis)

            // Save full successful analysis output to local storage history
            addHistoryEntry({
                id: uuidv4(),
                medicineName: data.medicine,
                timestamp: new Date().toISOString(),
                patientInfo: data.patientInfo,
                analysisResult: data.analysis
            })

        } catch (err) {
            console.error('Analysis error:', err)
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleReset = () => {
        setMedicineName('')
        setIsPregnant(false)
        setIsBreastfeeding(false)
        setIsChild(false)
        setAnalysisResult(null)
        setError(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Determine current step for visual indicator
    let currentStep = 1
    if (isAnalyzing) currentStep = 2
    else if (analysisResult) currentStep = 3

    return (
        <div className="content-container">
            <div className="page-header">
                <h1 className="serif-heading page-title">Analyze.</h1>
                <p className="page-description">
                    Enter a medication to receive an AI-powered safety breakdown.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-number">1</div>
                    <span className="step-label">Details</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <span className="step-label">Processing</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span className="step-label">Report</span>
                </div>
            </div>

            {/* Input Form */}
            {!analysisResult && !isAnalyzing && (
                <div className="bento-card input-form">
                    <div className="medical-disclaimer">
                        <div className="disclaimer-header">
                            Educational Use Only
                        </div>
                        <p>This tool does not replace professional medical advice. Always consult a doctor.</p>
                    </div>

                    <form onSubmit={analyzeSafety}>
                        <div className="input-group">
                            <label htmlFor="medicineName" className="input-label">Medication Name</label>
                            <input
                                id="medicineName"
                                type="text"
                                value={medicineName}
                                onChange={(e) => setMedicineName(e.target.value)}
                                placeholder="e.g., Amoxicillin, Ibuprofen"
                                disabled={isAnalyzing}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-label">Special Considerations (Optional)</span>
                            <span className="input-hint">Select any that apply to tailor the safety report.</span>

                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="pregnant"
                                    checked={isPregnant}
                                    onChange={(e) => setIsPregnant(e.target.checked)}
                                    disabled={isAnalyzing}
                                />
                                <label htmlFor="pregnant">Pregnancy</label>
                            </div>

                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="breastfeeding"
                                    checked={isBreastfeeding}
                                    onChange={(e) => setIsBreastfeeding(e.target.checked)}
                                    disabled={isAnalyzing}
                                />
                                <label htmlFor="breastfeeding">Breastfeeding</label>
                            </div>

                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="child"
                                    checked={isChild}
                                    onChange={(e) => setIsChild(e.target.checked)}
                                    disabled={isAnalyzing}
                                />
                                <label htmlFor="child">Pediatric (Under 12)</label>
                            </div>
                        </div>

                        {error && (
                            <div style={{ color: 'var(--color-danger)', marginTop: 'var(--space-md)', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="submit-container">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isAnalyzing || !medicineName.trim()}
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                Analyze Safety
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Analyzing {medicineName}...</p>
                    <p style={{ color: 'var(--text-muted)' }}>Cross-referencing medical databases</p>
                </div>
            )}

            {/* Results */}
            {analysisResult && !isAnalyzing && (
                <div ref={resultsRef}>
                    <AdvancedSafetyReport
                        report={analysisResult}
                        medicineName={medicineName}
                        patientInfo={{ isPregnant, isBreastfeeding, isChild }}
                    />
                    <div className="submit-container" style={{ marginTop: 'var(--space-xl)' }}>
                        <button onClick={handleReset} className="btn-secondary">
                            Analyze Another Medication
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Analysis
