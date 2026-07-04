import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const token = params.get('token')
      const userStr = params.get('user')

      if (token && userStr) {
        const user = JSON.parse(decodeURIComponent(userStr))
        authService.oauthLogin(token, user)
        
        // Short timeout for visual transition flow
        const timer = setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        console.error('OAuth callback missing token or user params')
        navigate('/login?error=invalid_callback')
      }
    } catch (err) {
      console.error('Error handling OAuth callback:', err)
      navigate('/login?error=callback_error')
    }
  }, [location, navigate])

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <div className="glass-card max-w-md w-full mx-4 p-xl rounded-2xl border border-white/5 text-center flex flex-col items-center gap-lg relative z-10">
        {/* Loading Ring / Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        <div className="space-y-xs">
          <h2 className="text-xl font-bold font-display text-on-surface tracking-tight">
            Authenticating
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
            Securing your connection and fetching your dashboard...
          </p>
        </div>
      </div>
    </div>
  )
}
