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

  const chatContainerRef = useRef(null)
  const isStartingRef = useRef(false)
  const timerRef = useRef(null)
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

  const confidence = Math.min(100, (metrics.clarity / 50) * 100)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface">
      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="flex flex-col h-full w-72 bg-surface-container-lowest border-r border-white/5 py-lg z-20 shrink-0">
        {/* Logo */}
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            <h1 className="text-2xl font-bold font-display text-primary tracking-tighter">InterviewIQ</h1>
          </div>
          <p className="text-xs font-mono text-on-surface-variant opacity-50 uppercase tracking-widest">Premium Tier</p>
        </div>

        {/* New Interview CTA */}
        <div className="px-lg mb-xl">
          <button
            onClick={startNewInterview}
            className="w-full py-md px-lg bg-white/5 border border-white/10 rounded-xl text-on-surface flex items-center justify-center gap-sm hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Start New Interview
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-sm overflow-y-auto custom-scrollbar">
          <div className="space-y-xs">
            <Link to="/dashboard" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Home</span>
            </Link>
            <div className="px-lg py-sm mt-md mb-xs">
              <span className="text-xs font-mono text-outline-variant uppercase">Recent Sessions</span>
            </div>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg nav-active transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              <span>Current Interview</span>
            </a>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
              <span className="material-symbols-outlined">analytics</span>
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-sm pt-md border-t border-white/5">
          <div className="flex items-center gap-md px-lg py-md rounded-xl hover:bg-white/5 transition-all cursor-pointer mb-md">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">{user?.name || 'User'}</span>
              <span className="text-xs font-mono text-outline-variant truncate">{user?.email || ''}</span>
            </div>
          </div>
          <div className="space-y-xs">
            <a href="#" className="flex items-center gap-md px-lg py-md rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </a>
            <button onClick={handleEndInterview} className="w-full flex items-center gap-md px-lg py-md rounded-lg text-error hover:bg-error/5 transition-all">
              <span className="material-symbols-outlined">stop_circle</span>
              <span>End Interview</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ───────────────────────────────────────── */}
      <main className="relative flex-1 flex flex-col h-full bg-background overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-xl bg-background/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-xl">
            {/* Progress */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-outline-variant uppercase mb-1">Progress</span>
              <div className="flex items-center gap-xs">
                <span className="text-base font-bold text-primary">Question {questionNum}</span>
                <span className="text-xs text-on-surface-variant">/ 10</span>
              </div>
            </div>
            {/* Confidence */}
            <div className="flex flex-col min-w-[140px]">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-mono text-outline-variant uppercase">Confidence</span>
                <span className="text-xs font-mono text-secondary">
                  {confidence > 60 ? 'Optimal' : confidence > 30 ? 'Good' : 'Building'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>

          {/* Center Score */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-xs font-mono text-outline-variant uppercase mb-xs">Current Score</span>
            <div className="flex items-center gap-sm">
              <span className="text-3xl font-bold font-display text-on-surface">{metrics.accuracy + metrics.clarity}</span>
              <div className="flex items-center text-primary text-xs font-bold bg-primary/20 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                {metrics.questionsAnswered}
              </div>
            </div>
          </div>

          {/* Timer + End */}
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-sm text-xs font-mono text-on-surface-variant bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-sm text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              {formatTime(elapsed)}
            </div>
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-sm px-4 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-mono hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              End Interview
            </button>
          </div>
        </header>

        {/* Conversation Canvas */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar px-xl pt-xl pb-40">
          <div className="max-w-3xl mx-auto space-y-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-md">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
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
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center ai-glow">
                  <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <p className="text-on-surface-variant font-mono text-sm">Waiting for interview to begin...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-lg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-surface-container-highest border border-white/10'
                      : 'bg-primary-container ai-glow'
                  }`}>
                    <span className="material-symbols-outlined text-sm" style={msg.role !== 'user' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {msg.role === 'user' ? 'person' : 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xs font-mono text-outline-variant uppercase mb-sm">
                      {msg.role === 'user' ? (user?.name || 'You') : 'InterviewIQ AI'}
                    </h3>
                    {msg.role === 'assistant' && msg.feedback && (
                      <div className="mb-sm p-sm rounded-lg bg-secondary/5 border border-secondary/20 text-xs text-secondary font-mono italic">
                        "{msg.feedback}"
                      </div>
                    )}
                    <div className={`text-lg text-on-surface leading-relaxed ${
                      msg.role === 'user' ? 'text-on-surface-variant' : ''
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
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
                <span className="text-xs font-mono text-on-surface-variant">Analyzing sentiment & technical depth...</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 w-full p-xl bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-sm flex items-center gap-sm p-sm rounded-lg bg-error-container/30 border border-error/30 text-error text-xs font-mono">
                <span className="material-symbols-outlined text-sm">warning</span>
                {error}
              </div>
            )}
            <form onSubmit={handleSend}>
              <div className="glass-panel border-white/10 rounded-2xl p-md ai-glow transition-all focus-within:border-primary/30">
                <textarea
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                  }}
                  disabled={sending || loading}
                  placeholder="Type your answer here or speak..."
                  className="w-full bg-transparent border-none outline-none text-on-surface placeholder:text-outline-variant resize-none text-base h-12 py-2 disabled:opacity-50"
                  rows={1}
                />
                <div className="flex items-center justify-between mt-md pt-sm border-t border-white/5">
                  <div className="flex items-center gap-md">
                    <button type="button" className="text-outline-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <button type="button" className="text-outline-variant hover:text-secondary transition-colors flex items-center gap-sm group">
                      <span className="material-symbols-outlined">mic</span>
                      <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">Voice Input</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || sending || loading}
                    className="bg-primary text-on-primary font-bold px-lg py-md rounded-xl flex items-center gap-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <span>Submit Answer</span>
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
              <p className="text-center mt-md text-xs font-mono text-outline-variant opacity-60">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Enter</kbd> to submit. Talk naturally as if in a real meeting.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
