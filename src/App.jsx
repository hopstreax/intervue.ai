import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResumeUpload from './pages/ResumeUpload'
import Interview from './pages/Interview'
import Summary from './pages/Summary'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/upload"    element={<ResumeUpload />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/summary"   element={<Summary />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
