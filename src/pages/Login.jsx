import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Brain, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services'

export default function Login() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col transition-colors duration-300">
      {/* Grid background */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      {/* Glow blobs */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Fixed header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Intervue<span className="text-cyan-500">.AI</span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
            bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
            text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400
            shadow-sm hover:shadow-neon-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-dark-700/80 border border-gray-200 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-none backdrop-blur-sm p-8 transition-colors duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to continue your interview prep</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm
                      bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                      text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                      transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                id="login-btn"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm
                  bg-cyan-500 hover:bg-cyan-400 shadow-neon-sm hover:shadow-neon
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 active:scale-95"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 dark:text-gray-500">
                <span className="px-3 bg-white dark:bg-dark-700/80">Don't have an account?</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              New here?{' '}
              <Link to="/signup" className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-cyan-500/70 hover:text-cyan-500">Terms</a> &amp;{' '}
            <a href="#" className="text-cyan-500/70 hover:text-cyan-500">Privacy Policy</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-600">© 2026 Intervue.AI. All rights reserved.</p>
      </footer>
    </div>
  )
}
