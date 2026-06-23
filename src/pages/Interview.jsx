import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send, Brain, Bot, User, CheckCircle2, AlertCircle, RefreshCw, BarChart2, Pause, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authService, interviewService } from '../services'

export default function Interview() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [metrics, setMetrics] = useState({ clarity: 0, accuracy: 0, questionsAnswered: 0 })
  const [error, setError] = useState('')

  const chatContainerRef = useRef(null)
  const isStartingRef = useRef(false)
  const user = authService.getUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Only run if we aren't already starting and don't already have a session
    if (!session && !isStartingRef.current) {
      startNewInterview()
    }
  // Use primitive user ID instead of the unstable parsed object reference
  }, [user?._id, navigate, session])

  const startNewInterview = async () => {
    if (isStartingRef.current) return
    isStartingRef.current = true

    console.log('[Interview UI] Initializing startNewInterview flow...');
    setLoading(true)
    setError('')
    try {
      const res = await interviewService.start()
      console.log('[Interview UI] Session started successfully:', res.data.interviewId);
      setSession(res.data.interviewId)
      setMessages(res.data.history || [])
    } catch (err) {
      console.error('[Interview UI] Failed to start session:', err);
      setError(err.message || 'Failed to start interview')
    } finally {
      setLoading(false)
      isStartingRef.current = false
    }
  }

  // Auto-scroll to bottom of chat
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
    
    // Optimistically update UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setSending(true)
    setError('')

    try {
      const res = await interviewService.chat({
        interviewId: session,
        message: userMessage
      })

      setMessages(res.data.history)
      if (res.data.metrics) {
        setMetrics(res.data.metrics)
      }
    } catch (err) {
      setError(err.message || 'Failed to send message')
      // Revert optimistic update on failure
      setMessages(prev => prev.slice(0, -1))
      setInputVal(userMessage)
    } finally {
      setSending(false)
    }
  }

  const handleEndInterview = () => {
    if (window.confirm("Are you sure you want to end this interview?")) {
      navigate('/')
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-dark-900 flex flex-col transition-colors duration-300 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block">
              Intervue<span className="text-cyan-500">.AI</span>
            </span>
          </Link>
          <div className="h-6 w-px bg-gray-300 dark:bg-white/20 mx-2 hidden sm:block"></div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">AI Interview Session</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Candidate: {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleEndInterview} className="px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 relative z-10 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left/Center: Chat Interface */}
        <section className="flex-1 flex flex-col bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-none overflow-hidden">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-cyan-500">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium animate-pulse text-gray-600 dark:text-gray-300">Initializing LLaMA Interview Agent...</p>
              </div>
            ) : !session && error ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
                <AlertCircle className="w-10 h-10" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Agent initialization failed: {error}</p>
                <button 
                  onClick={startNewInterview}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-semibold flex items-center gap-2 transition-all shadow-md"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Connection
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>No messages yet.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.role === 'user' ? (
                      <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user' 
                      ? 'bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-gray-800 dark:text-gray-100' 
                      : 'bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200'
                  }`}>
                    {msg.role === 'assistant' && msg.feedback && (
                      <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600/50">
                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AI Feedback
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{msg.feedback}"</p>
                      </div>
                    )}
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {sending && (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-white/10">
            {error && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSend} className="relative">
              <textarea
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                disabled={sending || loading}
                placeholder="Type your answer... (Press Enter to send)"
                className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-white/10 rounded-xl pl-4 pr-14 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none transition-all disabled:opacity-50 min-h-[60px] max-h-[150px]"
                rows="2"
              />
              <button 
                type="submit"
                disabled={!inputVal.trim() || sending || loading}
                className="absolute right-3 bottom-3 p-2 rounded-lg bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 active:scale-95 transition-all shadow-neon-sm focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Right Panel: Metrics & Stats */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white">
              <BarChart2 className="w-5 h-5 text-cyan-500" />
              <h2 className="font-semibold text-lg">Live Performance</h2>
            </div>

            <div className="space-y-5">
              {/* Stat 1 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-gray-600 dark:text-gray-400">Technical Accuracy</span>
                  <span className="text-cyan-600 dark:text-cyan-400">{metrics.accuracy} pts</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.accuracy / 50) * 100)}%` }}></div>
                </div>
              </div>

              {/* Stat 2 */}
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-gray-600 dark:text-gray-400">Communication Clarity</span>
                  <span className="text-violet-600 dark:text-violet-400">{metrics.clarity} pts</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (metrics.clarity / 50) * 100)}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Questions Answered
                </span>
                <span className="font-bold text-gray-800 dark:text-white text-lg">{metrics.questionsAnswered}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-500" /> LLaMA-3 Engine
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Your interview is powered by meta-llama/Llama-3.1-8B-Instruct. The AI dynamically crafts questions based on your resume and adjusts difficulty in real time according to your answers.
            </p>
          </div>
        </aside>

      </main>
    </div>
  )
}
