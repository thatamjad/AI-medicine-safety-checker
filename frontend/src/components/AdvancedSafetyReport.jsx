import ReactMarkdown from 'react-markdown'
import ExportReport from './ExportReport'

function AdvancedSafetyReport({ result }) {
  // Debug logging
  console.log('AdvancedSafetyReport received result:', result);
  
  if (!result || !result.analysis) {
    return (
      <div className="safety-report-container">
        <div className="error-message">
          <p>No analysis data available.</p>
        </div>
      </div>
    );
  }

  const { medicine, analysis, patientInfo, timestamp } = result;
  
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#d32f2f'
      case 'moderate': return '#f57c00'
      case 'low-moderate': return '#ff9800'
      case 'low': return '#388e3c'
      default: return '#757575'
    }
  };

  const getConfidenceBadgeColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return '#2e7d32'
      case 'moderate': return '#f57c00'
      case 'low': return '#d32f2f'
      default: return '#757575'
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  };

  return (
    <div className="advanced-safety-report" style={{ 
      background: '#fff', 
      borderRadius: '8px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
      overflow: 'hidden', 
      margin: '2rem 0' 
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
        color: 'white', 
        padding: '2rem', 
        textAlign: 'center' 
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
          Comprehensive Safety Analysis
        </h2>
        <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>
          {medicine}
          {analysis.medicineNames && analysis.medicineNames.wasResolved && (
            <span style={{ fontSize: '0.9rem', opacity: '0.8', display: 'block', marginTop: '0.5rem' }}>
              ({analysis.medicineNames.resolved})
            </span>
          )}
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ 
            backgroundColor: getRiskLevelColor(analysis.riskLevel), 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Risk: {analysis.riskLevel || 'Unknown'}
          </span>
          <span style={{ 
            backgroundColor: getConfidenceBadgeColor(analysis.confidenceLevel), 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Confidence: {analysis.confidenceLevel || 'Moderate'}
          </span>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Executive Summary */}
        {analysis.summary && (
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem' }}>📋 Executive Summary</h3>
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown>{analysis.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Primary Safety Sections */}
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#db2777', fontSize: '1rem', fontWeight: '600' }}>
              👩 Women's Health Safety
            </h4>
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown>{analysis.womensSafety}</ReactMarkdown>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#059669', fontSize: '1rem', fontWeight: '600' }}>
              👶 Pediatric Safety
            </h4>
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown>{analysis.pediatricSafety}</ReactMarkdown>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#7c3aed', fontSize: '1rem', fontWeight: '600' }}>
              🤱 Pregnancy & Lactation
            </h4>
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown>{analysis.pregnancySafety}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Side Effects */}
        {analysis.sideEffects && typeof analysis.sideEffects === 'object' && (
          <div style={{ marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626', fontSize: '1.1rem' }}>⚠️ Side Effect Profile</h3>
            
            {analysis.sideEffects.summary && (
              <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#6b7280' }}>
                {analysis.sideEffects.summary}
              </div>
            )}
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {analysis.sideEffects.common && analysis.sideEffects.common.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontSize: '0.9rem' }}>Common (≥1%)</h5>
                  <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.875rem' }}>
                    {analysis.sideEffects.common.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.sideEffects.serious && analysis.sideEffects.serious.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontSize: '0.9rem' }}>Serious/Severe</h5>
                  <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.875rem' }}>
                    {analysis.sideEffects.serious.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.sideEffects.genderSpecific && analysis.sideEffects.genderSpecific.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#db2777', fontSize: '0.9rem' }}>Gender-Specific</h5>
                  <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.875rem' }}>
                    {analysis.sideEffects.genderSpecific.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Safety Information */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#dc2626', fontSize: '1rem' }}>🚫 Contraindications</h4>
            <div style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
              <ReactMarkdown>{analysis.contraindications}</ReactMarkdown>
            </div>
          </div>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#2563eb', fontSize: '1rem' }}>💊 Dosing Guidelines</h4>
            <div style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
              <ReactMarkdown>{analysis.dosing}</ReactMarkdown>
            </div>
          </div>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#7c3aed', fontSize: '1rem' }}>🔄 Drug Interactions</h4>
            <div style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
              <ReactMarkdown>{analysis.interactions}</ReactMarkdown>
            </div>
          </div>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#059669', fontSize: '1rem' }}>📊 Monitoring Requirements</h4>
            <div style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
              <ReactMarkdown>{analysis.monitoring}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Clinical Trials */}
        <div style={{ marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.1rem' }}>🔬 Clinical Evidence & Trials</h3>
          <div style={{ lineHeight: '1.6' }}>
            <ReactMarkdown>{analysis.clinicalTrials}</ReactMarkdown>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '6px', 
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '1rem' }}>⚠️ Medical Disclaimer</h4>
          <p style={{ margin: '0', fontSize: '0.875rem', lineHeight: '1.6', color: '#92400e' }}>
            This AI-generated analysis is for <strong>educational purposes only</strong> and 
            must not replace professional medical advice, diagnosis, or treatment. Always consult 
            qualified healthcare providers for medical decisions.
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#92400e' }}>
            <strong>Analysis Generated:</strong> {formatTimestamp(timestamp)} | 
            <strong> AI Model:</strong> Google Gemini
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSafetyReport
