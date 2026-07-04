import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService, interviewService } from '../services'

export default function Interview() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [metrics, setMetrics] = useState({ clarity: 0, accuracy: 0, questionsAnswered: 0 })
  const [error, setError] = useState('')
  const [questionNum, setQuestionNum] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const chatContainerRef = useRef(null)
  const isStartingRef = useRef(false)
  const timerRef = useRef(null)
  const textareaRef = useRef(null)
  const user = authService.getUser()

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!session && !isStartingRef.current) startNewInterview()
  }, [user?._id, navigate, session])

  const startNewInterview = async () => {
    if (isStartingRef.current) return
    isStartingRef.current = true
    setLoading(true); setError('')
    try {
      const res = await interviewService.start()
      setSession(res.data.interviewId)
      setMessages(res.data.history || [])
    } catch (err) {
      setError(err.message || 'Failed to start interview')
    } finally {
      setLoading(false); isStartingRef.current = false
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, sending])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputVal.trim() || sending || !session) return
    const userMessage = inputVal.trim()
    setInputVal('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setSending(true); setError('')
    try {
      const res = await interviewService.chat({ interviewId: session, message: userMessage })
      setMessages(res.data.history)
      if (res.data.metrics) setMetrics(res.data.metrics)
      setQuestionNum(q => q + 1)
    } catch (err) {
      setError(err.message || 'Failed to send message')
      setMessages(prev => prev.slice(0, -1))
      setInputVal(userMessage)
    } finally {
      setSending(false)
    }
  }

  const handleEndInterview = () => {
    if (window.confirm('Are you sure you want to end this interview?')) navigate('/summary')
  }

  const handleTextareaChange = (e) => {
    setInputVal(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const confidence = Math.min(100, (metrics.clarity / 50) * 100)
  const totalScore = Math.min(100, metrics.accuracy + metrics.clarity)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface" style={{ position: 'relative' }}>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className={`flex flex-col h-full bg-surface-container-lowest border-r border-white/5 py-lg z-40 shrink-0 transition-all duration-300
        fixed md:static
        ${sidebarOpen ? 'left-0 w-72' : '-left-72 md:left-0 w-72'}
      `}>
        {/* Logo */}
        <div className="px-lg mb-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
            </div>
            <button className="md:hidden text-on-surface-variant hover:text-on-surface" onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest ml-8 mt-xs">Live Session</p>
        </div>

        {/* Live Status */}
        <div className="mx-lg mb-xl">
          <div className="glass-card rounded-xl p-md" style={{ boxShadow: '0 0 20px rgba(192,193,255,0.1)' }}>
            <div className="flex items-center gap-sm mb-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Interview Live</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="text-3xl font-bold font-display text-on-surface tabular-nums">{totalScore}</span>
              <span className="text-on-surface-variant text-sm">/100</span>
            </div>
            <div className="mt-sm">
              <div className="flex justify-between text-xs font-mono text-on-surface-variant mb-1">
                <span>Confidence</span>
                <span className="text-secondary">{confidence > 60 ? 'Optimal' : confidence > 30 ? 'Good' : 'Building'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* New Interview CTA */}
        <div className="px-lg mb-xl">
          <button
            onClick={startNewInterview}
            className="w-full py-md px-lg bg-white/5 border border-white/10 rounded-xl text-on-surface flex items-center justify-center gap-sm hover:bg-white/10 transition-all active:scale-[0.98] text-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Interview
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-sm overflow-y-auto custom-scrollbar">
          <div className="space-y-xs">
            <Link to="/dashboard" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all text-sm">
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Home</span>
            </Link>
            <div className="px-lg py-sm mt-sm mb-xs">
              <span className="text-xs font-mono text-outline-variant uppercase tracking-widest">Recent Sessions</span>
            </div>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg nav-active transition-all text-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              <span>Current Interview</span>
              <span className="ml-auto text-xs font-mono text-primary/60">{formatTime(elapsed)}</span>
            </a>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all text-sm">
              <span className="material-symbols-outlined text-base">analytics</span>
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all text-sm">
              <span className="material-symbols-outlined text-base">settings</span>
              <span>Settings</span>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-sm pt-md border-t border-white/5 space-y-xs">
          <div className="flex items-center gap-md px-lg py-md rounded-xl hover:bg-white/5 transition-all cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">{user?.name || 'User'}</span>
              <span className="text-xs font-mono text-outline-variant truncate">{user?.email || ''}</span>
            </div>
          </div>
          <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 transition-all text-sm">
            <span className="material-symbols-outlined text-base">help</span>
            <span>Support</span>
          </a>
          <button onClick={handleEndInterview} className="w-full flex items-center gap-md px-lg py-md rounded-lg text-error hover:bg-error/5 transition-all text-sm">
            <span className="material-symbols-outlined text-base">stop_circle</span>
            <span>End Interview</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ───────────────────────────────────────────── */}
      <main className="relative flex-1 flex flex-col h-full bg-background overflow-hidden">

        {/* Top Bar */}
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-md md:px-xl bg-background/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-sm md:gap-xl">
            {/* Mobile menu toggle */}
            <button className="md:hidden text-on-surface-variant hover:text-on-surface" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Progress */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-outline-variant uppercase mb-0.5 hidden md:block">Progress</span>
              <div className="flex items-center gap-xs">
                <span className="text-sm md:text-base font-bold text-primary">Q{questionNum}</span>
                <span className="text-xs text-on-surface-variant hidden md:inline">/ 10</span>
              </div>
            </div>

            {/* Confidence bar — desktop */}
            <div className="hidden md:flex flex-col min-w-[140px]">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-mono text-outline-variant uppercase">Confidence</span>
                <span className="text-xs font-mono text-secondary">{confidence > 60 ? 'Optimal' : confidence > 30 ? 'Good' : 'Building'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>

          {/* Center Score — desktop */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center">
            <span className="text-xs font-mono text-outline-variant uppercase mb-0.5">Current Score</span>
            <div className="flex items-center gap-sm">
              <span className="text-3xl font-bold font-display text-on-surface tabular-nums">{totalScore}</span>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/20 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                {metrics.questionsAnswered}
              </div>
            </div>
          </div>

          {/* Timer + End */}
          <div className="flex items-center gap-sm md:gap-lg">
            <div className="flex items-center gap-sm text-xs font-mono text-on-surface-variant bg-white/5 px-3 py-2 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-sm text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span className="tabular-nums">{formatTime(elapsed)}</span>
            </div>
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-1 md:gap-sm px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-mono hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              <span className="hidden md:inline">End Interview</span>
            </button>
          </div>
        </header>

        {/* Conversation Canvas */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar px-md md:px-xl pt-xl pb-48">
          <div className="max-w-3xl mx-auto space-y-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-mono text-sm animate-pulse">Initializing AI Interviewer...</p>
              </div>
            ) : !session && error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <span className="material-symbols-outlined text-error text-5xl">error</span>
                <p className="text-on-surface-variant text-sm">{error}</p>
                <button onClick={startNewInterview} className="px-lg py-md bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-all flex items-center gap-sm">
                  <span className="material-symbols-outlined">refresh</span> Retry
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(192,193,255,0.2)' }}>
                  <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <p className="text-on-surface-variant font-mono text-sm">Waiting for interview to begin...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-md md:gap-lg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-surface-container-highest border border-white/10'
                      : 'bg-primary-container'
                  }`} style={msg.role !== 'user' ? { boxShadow: '0 0 20px rgba(192,193,255,0.2)' } : {}}>
                    <span className="material-symbols-outlined text-sm" style={msg.role !== 'user' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {msg.role === 'user' ? 'person' : 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <h3 className="text-xs font-mono text-outline-variant uppercase mb-sm tracking-widest">
                      {msg.role === 'user' ? (user?.name || 'You') : 'InterviewIQ AI'}
                    </h3>
                    {msg.role === 'assistant' && msg.feedback && (
                      <div className="mb-sm p-sm rounded-lg bg-secondary/5 border border-secondary/20 text-xs text-secondary font-mono italic">
                        "{msg.feedback}"
                      </div>
                    )}
                    <div className={`text-base md:text-lg leading-relaxed ${
                      msg.role === 'user' ? 'text-on-surface-variant' : 'text-on-surface'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Sending indicator */}
            {sending && (
              <div className="flex items-center gap-md py-md px-lg bg-surface-container-low rounded-2xl w-fit border border-white/5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-mono text-on-surface-variant">Analyzing sentiment & technical depth...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 w-full px-md md:px-xl pb-md pt-16 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-sm flex items-center gap-sm p-sm rounded-lg bg-error-container/30 border border-error/30 text-error text-xs font-mono">
                <span className="material-symbols-outlined text-sm">warning</span>
                {error}
              </div>
            )}
            <form onSubmit={handleSend}>
              <div className="glass-panel border-white/10 rounded-2xl p-md transition-all focus-within:border-primary/30 focus-within:shadow-[0_0_30px_rgba(192,193,255,0.1)]">
                <textarea
                  ref={textareaRef}
                  value={inputVal}
                  onChange={handleTextareaChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                  }}
                  disabled={sending || loading}
                  placeholder="Type your answer here... (Enter to submit, Shift+Enter for new line)"
                  className="w-full bg-transparent border-none outline-none text-on-surface placeholder:text-outline-variant resize-none text-base py-1 disabled:opacity-50 min-h-[44px] leading-relaxed"
                  rows={1}
                  style={{ maxHeight: '160px' }}
                />
                <div className="flex items-center justify-between mt-sm pt-sm border-t border-white/5">
                  <div className="flex items-center gap-md">
                    <button type="button" className="text-outline-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5">
                      <span className="material-symbols-outlined text-xl">attach_file</span>
                    </button>
                    <button type="button" className="text-outline-variant hover:text-secondary transition-colors flex items-center gap-sm group p-1 rounded-lg hover:bg-white/5">
                      <span className="material-symbols-outlined text-xl">mic</span>
                      <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">Voice</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="text-xs font-mono text-outline-variant hidden md:block">{inputVal.length} chars</span>
                    <button
                      type="submit"
                      disabled={!inputVal.trim() || sending || loading}
                      className="bg-primary text-on-primary font-bold px-lg py-sm rounded-xl flex items-center gap-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-sm"
                    >
                      <span className="hidden md:inline">Submit</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-center mt-sm text-xs font-mono text-outline-variant opacity-50">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd> to submit · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Shift+Enter</kbd> for new line
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
