import { Link } from 'react-router-dom'

const Landing = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero-section">
                <span className="stat-label" style={{ marginBottom: '1rem', display: 'block' }}>Powered by Perplexity AI & Gemini</span>
                <h1 className="hero-title">
                    <span>Intelligent</span>
                    <span>Drug Safety.</span>
                </h1>
                <p className="hero-description">
                    A global platform for exploring medication interactions, documenting safety insights, and building resilient health knowledge.
                </p>
                <div className="hero-actions">
                    <Link to="/analyze" className="btn-primary">
                        Start Analysis
                    </Link>
                    <Link to="/interactions" className="btn-secondary">
                        Check Interactions
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="content-container stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">2</div>
                        <div className="stat-label">AI Models</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">5s</div>
                        <div className="stat-label">Avg Response</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">Privacy Focused</div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="features-section content-container">
                <div className="page-header" style={{ textAlign: 'left', padding: '0 0 var(--space-xl)' }}>
                    <h2 className="serif-heading">Comprehensive Safety.</h2>
                    <p className="lead-text" style={{ marginTop: 'var(--space-md)' }}>
                        Advanced analysis covering specialized health domains and complex interactions.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="bento-card feature-card">
                        <h3 className="feature-title">Drug Interactions</h3>
                        <p className="feature-desc">
                            Identify negative combinations and severity risks between multiple medications effortlessly.
                        </p>
                    </div>

                    <div className="bento-card feature-card">
                        <h3 className="feature-title">Women's Health</h3>
                        <p className="feature-desc">
                            Specialized insights for pregnancy, breastfeeding, and hormonal interactions.
                        </p>
                    </div>

                    <div className="bento-card feature-card">
                        <h3 className="feature-title">Pediatric Safety</h3>
                        <p className="feature-desc">
                            Age-appropriate dosing flags and developmental safety considerations for children.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Landing
