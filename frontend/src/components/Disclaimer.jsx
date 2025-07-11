function Disclaimer() {
  return (
    <div className="disclaimer-container">
      <div className="disclaimer-card">
        <div className="disclaimer-header">
          <span className="disclaimer-icon">⚠️</span>
          <h3>Important Medical Disclaimer</h3>
        </div>
        
        <div className="disclaimer-content">
          <p>
            <strong>This tool provides educational information only and is not a substitute 
            for professional medical advice, diagnosis, or treatment.</strong>
          </p>
          
          <ul className="disclaimer-list">
            <li>Always consult your healthcare provider before making medical decisions</li>
            <li>Do not use this information to diagnose or treat medical conditions</li>
            <li>Medication effects can vary significantly between individuals</li>
            <li>For emergencies, call 911 or your local emergency number</li>
            <li>This analysis is based on general medical literature and may not reflect the most current information</li>
          </ul>
          
          <div className="emergency-contacts">
            <strong>Emergency Resources:</strong>
            <div className="contact-row">
              <span>🚨 Medical Emergency: 911 (US)</span>
              <span>☎️ Poison Control: 1-800-222-1222 (US)</span>
            </div>
          </div>
        </div>
        
        <div className="disclaimer-acknowledgment">
          <p>
            By using this tool, you acknowledge that you understand these limitations 
            and will seek appropriate medical guidance when needed.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Disclaimer
