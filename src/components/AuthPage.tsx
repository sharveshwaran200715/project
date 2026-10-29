import { useState } from 'react'
import { Sprout, Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useLang } from '../lib/i18n'

export default function AuthPage({ onBack }: { onBack: () => void }) {
  const { signIn, signUp, signInAsDemo } = useAuth()
  const { t } = useLang()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, fullName)
      if (error) setError(error)
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    }
    setLoading(false)
  }

  const isConnectionError = error?.includes('Failed to fetch') || error?.includes('paused')

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-28 -translate-x-28" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout size={26} />
            </div>
            <span className="text-2xl font-bold">FarmWise</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {mode === 'login' ? 'Welcome back to your smart farm' : 'Start your smart farming journey'}
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            AI-powered agricultural intelligence for better decisions, higher yields, and more profitable farming.
          </p>
          <ul className="space-y-3 text-primary-50">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-200" /> Weather forecasts with farming actions</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-200" /> AI crop disease detection</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-200" /> Smart irrigation & soil health</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-200" /> Profit calculator & market prices</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-200" /> Buyer matching marketplace</li>
          </ul>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Sprout size={22} />
              </div>
              <span className="text-xl font-bold text-gray-900">FarmWise</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? t('auth.login') : t('auth.signup')}
            </h2>
            <p className="text-gray-500 mb-6">
              {mode === 'login' ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                {mode === 'login' ? t('auth.switchToSignup') : t('auth.switchToLogin')}
              </button>
            </p>

            {/* Quick Demo Access banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <Sparkles size={16} className="text-emerald-600" />
                  Instant Demo Access
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">No DB required</span>
              </div>
              <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
                Want to explore FarmWise right away? Jump in with a pre-configured farmer demo profile.
              </p>
              <button
                id="demo-farmer-login-btn"
                type="button"
                onClick={() => signInAsDemo('farmer')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles size={16} />
                Continue as Demo Farmer
              </button>
            </div>

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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 underline"
                        >
                          <ExternalLink size={13} /> Open Supabase Dashboard to Restore Project
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Or log in with your Supabase account</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">{t('auth.name')}</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="input pl-10"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="input pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Please wait...</>
                ) : (
                  mode === 'login' ? t('auth.loginBtn') : t('auth.signupBtn')
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              By continuing, you agree to use FarmWise for informational purposes.
              Always verify critical farming decisions with local agricultural experts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
