import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResumeUpload from './pages/ResumeUpload'
import Interview from './pages/Interview'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/interview" element={<Interview />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

