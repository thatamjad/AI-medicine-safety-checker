import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'

function AdvancedSafetyReport({ report, medicineName, patientInfo }) {
  if (!report) {
    return (
      <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <p>No analysis data available.</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  };

  return (
    <div className="report-document">
      <div className="report-header">
        <div className="report-title-meta">Safety Analysis Report</div>
        <h2 className="serif-heading" style={{ fontSize: '2.5rem' }}>{medicineName}</h2>

        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
          <span className={`risk-badge risk-${report.riskLevel?.toLowerCase() || 'unknown'}`}>
            Risk: {report.riskLevel || 'Unknown'}
          </span>
          <span className="risk-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
            Confidence: {report.confidenceLevel || 'Moderate'}
          </span>
        </div>
      </div>

      <div className="report-body">
        {/* Executive Summary */}
        {report.summary && (
          <div className="report-section">
            <h3>Summary</h3>
            <div className="report-section-content">
              <ReactMarkdown>{report.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="features-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Primary Safety Sections */}
          <div className="bento-card">
            <h4 style={{ color: 'var(--text-primary)', fontVariant: 'small-caps', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>
              Women's Health
            </h4>
            <div className="report-section-content" style={{ fontSize: '0.9375rem' }}>
              <ReactMarkdown>{report.womensSafety}</ReactMarkdown>
            </div>
          </div>

          <div className="bento-card">
            <h4 style={{ color: 'var(--text-primary)', fontVariant: 'small-caps', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>
              Pediatric Safety
            </h4>
            <div className="report-section-content" style={{ fontSize: '0.9375rem' }}>
              <ReactMarkdown>{report.pediatricSafety}</ReactMarkdown>
            </div>
          </div>

          <div className="bento-card" style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ color: 'var(--text-primary)', fontVariant: 'small-caps', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>
              Pregnancy & Lactation
            </h4>
            <div className="report-section-content" style={{ fontSize: '0.9375rem' }}>
              <ReactMarkdown>{report.pregnancySafety}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Side Effects */}
        {report.sideEffects && typeof report.sideEffects === 'object' && (
          <div className="report-section">
            <h3>Side Effect Profile</h3>
            <div className="report-section-content">
              {report.sideEffects.summary && (
                <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
                  {report.sideEffects.summary}
                </p>
              )}

              <div style={{ display: 'grid', gap: 'var(--space-xl)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {report.sideEffects.common && report.sideEffects.common.length > 0 && (
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>Common</h5>
                    <ul style={{ margin: '0', paddingLeft: 'var(--space-lg)' }}>
                      {report.sideEffects.common.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.sideEffects.serious && report.sideEffects.serious.length > 0 && (
                  <div>
                    <h5 style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-xs)' }}>Serious</h5>
                    <ul style={{ margin: '0', paddingLeft: 'var(--space-lg)' }}>
                      {report.sideEffects.serious.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Sections Grid */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 'var(--space-2xl)' }}>
          <div className="bento-card">
            <h4 style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-sm)' }}>Contraindications</h4>
            <div className="report-section-content" style={{ fontSize: '0.875rem' }}>
              <ReactMarkdown>{report.contraindications}</ReactMarkdown>
            </div>
          </div>

          <div className="bento-card">
            <h4 style={{ color: 'var(--accent-base)', marginBottom: 'var(--space-sm)' }}>Dosing Guidelines</h4>
            <div className="report-section-content" style={{ fontSize: '0.875rem' }}>
              <ReactMarkdown>{report.dosing}</ReactMarkdown>
            </div>
          </div>

          <div className="bento-card">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>Monitoring</h4>
            <div className="report-section-content" style={{ fontSize: '0.875rem' }}>
              <ReactMarkdown>{report.monitoring}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Clinical Trials */}
        <div className="report-section">
          <h3>Evidence Base</h3>
          <div className="report-section-content">
            <ReactMarkdown>{report.clinicalTrials}</ReactMarkdown>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="medical-disclaimer" style={{ marginTop: 'var(--space-3xl)' }}>
          <h4 style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-sm)', fontSize: '1rem', fontWeight: '600' }}>Medical Disclaimer</h4>
          <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            This AI-generated analysis is for educational purposes only and
            must not replace professional medical advice, diagnosis, or treatment. Always consult
            qualified healthcare providers for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSafetyReport
