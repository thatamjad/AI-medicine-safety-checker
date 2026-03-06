import { useState } from 'react'

const Interactions = () => {
    const [medicines, setMedicines] = useState(['', ''])
    const [isChecking, setIsChecking] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const handleAddMedicine = () => {
        if (medicines.length < 10) {
            setMedicines([...medicines, ''])
        }
    }

    const handleMedicineChange = (index, value) => {
        const newMedicines = [...medicines]
        newMedicines[index] = value
        setMedicines(newMedicines)
    }

    const checkInteractions = async (e) => {
        e.preventDefault()

        // Filter out empty inputs
        const validMedicines = medicines.filter(m => m.trim() !== '')

        if (validMedicines.length < 2) {
            setError('Please enter at least two medications to check for interactions.')
            return
        }

        setIsChecking(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch('http://localhost:5000/api/interactions/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicines: validMedicines })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check interactions')
            }

            setResult(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsChecking(false)
        }
    }

    const resetForm = () => {
        setMedicines(['', ''])
        setResult(null)
        setError(null)
    }

    return (
        <div className="content-container">
            <div className="page-header">
                <h1 className="serif-heading page-title">Interactions.</h1>
                <p className="page-description">
                    Cross-reference up to 10 medications for potential conflicts and severity ratings.
                </p>
            </div>

            {/* Severity Legend */}
            <div className="features-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <div className="bento-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-danger)' }}></div>
                        <h3 className="serif-heading" style={{ fontSize: '1.25rem' }}>High Severity</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Potentially dangerous. Avoid combination or seek immediate medical advice.</p>
                </div>
                <div className="bento-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-warning)' }}></div>
                        <h3 className="serif-heading" style={{ fontSize: '1.25rem' }}>Moderate Severity</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Use caution. Monitoring or dose adjustment may be required.</p>
                </div>
                <div className="bento-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-success)' }}></div>
                        <h3 className="serif-heading" style={{ fontSize: '1.25rem' }}>Low Severity</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Generally safe. Minor interaction that rarely requires changes.</p>
                </div>
            </div>

            {/* Interaction Form */}
            <div className="bento-card input-form">
                <form onSubmit={checkInteractions}>
                    {medicines.map((med, index) => (
                        <div className="input-group" key={index}>
                            <label className="input-label">Medication {index + 1}</label>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <input
                                    type="text"
                                    value={med}
                                    onChange={(e) => handleMedicineChange(index, e.target.value)}
                                    placeholder="e.g., Ibuprofen"
                                    disabled={isChecking}
                                />
                                {index > 1 && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setMedicines(medicines.filter((_, i) => i !== index))}
                                        style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Remove medication"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {medicines.length < 10 && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleAddMedicine}
                            style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Medication
                        </button>
                    )}

                    {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <button type="submit" className="btn-primary" disabled={isChecking} style={{ flex: 1 }}>
                            {isChecking ? 'Checking...' : 'Check Interactions'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={resetForm} disabled={isChecking}>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {isChecking && (
                <div className="loading-container" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Analyzing interactions...</p>
                </div>
            )}

            {result && !isChecking && (
                <div className="report-document" style={{ marginTop: 'var(--space-2xl)' }}>
                    <div className="report-header">
                        <h2 className="serif-heading" style={{ fontSize: '2.5rem' }}>Analysis Results</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                            Analyzed {result.medicinesAnalyzed.length} medications
                        </p>
                    </div>

                    <div className="report-section">
                        <h3>Summary</h3>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{result.analysis.summary}</p>
                    </div>

                    <div className="report-section">
                        <h3>Identified Interactions</h3>
                        {result.analysis.interactions.length === 0 ? (
                            <div className="bento-card" style={{ background: 'var(--color-success-bg)', borderColor: 'rgba(5, 150, 105, 0.2)' }}>
                                No significant interactions found between these medications.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {result.analysis.interactions.map((interaction, idx) => (
                                    <div key={idx} className="bento-card" style={{ padding: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                            <strong style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                                                {interaction.drugs[0]} + {interaction.drugs[1]}
                                            </strong>
                                            <span className={`risk-badge risk-${interaction.severity.toLowerCase()}`}>
                                                {interaction.severity}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)' }}>{interaction.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Interactions
