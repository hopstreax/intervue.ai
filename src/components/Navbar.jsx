import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiMoon, HiSun, HiMenu, HiX, HiUser, HiLogout } from 'react-icons/hi'
import { TbBrain } from 'react-icons/tb'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services'

const navLinks = [
  { label: 'Dashboard', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Take Interview', href: '/#take-interview' },
]

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Track auth state — re-check on every route change
  const [user, setUser] = useState(authService.getUser())

  useEffect(() => {
    setUser(authService.getUser())
  }, [location])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 dark:border-cyan-500/10 bg-white/80 dark:bg-dark-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center group-hover:shadow-neon transition-all duration-300">
              <TbBrain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold dark:text-white text-gray-900">
              Intervue<span className="text-cyan-500">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === link.href
                    ? 'text-cyan-500 bg-cyan-500/10'
                    : 'text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10
                text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400
                border border-gray-200 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {isDark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
            </button>

            {/* Auth area — Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {/* User avatar + name */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white uppercase">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </div>
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                      text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40
                      transition-all duration-200"
                  >
                    <HiLogout className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium rounded-lg
                      text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400
                      hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-semibold rounded-lg
                      bg-cyan-500 hover:bg-cyan-400 text-white
                      shadow-neon-sm hover:shadow-neon transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center
                bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <HiX className="w-4 h-4" /> : <HiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/5 bg-white dark:bg-dark-800 px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300
                hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <div className="pt-2 space-y-3">
              {/* User info on mobile */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-all"
              >
                <HiLogout className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-200"
              >
                Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
