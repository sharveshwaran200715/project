import { useState } from 'react'
import { Sprout, Mail, Lock, ArrowLeft, AlertCircle, Loader2, Shield, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn, signInAsDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
    } else {
      navigate('/admin/dashboard')
    }
    setLoading(false)
  }

  function handleDemoAdmin() {
    signInAsDemo('admin')
    navigate('/admin/dashboard')
  }

  const isConnectionError = error?.includes('Failed to fetch') || error?.includes('paused')

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#0a2e1a 0%,#0f4a2a 100%)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/8 rounded-full -translate-y-36 translate-x-36 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full translate-y-28 -translate-x-28 blur-2xl" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <Sprout size={30} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-white tracking-tight">FarmWise</span>
              <p className="text-xs text-green-400/70 font-medium">Smart Farming AI</p>
            </div>
          </div>

          {/* Admin badge */}
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <Shield size={38} className="text-green-400" />
          </div>

          <h1 className="text-3xl font-black text-white mb-4 leading-tight">
            Admin Portal
          </h1>
          <p className="text-green-200/70 text-lg mb-10 leading-relaxed max-w-xs">
            Secure access to FarmWise platform administration and management tools.
          </p>

          {/* Feature list */}
          <div className="space-y-3 w-full max-w-xs text-left">
            {[
              'Farmer & User Management',
              'Subscription & Payment Overview',
              'Support Request Management',
              'Device Application Tracking',
              'Platform Analytics & Reports',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-green-200/70">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-6">
          <button
            id="admin-login-back-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to FarmWise
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Sprout size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FarmWise</span>
            </div>

            {/* Admin badge - mobile */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <Shield size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Admin Portal</h2>
                <p className="text-xs text-gray-500">Secure access to FarmWise administration</p>
              </div>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl mb-6">
              <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                This portal is restricted to authorized FarmWise administrators only. Unauthorized access attempts are logged.
              </p>
            </div>

            {/* Demo Admin Access Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <Sparkles size={16} className="text-emerald-600" />
                  Instant Demo Admin Access
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">No DB required</span>
              </div>
              <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
                Test and manage the platform immediately with an authorized administrator profile.
              </p>
              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={handleDemoAdmin}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Shield size={16} />
                Enter Admin Portal (Demo Mode)
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      {isConnectionError ? 'Supabase Connection Error' : 'Authentication Error'}
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                    {isConnectionError && (
                      <div className="mt-3 pt-2.5 border-t border-red-200/60 flex flex-col gap-2">
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          <ExternalLink size={13} /> Open Supabase Dashboard to Restore Project
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label">Admin Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="admin-email-input"
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="admin@farmwise.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="admin-password-input"
                    type={showPw ? 'text' : 'password'}
                    required
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                id="admin-sign-in-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Verifying credentials...</>
                ) : (
                  <><Shield size={18} /> Sign In to Admin Portal</>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Admin accounts are provisioned by the FarmWise operations team.<br />
              Contact your system administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
