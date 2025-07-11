function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="loading-content">
          <h3>Analyzing Medicine Safety...</h3>
          <p>Our AI is reviewing medical literature and safety data</p>
          <div className="loading-steps">
            <div className="step">
              <span className="step-icon">🔍</span>
              <span>Searching medical databases</span>
            </div>
            <div className="step">
              <span className="step-icon">👩‍⚕️</span>
              <span>Analyzing women's health data</span>
            </div>
            <div className="step">
              <span className="step-icon">👶</span>
              <span>Reviewing pediatric safety</span>
            </div>
            <div className="step">
              <span className="step-icon">🤱</span>
              <span>Checking pregnancy safety</span>
            </div>
            <div className="step">
              <span className="step-icon">📊</span>
              <span>Compiling safety report</span>
            </div>
          </div>
          <div className="loading-note">
            <small>This usually takes 10-30 seconds</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
