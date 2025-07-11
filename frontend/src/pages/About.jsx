function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h2>About AI Medicine Safety Checker</h2>
        
        <div className="about-content">
          <section className="about-section">
            <h3>🎯 Our Mission</h3>
            <p>
              We provide AI-powered medication safety analysis with a special focus on 
              women's and children's health. Our goal is to make important safety 
              information more accessible while always encouraging consultation with 
              healthcare professionals.
            </p>
          </section>

          <section className="about-section">
            <h3>🔬 What We Analyze</h3>
            <ul>
              <li><strong>Women's Health:</strong> Hormonal interactions, reproductive health impacts, and gender-specific considerations</li>
              <li><strong>Pediatric Safety:</strong> Age-appropriate dosing, developmental considerations, and child-specific risks</li>
              <li><strong>Pregnancy Safety:</strong> FDA categories, teratogenic risks, and breastfeeding considerations</li>
              <li><strong>Clinical Trials:</strong> Information about drug testing in specific populations</li>
            </ul>
          </section>

          <section className="about-section">
            <h3>🤖 Technology</h3>
            <p>
              Our analysis is powered by Google's Gemini 2.5 Flash AI, which processes 
              vast amounts of medical literature and safety data to provide comprehensive 
              safety assessments. The AI is specifically trained to focus on gender and 
              age-specific medical considerations.
            </p>
          </section>

          <section className="about-section">
            <h3>⚠️ Important Limitations</h3>
            <div className="warning-box">
              <h4>This tool is for informational purposes only:</h4>
              <ul>
                <li>Not a substitute for professional medical advice</li>
                <li>Does not replace medication packaging information</li>
                <li>Should not be used for emergency medical decisions</li>
                <li>Always consult healthcare providers for medical guidance</li>
              </ul>
            </div>
          </section>

          <section className="about-section">
            <h3>🛡️ Privacy & Safety</h3>
            <p>
              We do not store personal health information. All queries are processed 
              securely and are not retained after analysis. We prioritize user privacy 
              while providing valuable health insights.
            </p>
          </section>

          <section className="about-section">
            <h3>📞 Emergency Resources</h3>
            <div className="emergency-info">
              <p><strong>For medical emergencies:</strong> Call 911 (US) or your local emergency number</p>
              <p><strong>Poison Control:</strong> 1-800-222-1222 (US)</p>
              <p><strong>For medication questions:</strong> Consult your pharmacist or healthcare provider</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About
