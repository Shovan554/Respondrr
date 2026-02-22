import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoadingPage from './components/LoadingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import PatientDashboard from './components/PatientDashboard'
import RespondrDashboard from './components/RespondrDashboard'
import AccountPage from './components/AccountPage'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <Router>
      <div className="antialiased font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/respondr-dashboard" element={<RespondrDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
