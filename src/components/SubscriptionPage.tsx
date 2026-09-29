import { useState, useEffect } from 'react'
import { Crown, Check, X, Sparkles, ShieldCheck, Zap, ArrowRight, Smartphone, PhoneCall, Bot, CloudRain, TrendingUp, Sprout, Lock, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Card, SectionHeader, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { useLang } from '../lib/i18n'
import { Subscription, BillingCycle } from '../lib/types'
import { fetchCurrentSubscription, upgradeToPremium, cancelSubscription, PLAN_PRICING, EXCLUSIVE_FEATURES } from '../lib/subscriptionService'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const [modalOpen, setModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [upiId, setUpiId] = useState('farmer@upi')
  const [processing, setProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    loadSub()
  }, [user])

  async function loadSub() {
    const data = await fetchCurrentSubscription(user?.id)
    setSub(data)
  }

  async function handleUpgrade() {
    setProcessing(true)
    setTimeout(async () => {
      const updated = await upgradeToPremium(cycle, paymentMethod, user?.id)
      setSub(updated)
      setProcessing(false)
      setModalOpen(false)
      setSuccessMsg(`🎉 Welcome to FarmWise Premium! Your ${cycle} membership is now active.`)
      setTimeout(() => setSuccessMsg(null), 5000)
    }, 1200)
  }

  async function handleCancel() {
    if (confirm('Are you sure you want to downgrade to the Free Farmer plan?')) {
      const updated = await cancelSubscription(user?.id)
      setSub(updated)
      setSuccessMsg('Your plan has been switched to Free Farmer.')
      setTimeout(() => setSuccessMsg(null), 4000)
    }
  }

  const isPremium = sub?.plan_type === 'premium'

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="FarmWise Premium & Plans"
        subtitle="Empowering your farm with advanced intelligence, voice AI, priority support, and market radar"
        icon={<Crown size={22} className="text-amber-500" />}
      />

      {successMsg && (
        <div className="p-4 bg-primary-50 border border-primary-200 text-primary-800 rounded-2xl flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="text-primary-600 shrink-0" size={20} />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Current Subscription Status Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isPremium
          ? 'bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-secondary-500/10 border-amber-300 shadow-sm'
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isPremium ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md' : 'bg-primary-100 text-primary-700'
            }`}>
              {isPremium ? <Crown size={24} /> : <Sprout size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">
                  {isPremium ? 'FarmWise Premium Member' : 'Free Farmer Plan'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPremium ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isPremium ? 'ACTIVE PREMIUM' : 'CURRENT TIER'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isPremium
                  ? `Renews on ${new Date(sub.expires_at).toLocaleDateString()} (${sub.billing_cycle})`
                  : 'Access essential farming tools, weather alerts, and basic crop diagnostics at zero cost.'}
              </p>
            </div>
          </div>
          <div>
            {isPremium ? (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-error-600 border border-gray-200 hover:border-error-200 rounded-xl transition-all"
              >
                Downgrade to Free
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary flex items-center gap-2 text-sm shadow-md"
              >
                <Sparkles size={16} /> Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Billing Cycle Selector */}
      <div className="flex justify-center my-6">
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              cycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              cycle === 'yearly' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>Annual Plan</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              cycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
            }`}>
              Save 30%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between hover:border-gray-300 transition-all">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Basic</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">Free Farmer</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <Sprout size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Complete foundational farming toolkit for individual growers and small plots.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹0</span>
              <span className="text-gray-400 text-sm ml-2">free forever</span>
            </div>
            <ul className="space-y-3 border-t border-gray-100 pt-6">
              {[
                'Standard 5-day weather & rain forecast',
                'Basic crop disease identification (5/mo)',
                'Soil health & fertilizer calculator',
                'Smart irrigation schedule suggestions',
                'Farmer-to-buyer public marketplace',
                'Community text AI assistant',
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check size={16} className="text-primary-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Lock size={16} className="text-gray-300 shrink-0" />
                <span>Multilingual AI Voice Assistant (Audio)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Lock size={16} className="text-gray-300 shrink-0" />
                <span>24x7 Direct Agronomist Call Support</span>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <button
              disabled={!isPremium}
              onClick={handleCancel}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                !isPremium
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {!isPremium ? 'Currently Active' : 'Switch to Free'}
            </button>
          </div>
        </div>

        {/* Premium Plan Card */}
        <div className="relative bg-gradient-to-b from-white via-primary-50/20 to-primary-50/40 rounded-3xl border-2 border-primary-500 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Sparkles size={12} /> RECOMMENDED FOR GROWTH
          </div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary-600">Exclusive</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  FarmWise Premium <Crown size={20} className="text-amber-500" />
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
                <Crown size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Maximum yield intelligence with voice assistance, priority expert hotlines, and predictive analytics.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">
                ₹{PLAN_PRICING[cycle].price}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                /{cycle === 'yearly' ? 'year' : 'month'}
              </span>
              {PLAN_PRICING[cycle].savingsText && (
                <p className="text-xs text-primary-600 font-semibold mt-1">
                  {PLAN_PRICING[cycle].savingsText}
                </p>
              )}
            </div>
            <ul className="space-y-3 border-t border-primary-100 pt-6">
              {[
                'Everything in Free, plus:',
                'AI Multilingual Voice Assistant (Speak & Listen in 6 languages)',
                '24x7 Priority Agronomist Hotline & Direct Callbacks',
                'Hyperlocal Severe Weather & Cyclone Voice Alerts',
                '14-Day Mandi Price Prediction & Selling Timing',
                'Full Farm Progress Tracker & Milestone Timeline',
                'Priority consideration for FarmWise Rugged Tablet Program',
                'Advanced PDF Soil & Farm Intelligence Reports',
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-800">
                  <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={2.5} />
                  </div>
                  <span className={i === 0 ? 'font-semibold text-gray-900' : 'font-medium'}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <button
              onClick={() => setModalOpen(true)}
              disabled={isPremium}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                isPremium
                  ? 'bg-primary-100 text-primary-700 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25'
              }`}
            >
              {isPremium ? (
                <>
                  <CheckCircle2 size={18} /> Active Membership
                </>
              ) : (
                <>
                  <Crown size={18} /> Upgrade to FarmWise Premium
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <Card className="mt-8 overflow-hidden">
        <h3 className="font-bold text-lg text-gray-900 mb-2">Detailed Feature Comparison</h3>
        <p className="text-xs text-gray-500 mb-6">See exactly what you unlock with FarmWise Premium.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 font-semibold text-gray-700">Feature</th>
                <th className="py-3 px-4 font-semibold text-gray-500 w-36">Free Farmer</th>
                <th className="py-3 px-4 font-semibold text-primary-700 w-44">FarmWise Premium ✨</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {EXCLUSIVE_FEATURES.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-gray-900">{f.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs">
                    {typeof f.free === 'boolean' ? (
                      f.free ? <Check size={18} className="text-primary-600" /> : <X size={18} className="text-gray-300" />
                    ) : (
                      <span>{f.free}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-primary-700 bg-primary-50/30">
                    {typeof f.premium === 'boolean' ? (
                      <Check size={18} className="text-primary-600" />
                    ) : (
                      <span>{f.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Demo Checkout Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-slideIn">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Crown size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Activate Premium</h3>
                <p className="text-xs text-gray-400">Demo checkout flow</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-100">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600">Selected Plan</span>
                <span className="font-semibold text-gray-900 capitalize">{cycle} Premium</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600">Total Payable</span>
                <span className="font-extrabold text-primary-700 text-base">₹{PLAN_PRICING[cycle].price}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                🔒 Simulated secure checkout. Ready for Razorpay/Stripe integration.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-gray-700 block">Select Demo Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / GPay' },
                  { id: 'card', label: 'Debit/Credit' },
                  { id: 'netbanking', label: 'NetBanking' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === m.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="input text-sm"
                    placeholder="farmer@upi or mobile@paytm"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {processing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying Demo Payment...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Pay ₹{PLAN_PRICING[cycle].price} & Activate
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
