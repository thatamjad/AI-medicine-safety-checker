import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Analysis from './pages/Analysis'
import Interactions from './pages/Interactions'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import './styles/main.css'
import './styles/components.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analysis />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/history" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
