import ReactMarkdown from 'react-markdown'

function SafetyReport({ result }) {
  if (!result || !result.analysis) {
    return (
      <div className="safety-report-container">
        <div className="error-message">
          <p>No analysis data available.</p>
        </div>
      </div>
    )
  }

  const { medicine, analysis, patientInfo, timestamp } = result
  
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#d32f2f'
      case 'medium': return '#f57c00'
      case 'low': return '#388e3c'
      default: return '#757575'
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="safety-report-container">
      <div className="report-header">
        <h2>Safety Analysis Report</h2>
        <div className="report-meta">
          <div className="medicine-info">
            <h3>{medicine}</h3>
            {patientInfo && (
              <div className="patient-tags">
                {patientInfo.age && <span className="tag">Age: {patientInfo.age}</span>}
                {patientInfo.gender && <span className="tag">{patientInfo.gender}</span>}
                {patientInfo.isPregnant && <span className="tag pregnancy">Pregnant</span>}
                {patientInfo.isChild && <span className="tag pediatric">Pediatric</span>}
              </div>
            )}
          </div>
          <div className="risk-indicator">
            <span 
              className="risk-badge"
              style={{ backgroundColor: getRiskLevelColor(analysis.riskLevel) }}
            >
              Risk Level: {analysis.riskLevel || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="report-content">
        {analysis.summary && (
          <div className="summary-section">
            <h4>📋 Summary</h4>
            <div className="summary-text">
              <ReactMarkdown>{analysis.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="analysis-sections">
          <div className="analysis-section">
            <h4>👩 Women's Health Considerations</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.womensSafety}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>👶 Pediatric Safety</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.pediatricSafety}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>🤱 Pregnancy & Breastfeeding</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.pregnancySafety}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>🔬 Clinical Trial Information</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.clinicalTrials}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>⚠️ Side Effects</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.sideEffects}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>🚫 Contraindications</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.contraindications}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>💊 Dosing Information</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.dosing}</ReactMarkdown>
            </div>
          </div>

          <div className="analysis-section">
            <h4>ℹ️ General Safety</h4>
            <div className="section-content">
              <ReactMarkdown>{analysis.generalSafety}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="report-footer">
        <div className="disclaimer-box">
          <h5>⚠️ Important Medical Disclaimer</h5>
          <p>
            This analysis is for informational purposes only and should not replace 
            professional medical advice, diagnosis, or treatment. Always consult with 
            qualified healthcare providers before making any medical decisions or 
            changing your medication regimen.
          </p>
        </div>
        
        <div className="report-timestamp">
          <small>Analysis generated on: {formatTimestamp(timestamp)}</small>
        </div>
      </div>
    </div>
  )
}

export default SafetyReport
