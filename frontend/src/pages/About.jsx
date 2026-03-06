import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 className="serif-heading page-title">About MedSafe.</h1>
        <p className="page-description">
          AI-powered medication safety, built with care for everyone.
        </p>
      </div>

      <div className="features-grid">
        <div className="bento-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="serif-heading" style={{ fontSize: '1.75rem', marginBottom: 'var(--space-md)' }}>Our Mission</h3>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            We provide AI-powered medication safety analysis with a special focus on
            women's and children's health. Our goal is to make important safety
            information more accessible while always encouraging consultation with
            healthcare professionals.
          </p>
        </div>

        <div className="bento-card">
          <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>What We Analyze</h3>
          <ul style={{ paddingLeft: 'var(--space-lg)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Women's Health:</strong> Hormonal interactions, reproductive health impacts</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Pediatric Safety:</strong> Age-appropriate dosing, developmental considerations</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Pregnancy Safety:</strong> FDA categories, teratogenic risks, breastfeeding</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Drug Interactions:</strong> Multi-drug severity analysis</li>
          </ul>
        </div>

        <div className="bento-card">
          <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Technology Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <span className="risk-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>Perplexity AI</span>
            <span className="risk-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>Google Gemini</span>
            <span className="risk-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>React 18</span>
            <span className="risk-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>Node.js / Express</span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Our analysis is powered by highly capable AI models with intelligent fallback,
            ensuring reliable and up-to-date results.
          </p>
        </div>

        <div className="bento-card" style={{ background: 'var(--color-warning-bg)', borderColor: 'rgba(217, 119, 6, 0.2)' }}>
          <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)', color: 'var(--color-warning)' }}>Important Limitations</h3>
          <ul style={{ paddingLeft: 'var(--space-lg)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li>Not a substitute for professional medical advice</li>
            <li>Does not replace medication packaging information</li>
            <li>Should not be used for emergency medical decisions</li>
            <li>Always consult healthcare providers for medical guidance</li>
          </ul>
        </div>

        <div className="bento-card" style={{ background: 'var(--color-danger-bg)', borderColor: 'rgba(225, 29, 72, 0.2)' }}>
          <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)', color: 'var(--color-danger)' }}>Emergency Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 'var(--space-xs)' }}>Medical Emergency:</strong>
              <span style={{ color: 'var(--text-primary)' }}>Call 911 (US) or your local emergency number</span>
            </div>
            <div>
              <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 'var(--space-xs)' }}>Poison Control:</strong>
              <span style={{ color: 'var(--text-primary)' }}>1-800-222-1222 (US)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-4xl)', paddingTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-light)' }}>
        <h3 className="serif-heading" style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)' }}>Ready to get started?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
          <Link to="/analyze" className="btn-primary">
            Analyze a Medicine
          </Link>
          <Link to="/interactions" className="btn-secondary">
            Check Interactions
          </Link>
        </div>
      </div>
    </div>
  )
}

export default About
