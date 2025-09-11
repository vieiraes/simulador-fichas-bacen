import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import PixSucesso from './pages/PixSucesso'
import PixFalha from './pages/PixFalha'
import ChaveSucesso from './pages/ChaveSucesso'
import ChaveFalha from './pages/ChaveFalha'

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pix/sucesso" element={<PixSucesso />} />
            <Route path="/pix/falha" element={<PixFalha />} />
            <Route path="/chave/sucesso" element={<ChaveSucesso />} />
            <Route path="/chave/falha" element={<ChaveFalha />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App