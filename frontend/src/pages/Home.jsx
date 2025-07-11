import { useState } from 'react'
import MedicineInput from '../components/MedicineInput'
import AdvancedSafetyReport from '../components/AdvancedSafetyReport'
import InteractionChecker from '../components/InteractionChecker'
import InteractionResults from '../components/InteractionResults'
import LoadingSpinner from '../components/LoadingSpinner'
import Disclaimer from '../components/Disclaimer'
import { testConnection, directAPITest } from '../services/api'

function Home() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [interactionResult, setInteractionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('analysis') // 'analysis' or 'interactions'

  const handleAnalysisComplete = (result) => {
    console.log('Home: handleAnalysisComplete called with:', result);
    setAnalysisResult(result)
    setIsLoading(false)
    setError(null)
  }

  const handleAnalysisError = (errorMessage) => {
    console.error('Home: handleAnalysisError called with:', errorMessage);
    setError(errorMessage)
    setIsLoading(false)
    setAnalysisResult(null)
  }

  const handleAnalysisStart = () => {
    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)
  }

  const handleInteractionResult = (result) => {
    setInteractionResult(result)
    setError(null)
  }

  const handleInteractionError = (errorMessage) => {
    setError(errorMessage)
    setInteractionResult(null)
  }

  const handleNewAnalysis = () => {
    setAnalysisResult(null)
    setInteractionResult(null)
    setError(null)
    setIsLoading(false)
  }

  const testAPIConnection = async () => {
    console.log('Testing API connection...')
    try {
      const result = await directAPITest()
      console.log('API test result:', result)
      setError(null)
      alert('API connection successful!')
    } catch (error) {
      console.error('API test failed:', error)
      setError(`API Test Failed: ${error.message}`)
    }
  }

  const testDebugAnalysis = async () => {
    console.log('Testing debug analysis...')
    try {
      const response = await fetch('http://localhost:3001/api/medicine/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: 'debug-test' })
      })
      const result = await response.json()
      console.log('Debug analysis result:', result)
      
      // Test if frontend can handle the response
      if (result.success) {
        setAnalysisResult(result)
        setError(null)
        alert('Debug analysis successful! Check the results below.')
      } else {
        setError('Debug analysis failed')
      }
    } catch (error) {
      console.error('Debug analysis failed:', error)
      setError(`Debug Analysis Failed: ${error.message}`)
    }
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h2>Medication Safety Analysis</h2>
          <p className="hero-subtitle">
            AI-powered safety analysis focusing on women's and children's health
          </p>
        </div>
      </div>

      <div className="content-container">
        <Disclaimer />
        
        {/* Debug API Test Buttons */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <button onClick={testAPIConnection} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
            🔧 Test API Connection
          </button>
          <button onClick={testDebugAnalysis} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🧪 Test Debug Analysis
          </button>
          <small style={{ marginLeft: '10px', color: '#666' }}>Debug: Click to test backend connection and analysis display</small>
        </div>
        
        {/* Debug Analysis Test Button */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <button onClick={testDebugAnalysis} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🧪 Test Debug Analysis
          </button>
          <small style={{ marginLeft: '10px', color: '#666' }}>Debug: Click to run a test analysis</small>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            🔍 Medicine Analysis
          </button>
          <button 
            className={`tab-button ${activeTab === 'interactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('interactions')}
          >
            ⚠️ Drug Interactions
          </button>
        </div>

        {/* Medicine Analysis Tab */}
        {activeTab === 'analysis' && (
          <>
            {/* Always show this test div */}
            <div style={{
              padding: '10px', 
              backgroundColor: '#ffebee', 
              border: '2px solid #f44336', 
              margin: '10px 0',
              fontSize: '14px'
            }}>
              <strong>🔧 COMPONENT TEST:</strong><br/>
              - Active tab: {activeTab}<br/>
              - isLoading: {isLoading ? 'YES' : 'NO'}<br/>
              - analysisResult exists: {analysisResult ? 'YES' : 'NO'}<br/>
              - error exists: {error ? 'YES' : 'NO'}<br/>
              - Current state: {!analysisResult && !isLoading ? 'SHOWING INPUT' : analysisResult ? 'SHOWING RESULTS' : 'LOADING'}
            </div>

            {!analysisResult && !isLoading && (
              <MedicineInput 
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
              />
            )}

            {isLoading && <LoadingSpinner />}

            {analysisResult && (
              <div className="results-section" style={{
                border: '2px solid #4caf50',
                padding: '20px',
                margin: '10px 0',
                backgroundColor: '#f1f8e9'
              }}>
                <div style={{
                  padding: '10px', 
                  backgroundColor: '#e7f3ff', 
                  border: '1px solid #007bff', 
                  marginBottom: '10px',
                  fontSize: '12px'
                }}>
                  <strong>🔍 DEBUG INFO:</strong><br/>
                  analysisResult exists: {analysisResult ? 'YES' : 'NO'}<br/>
                  analysisResult.analysis exists: {analysisResult && analysisResult.analysis ? 'YES' : 'NO'}<br/>
                  Type: {typeof analysisResult}<br/>
                  Keys: {analysisResult ? Object.keys(analysisResult).join(', ') : 'none'}<br/>
                  {analysisResult && analysisResult.analysis && 
                    `Analysis keys: ${Object.keys(analysisResult.analysis).join(', ')}`
                  }
                </div>
                
                <h3 style={{ color: '#2e7d32' }}>📊 Analysis Results Section</h3>
                <p>This section should contain the AdvancedSafetyReport component.</p>
                
                <AdvancedSafetyReport result={analysisResult} />
                
                <div className="new-analysis-section">
                  <button className="new-analysis-button" onClick={handleNewAnalysis}>
                    Analyze Another Medicine
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Drug Interactions Tab */}
        {activeTab === 'interactions' && (
          <>
            {!interactionResult && (
              <InteractionChecker 
                onInteractionResult={handleInteractionResult}
                onError={handleInteractionError}
              />
            )}

            {interactionResult && (
              <div className="results-section">
                <InteractionResults result={interactionResult} />
                <div className="new-analysis-section">
                  <button className="new-analysis-button" onClick={handleNewAnalysis}>
                    Check More Interactions
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-container">
            <div className="error-message">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={handleNewAnalysis}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
