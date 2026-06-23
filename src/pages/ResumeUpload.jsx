import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, FileText, X, Brain, Sun, Moon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services'

export default function ResumeUpload() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { message, extractedText, filePath }

  const user = authService.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  const handleFile = (f) => {
    setError('')
    setResult(null)
    if (f && f.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }
    if (f && f.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const removeFile = () => {
    setFile(null)
    setError('')
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('intervue_token')
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', user._id)

      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      setResult(data)
      setFile(null)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col transition-colors duration-300">
      {/* Background */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
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

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-dark-700/80 border border-gray-200 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-none backdrop-blur-sm p-8 transition-colors duration-300">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-cyan-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Upload Your Resume</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload a PDF resume and we'll extract your skills for AI-tailored interview prep
              </p>
            </div>

            {/* Success Result */}
            {result && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{result.message}</span>
                </div>

                {/* Extracted Text Preview */}
                {result.extractedText && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      📄 Extracted Resume Content
                    </h3>
                    <div className="max-h-64 overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                      {result.extractedText.length > 3000
                        ? result.extractedText.substring(0, 3000) + '\n\n... (truncated)'
                        : result.extractedText}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {result.extractedText.length.toLocaleString()} characters extracted
                      {result.parsingStatus === 'success' && ' • ✅ Parsing complete'}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setFile(null) }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium
                    border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10
                    transition-all duration-200"
                >
                  Upload Another Resume
                </button>
              </div>
            )}

            {/* Upload Area (shown when no result) */}
            {!result && (
              <div className="space-y-5">
                {/* Drop Zone */}
                {!file ? (
                  <label
                    htmlFor="resume-pdf"
                    onDrop={handleDrop}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    className={`flex flex-col items-center justify-center gap-3 w-full py-10 px-4 rounded-2xl cursor-pointer
                      border-2 border-dashed transition-all duration-200 group
                      ${dragActive
                        ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/5'
                        : 'border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/3 hover:border-cyan-500/50 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/5'
                      }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-cyan-500 transition-colors">
                        Click to upload or drag & drop
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF only • Max 5 MB</p>
                    </div>
                    <input
                      id="resume-pdf"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl
                    bg-cyan-500/10 border border-cyan-500/30 dark:border-cyan-500/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-500">{error}</span>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm
                    bg-cyan-500 enabled:hover:bg-cyan-400 shadow-neon-sm enabled:hover:shadow-neon
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 active:scale-95
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Parse Resume
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            Your resume data is used only for generating personalized interview questions.
          </p>
        </div>
      </main>
    </div>
  )
}
