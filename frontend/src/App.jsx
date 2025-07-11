import { useState } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import AccessibilityEnhancements from './components/AccessibilityEnhancements'
import './styles/components.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <AccessibilityEnhancements>
      <div className="app">
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <div className="nav-container">
            <div className="nav-brand">
              <span className="brand-icon" aria-hidden="true">🏥</span>
              <h1>AI Medicine Safety Checker</h1>
            </div>
            <div className="nav-links" role="tablist">
              <button 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentPage('home')}
                role="tab"
                aria-selected={currentPage === 'home'}
                aria-controls="main-content"
              >
                Home
              </button>
              <button 
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => setCurrentPage('about')}
                role="tab"
                aria-selected={currentPage === 'about'}
                aria-controls="main-content"
              >
                About
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content" role="main">
          {currentPage === 'home' && <Home />}
          {currentPage === 'about' && <About />}
        </main>

        <footer className="footer" role="contentinfo">
          <div className="footer-content">
            <p>&copy; 2025 AI Medicine Safety Checker. For informational purposes only.</p>
            <p className="footer-disclaimer">
              Always consult with healthcare professionals before making medical decisions.
            </p>
          </div>
        </footer>
      </div>
    </AccessibilityEnhancements>
  )
}

export default App
