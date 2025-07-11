import ReactMarkdown from 'react-markdown'
import ExportReport from './ExportReport'

function InteractionResults({ result, onNewCheck }) {
  if (!result) return null

  const { medicines, riskLevel, pharmacokineticInteractions, pharmacodynamicInteractions, 
          populationSpecific, managementStrategies, monitoringRequirements, checkedAt } = result

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
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
    <div className="interaction-results">
      <div className="results-header">
        <h3>🔄 Drug Interaction Analysis</h3>
        <div className="medicines-checked">
          <h4>Medications Analyzed:</h4>
          <div className="medicine-chips">
            {medicines.map((medicine, index) => (
              <span key={index} className="medicine-chip">{medicine}</span>
            ))}
          </div>
        </div>
        <div className="risk-assessment">
          <span 
            className="risk-badge-interaction"
            style={{ backgroundColor: getRiskColor(riskLevel) }}
          >
            Overall Risk: {riskLevel || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="interaction-content">
        
        {/* Pharmacokinetic Interactions */}
        {pharmacokineticInteractions && (
          <div className="interaction-section">
            <h4>🧬 Pharmacokinetic Interactions</h4>
            <div className="interaction-detail">
              <ReactMarkdown>{pharmacokineticInteractions}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Pharmacodynamic Interactions */}
        {pharmacodynamicInteractions && (
          <div className="interaction-section">
            <h4>⚡ Pharmacodynamic Interactions</h4>
            <div className="interaction-detail">
              <ReactMarkdown>{pharmacodynamicInteractions}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Population-Specific Interactions */}
        {populationSpecific && (
          <div className="population-interactions">
            <h4>👥 Population-Specific Considerations</h4>
            <div className="population-grid">
              {populationSpecific.women && (
                <div className="population-section">
                  <h5>👩 Women</h5>
                  <ReactMarkdown>{populationSpecific.women}</ReactMarkdown>
                </div>
              )}
              
              {populationSpecific.pediatric && (
                <div className="population-section">
                  <h5>👶 Children</h5>
                  <ReactMarkdown>{populationSpecific.pediatric}</ReactMarkdown>
                </div>
              )}
              
              {populationSpecific.pregnancy && (
                <div className="population-section">
                  <h5>🤱 Pregnancy</h5>
                  <ReactMarkdown>{populationSpecific.pregnancy}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Management Strategies */}
        {managementStrategies && (
          <div className="management-section">
            <h4>🛡️ Management Strategies</h4>
            <div className="management-content">
              <ReactMarkdown>{managementStrategies}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Monitoring Requirements */}
        {monitoringRequirements && (
          <div className="monitoring-section">
            <h4>📊 Monitoring Requirements</h4>
            <div className="monitoring-content">
              <ReactMarkdown>{monitoringRequirements}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Emergency Information */}
        <div className="emergency-info-interactions">
          <h4>🚨 When to Seek Immediate Medical Attention</h4>
          <ul>
            <li>Severe allergic reactions (difficulty breathing, swelling, rash)</li>
            <li>Unusual bleeding or bruising</li>
            <li>Severe dizziness, fainting, or heart palpitations</li>
            <li>Signs of toxicity specific to any of the medications</li>
            <li>Any concerning symptoms not previously experienced</li>
          </ul>
        </div>
      </div>

      <div className="interaction-footer">
        <div className="analysis-timestamp">
          <small>Analysis completed: {formatTimestamp(checkedAt)}</small>
        </div>
        
        <div className="interaction-disclaimer">
          <h5>⚠️ Important Disclaimer</h5>
          <p>
            This interaction analysis is for informational purposes only. Always consult 
            your healthcare provider or pharmacist before making any changes to your 
            medication regimen. They can provide personalized advice based on your 
            complete medical history and current health status.
          </p>
        </div>

        <div className="new-check-section">
          <button onClick={onNewCheck} className="new-check-btn">
            Check Different Medications
          </button>
        </div>
      </div>

      {/* Export Functionality */}
      <ExportReport data={result} reportType="interaction" />
    </div>
  )
}

export default InteractionResults
