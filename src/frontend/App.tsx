import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import { SimulationProvider } from './context/SimulationContext'

function App() {
  return (
    <SimulationProvider>
      <Router>
        <div className="App">
          <Navigation />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </SimulationProvider>
  )
}

export default App