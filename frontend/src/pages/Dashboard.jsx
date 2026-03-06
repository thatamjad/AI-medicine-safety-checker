import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnalysisHistory } from '../hooks/useAnalysisHistory'

function Dashboard() {
    const { history, deleteEntry, clearHistory, getStats } = useAnalysisHistory()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRisk, setFilterRisk] = useState('all')
    const [expandedId, setExpandedId] = useState(null)
    const stats = getStats()

    const filteredHistory = history.filter(entry => {
        const matchesSearch = entry.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRisk = filterRisk === 'all' || entry.riskLevel === filterRisk
        return matchesSearch && matchesRisk
    })

    const getRiskLabel = (level) => {
        return (level || 'unknown').charAt(0).toUpperCase() + (level || 'unknown').slice(1)
    }

    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="content-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="serif-heading page-title">History.</h1>
                <p className="page-description">
                    Track your medication safety analyses and review past results.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="features-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>{stats.totalAnalyses}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Analyses</div>
                </div>
                <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>{stats.mostChecked}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Most Checked</div>
                </div>
                <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                        {stats.avgRiskLevel !== 'N/A' ? getRiskLabel(stats.avgRiskLevel) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Risk Level</div>
                </div>
                <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px' }}>{stats.lastAnalysis}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Analysis</div>
                </div>
            </div>

            {/* Search and Filters */}
            {history.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="all">All Risks</option>
                            <option value="high">High Risk</option>
                            <option value="moderate">Moderate Risk</option>
                            <option value="low-moderate">Low-Moderate</option>
                            <option value="low">Low Risk</option>
                        </select>
                        <button className="btn-secondary" onClick={clearHistory}>
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* History List */}
            {history.length === 0 ? (
                <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-4xl) var(--space-xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}></div>
                    <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>No Analyses Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Your analysis history will appear here.</p>
                    <Link to="/analyze" className="btn-primary">
                        Start First Analysis
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {filteredHistory.length === 0 ? (
                        <div className="bento-card" style={{ textAlign: 'center', padding: 'var(--space-3xl) var(--space-xl)' }}>
                            <h3 className="serif-heading" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>No Results Found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filter criteria.</p>
                        </div>
                    ) : (
                        filteredHistory.map(entry => (
                            <div className="bento-card history-card" key={entry.id} onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                                <div className="history-header">
                                    <div>
                                        <h4 className="history-medicine">{entry.medicineName}</h4>
                                        <span className="history-date">{formatDate(entry.timestamp)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <span className={`risk-badge risk-${entry.riskLevel.toLowerCase()}`}>
                                            {getRiskLabel(entry.riskLevel)}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {expandedId === entry.id ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            ) : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {expandedId === entry.id && (
                                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)' }}>
                                        {entry.patientInfo && Object.keys(entry.patientInfo).length > 0 && (
                                            <div style={{ marginBottom: 'var(--space-sm)' }}>
                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Context: </strong>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                                    {entry.patientInfo.isPregnant && 'Pregnant | '}
                                                    {entry.patientInfo.isBreastfeeding && 'Breastfeeding | '}
                                                    {entry.patientInfo.isChild && 'Pediatric | '}
                                                    Standard Adult
                                                </span>
                                            </div>
                                        )}

                                        {entry.summary && (
                                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Summary: </strong>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: 'var(--space-xs)' }}>
                                                    {typeof entry.summary === 'string' ? entry.summary : 'Detailed analysis data saved.'}
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn-secondary" onClick={(e) => {
                                                e.stopPropagation()
                                                deleteEntry(entry.id)
                                            }} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-bg)' }}>
                                                Delete Entry
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default Dashboard
