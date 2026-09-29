import { useState, useEffect } from 'react'
import { CloudRain, Bug, Sprout, Droplets, Calculator, TrendingUp, Leaf, Recycle, RefreshCw, Handshake, ArrowRight, Sun, Wind, MapPin, Bot, PhoneCall, Tablet, Crown, Mic, Sparkles, ChevronRight, Thermometer, Activity, AlertTriangle, CheckCircle2, BarChart2, Compass } from 'lucide-react'
import { Card, Badge, StatCard, LoadingSpinner } from './ui'
import { generateWeatherForecast, getFarmingAction } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { FarmProfile } from '../lib/types'
import { fetchCurrentSubscription } from '../lib/subscriptionService'

export interface NavItem {
  id: string
  labelKey: string
  label: string
  icon: React.ReactNode
  description: string
  color: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'simulator', labelKey: 'nav.simulator', label: 'What-If Farm Simulator', icon: <Compass size={22} />, description: 'Test hypothetical farming decisions, water, crops, costs, and profits before applying', color: 'accent' },
  { id: 'progress', labelKey: 'nav.progress', label: 'Farm Progress Tracker', icon: <Sprout size={22} />, description: 'Track 10 farming stages, tasks, crop age, and harvest dates', color: 'primary' },
  { id: 'voice', labelKey: 'nav.voiceAssistant', label: 'AI Voice Assistant', icon: <Mic size={22} />, description: 'Speak naturally in 6 Indian languages for hands-free advice', color: 'primary' },
  { id: 'support', labelKey: 'nav.support', label: '24x7 Call Support', icon: <PhoneCall size={22} />, description: 'Direct call and callback with regional agricultural scientists', color: 'secondary' },
  { id: 'weather', labelKey: 'nav.weather', label: 'Weather', icon: <CloudRain size={22} />, description: 'Rain prediction, heat alerts, daily farming actions', color: 'secondary' },
  { id: 'disease', labelKey: 'nav.cropHealth', label: 'Crop Health', icon: <Bug size={22} />, description: 'Leaf photo analysis, disease identification, treatment', color: 'error' },
  { id: 'soil', labelKey: 'nav.soil', label: 'Soil', icon: <Sprout size={22} />, description: 'Soil nutrients, health score, fertilizer recommendations', color: 'primary' },
  { id: 'irrigation', labelKey: 'nav.irrigation', label: 'Irrigation', icon: <Droplets size={22} />, description: 'Weather-based watering suggestions and water tracking', color: 'secondary' },
  { id: 'profit', labelKey: 'nav.profit', label: 'Profit Calculator', icon: <Calculator size={22} />, description: 'Cost analysis, yield estimation, net profit calculation', color: 'accent' },
  { id: 'prices', labelKey: 'nav.prices', label: 'Market Prices', icon: <TrendingUp size={22} />, description: 'Market prices, historical trends, where to sell', color: 'primary' },
  { id: 'device', labelKey: 'nav.device', label: 'Farmer Device Program', icon: <Tablet size={22} />, description: 'Apply for a FarmWise-supported rugged tablet for off-grid farming', color: 'accent' },
  { id: 'subscription', labelKey: 'nav.subscription', label: 'FarmWise Premium', icon: <Crown size={22} />, description: 'Upgrade for voice AI, 24x7 call hotline, and market forecasts', color: 'accent' },
  { id: 'sustainability', labelKey: 'nav.sustainability', label: 'Sustainability', icon: <Leaf size={22} />, description: 'Rate your farming practices and get a grade', color: 'primary' },
  { id: 'rotation', labelKey: 'nav.rotation', label: 'Crop Rotation', icon: <RefreshCw size={22} />, description: 'Next crop suggestions to maintain soil health', color: 'accent' },
  { id: 'waste', labelKey: 'nav.waste', label: 'Waste Management', icon: <Recycle size={22} />, description: 'Turn crop waste into value, composting and biofertilizer', color: 'primary' },
  { id: 'buyer', labelKey: 'nav.buyers', label: 'Buyers', icon: <Handshake size={22} />, description: 'Find buyers by price, distance, and transport cost', color: 'secondary' },
  { id: 'ai', labelKey: 'nav.aiAssistant', label: 'AI Assistant', icon: <Bot size={22} />, description: 'Ask FarmWise AI any farming question', color: 'primary' },
]

const PRIORITY_LABELS: Record<string, { label: string; color: 'red' | 'amber' | 'green' }> = {
  high: { label: 'Urgent', color: 'red' },
  medium: { label: 'Important', color: 'amber' },
  low: { label: 'Recommended', color: 'green' },
}

const DEMO_CROPS = [
  { name: 'Tomato', emoji: '🍅', stage: 'Flowering', health: 88, planted: 'Aug 15', harvest: 'Nov 10', color: 'from-red-500 to-rose-600', bgLight: 'bg-red-50', textCol: 'text-red-600', barColor: '#ef4444', rec: 'Apply potassium fertilizer this week for better fruit set.' },
  { name: 'Rice (Paddy)', emoji: '🌾', stage: 'Tillering', health: 94, planted: 'Aug 28', harvest: 'Dec 02', color: 'from-amber-500 to-yellow-600', bgLight: 'bg-amber-50', textCol: 'text-amber-700', barColor: '#f59e0b', rec: 'Maintain 5cm water level. Weed management needed by day 30.' },
  { name: 'Brinjal', emoji: '🍆', stage: 'Harvest Ready', health: 76, planted: 'Jul 20', harvest: 'Sep 30', color: 'from-purple-500 to-violet-600', bgLight: 'bg-purple-50', textCol: 'text-purple-600', barColor: '#8b5cf6', rec: 'Ready to harvest. Check for fruit borer damage before picking.' },
]

export default function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { profile } = useAuth()
  const [weather] = useState(() => generateWeatherForecast()[0])
  const [stats, setStats] = useState({ soilRecords: 0, irrigationLogs: 0, profitCalcs: 0, wasteRecords: 0, sustainabilityScore: 0 })
  const [loading, setLoading] = useState(true)
  const [farm, setFarm] = useState<FarmProfile | null>(null)
  const [cropPrice, setCropPrice] = useState<{ price: number; trend: string } | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 12 && h < 17) setGreeting('Good afternoon')
    else if (h >= 17) setGreeting('Good evening')
  }, [])

  useEffect(() => {
    async function loadAll() {
      const [soil, irrigation, profit, waste, farms, prices, sub] = await Promise.all([
        supabase.from('soil_records').select('id, health_score', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(1),
        supabase.from('irrigation_logs').select('id', { count: 'exact', head: true }),
        supabase.from('profit_calculations').select('id, net_profit', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(1),
        supabase.from('waste_management').select('id', { count: 'exact', head: true }),
        supabase.from('farm_profiles').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('crop_prices').select('price_per_kg, trend, crop_name').order('recorded_date', { ascending: false }).limit(1).maybeSingle(),
        fetchCurrentSubscription(),
      ])
      setStats({
        soilRecords: soil.count || 0,
        irrigationLogs: irrigation.count || 0,
        profitCalcs: profit.count || 0,
        wasteRecords: waste.count || 0,
        sustainabilityScore: soil.data?.[0]?.health_score || 0,
      })
      setFarm(farms.data || null)
      setCropPrice(prices.data ? { price: prices.data.price_per_kg, trend: prices.data.trend } : null)
      setIsPremium(sub.plan_type === 'premium')
      setLoading(false)
    }
    loadAll()
  }, [])

  const farmingActions = getFarmingAction(weather)

  return (
    <div className="animate-fadeIn space-y-8">

      {/* ===== HERO WELCOME BANNER ===== */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient p-7 sm:p-10 text-white">
        <div className="hero-overlay absolute inset-0" />
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-300/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-green-300/80 text-sm font-medium mb-1">{greeting} 🌱</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {profile?.full_name ? `Welcome back, ${profile.full_name}!` : 'Welcome to FarmWise'}
              </h1>
              <p className="text-green-200/70 mt-1.5 text-sm">Here's your farm intelligence overview for today.</p>
            </div>
            <button
              onClick={() => onNavigate('subscription')}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                isPremium
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 hover:bg-amber-400/30'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Crown size={14} className={isPremium ? 'text-amber-300' : 'text-amber-400'} />
              {isPremium ? 'Premium Active ✨' : 'Free · Upgrade →'}
            </button>
          </div>

          {/* Farm quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: MapPin, label: 'Location', value: farm?.location || 'Not set' },
              { icon: Sprout, label: 'Farm Size', value: farm?.area_hectares ? `${farm.area_hectares} ha` : 'Not set' },
              { icon: Leaf, label: 'Main Crop', value: farm?.main_crop || 'Not set' },
              { icon: CloudRain, label: 'Weather', value: `${weather.condition}` },
              { icon: Droplets, label: 'Rain Chance', value: `${weather.rainChance}%` },
              { icon: Wind, label: 'Wind Speed', value: `${weather.windSpeed} km/h` },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="stat-card-glass px-3 py-3 rounded-xl">
                <Icon size={14} className="text-green-300/70 mb-1.5" />
                <p className="text-[10px] text-green-300/60 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SMART OVERVIEW CARDS ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Activity size={20} className="text-green-600" /> Smart Farm Overview
          </h2>
          <span className="text-xs text-gray-400 bg-green-50 px-2.5 py-1 rounded-full font-medium text-green-600">Live Data</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Sun, label: 'Weather', value: `${weather.tempHigh}°C`, sub: weather.condition, color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-200', nav: 'weather' },
            { icon: Droplets, label: 'Soil Moisture', value: '68%', sub: 'Optimal Level', color: 'bg-cyan-50 text-cyan-600', ring: 'ring-cyan-200', nav: 'soil' },
            { icon: Bug, label: 'Crop Health', value: '88%', sub: 'Good Condition', color: 'bg-green-50 text-green-600', ring: 'ring-green-200', nav: 'disease' },
            { icon: Droplets, label: 'Water Level', value: '72%', sub: 'Reservoir Full', color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-200', nav: 'irrigation' },
            { icon: Thermometer, label: 'Temperature', value: `${weather.tempHigh}°C`, sub: `Low ${weather.tempLow}°C`, color: 'bg-rose-50 text-rose-600', ring: 'ring-rose-200', nav: 'weather' },
            { icon: CloudRain, label: 'Humidity', value: `${weather.humidity}%`, sub: 'Moderate', color: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200', nav: 'weather' },
          ].map(({ icon: Icon, label, value, sub, color, ring, nav }, i) => (
            <button
              key={i}
              onClick={() => onNavigate(nav)}
              className="card card-hover text-left group animate-slideIn"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform duration-200 ring-2 ring-transparent group-hover:${ring}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ===== SPOTLIGHT CARDS (Voice, Support, Progress) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Voice Assistant */}
        <button
          onClick={() => onNavigate('voice')}
          className="relative overflow-hidden rounded-2xl p-5 text-white text-left cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          style={{ background: 'linear-gradient(135deg, #0f4a2a 0%, #166534 50%, #15803d 100%)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold bg-green-400/20 border border-green-400/30 px-2.5 py-1 rounded-full text-green-300">6 Languages</span>
            </div>
            <h4 className="font-black text-base mb-1.5">AI Voice Assistant</h4>
            <p className="text-xs text-green-200/70 leading-relaxed mb-4">Speak in Tamil, Telugu, Hindi, Kannada, Malayalam, or English. Hear answers read aloud.</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-300">
              Tap to Speak <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* 24x7 Agronomist */}
        <button
          onClick={() => onNavigate('support')}
          className="relative overflow-hidden rounded-2xl p-5 text-white text-left cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          style={{ background: 'linear-gradient(135deg, #075985 0%, #0284c7 50%, #0369a1 100%)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 18 Active
              </span>
            </div>
            <h4 className="font-black text-base mb-1.5">24×7 Agronomist Call</h4>
            <p className="text-xs text-sky-200/70 leading-relaxed mb-4">Call certified agricultural scientists directly for urgent pest, disease, or spray advice.</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
              Connect Now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Farm Progress */}
        <button
          onClick={() => onNavigate('progress')}
          className="card card-hover text-left group animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout size={20} />
            </div>
            <span className="text-[10px] uppercase font-bold bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-full">
              Stage 5 / 10
            </span>
          </div>
          <h4 className="font-black text-base text-gray-900 mb-1.5">Farm Progress Tracker</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">Crop age: 42 days. Next task: First crown root moisture inspection.</p>

          {/* Progress bar */}
          <div className="health-bar mb-2">
            <div className="health-bar-fill bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '50%' }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">50% complete</span>
            <span className="font-bold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Tracker <ArrowRight size={11} />
            </span>
          </div>
        </button>
      </div>

      {/* ===== CROP MANAGEMENT ===== */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Sprout size={20} className="text-green-600" /> Crop Management
          </h2>
          <button onClick={() => onNavigate('progress')} className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEMO_CROPS.map((crop, i) => (
            <div key={i} className="crop-card animate-slideIn" style={{ animationDelay: `${i * 80}ms` }} onClick={() => onNavigate('disease')}>
              {/* Header */}
              <div className={`bg-gradient-to-r ${crop.color} px-5 py-4 flex items-center justify-between`}>
                <div>
                  <div className="text-3xl mb-1">{crop.emoji}</div>
                  <h4 className="font-black text-white text-lg">{crop.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{crop.health}%</div>
                  <div className="text-xs text-white/70">Health Score</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                {/* Health bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 font-medium">Health</span>
                    <span className={`text-xs font-bold ${crop.textCol}`}>{crop.health >= 90 ? 'Excellent' : crop.health >= 75 ? 'Good' : 'Fair'}</span>
                  </div>
                  <div className="health-bar">
                    <div className="health-bar-fill" style={{ width: `${crop.health}%`, background: crop.barColor }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <p className="text-gray-400 mb-0.5">Growth Stage</p>
                    <p className={`font-bold ${crop.textCol}`}>{crop.stage}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">Planted</p>
                    <p className="font-bold text-gray-700">{crop.planted}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">Expected Harvest</p>
                    <p className="font-bold text-gray-700">{crop.harvest}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">Days Since Plant</p>
                    <p className="font-bold text-gray-700">42 days</p>
                  </div>
                </div>

                {/* AI Rec */}
                <div className={`${crop.bgLight} rounded-xl p-3 flex items-start gap-2`}>
                  <Sparkles size={13} className={`${crop.textCol} mt-0.5 shrink-0`} />
                  <p className={`text-xs ${crop.textCol} leading-relaxed font-medium`}>{crop.rec}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TODAY'S FARMING ACTIONS ===== */}
      <Card>
        <h3 className="font-black text-lg mb-5 flex items-center gap-2.5">
          <span className="text-2xl">🌾</span> Today's Farming Actions
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">AI Generated</span>
        </h3>
        <div className="space-y-3">
          {farmingActions.map((action, i) => {
            const priority = PRIORITY_LABELS[action.priority] || PRIORITY_LABELS.low
            return (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-green-50/50 rounded-2xl transition-colors animate-slideIn group cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                  action.priority === 'high' ? 'bg-red-100 text-red-600' :
                  action.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1 leading-relaxed">{action.action}</p>
                <Badge color={priority.color}>
                  {action.priority === 'high' ? '🔴' : action.priority === 'medium' ? '🟠' : '🟢'} {priority.label}
                </Badge>
              </div>
            )
          })}
        </div>
        <button className="text-sm text-primary-600 font-semibold mt-4 flex items-center gap-1.5 hover:gap-2.5 transition-all" onClick={() => onNavigate('weather')}>
          View full forecast <ArrowRight size={14} />
        </button>
      </Card>

      {/* ===== MARKET PRICE QUICK VIEW ===== */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp size={20} className="text-violet-600" /> Market Prices
          </h2>
          <button onClick={() => onNavigate('prices')} className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
            Full Market <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { crop: 'Tomato', emoji: '🍅', price: 28, prev: 25, unit: 'kg' },
            { crop: 'Onion', emoji: '🧅', price: 22, prev: 24, unit: 'kg' },
            { crop: 'Potato', emoji: '🥔', price: 18, prev: 17, unit: 'kg' },
            { crop: 'Rice', emoji: '🌾', price: 35, prev: 34, unit: 'kg' },
            { crop: 'Brinjal', emoji: '🍆', price: 15, prev: 16, unit: 'kg' },
            { crop: 'Carrot', emoji: '🥕', price: 40, prev: 38, unit: 'kg' },
          ].map((item, i) => {
            const up = item.price >= item.prev
            const pct = Math.abs(((item.price - item.prev) / item.prev) * 100).toFixed(1)
            return (
              <button key={i} onClick={() => onNavigate('prices')} className="card card-hover text-center group animate-fadeIn" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-xs text-gray-500 font-medium mb-1">{item.crop}</p>
                <p className="text-lg font-black text-gray-900">₹{item.price}/{item.unit}</p>
                <p className={`text-xs font-bold mt-1 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {up ? '↑' : '↓'} {pct}%
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== QUICK STATS (DB RECORDS) ===== */}
      {!loading && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BarChart2 size={20} className="text-gray-600" /> Your Farm Activity
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Sprout size={20} />} label="Soil Tests" value={stats.soilRecords} color="primary" />
            <StatCard icon={<Droplets size={20} />} label="Irrigation Logs" value={stats.irrigationLogs} color="secondary" />
            <StatCard icon={<Calculator size={20} />} label="Profit Calcs" value={stats.profitCalcs} color="accent" />
            <StatCard icon={<Recycle size={20} />} label="Waste Records" value={stats.wasteRecords} color="primary" />
          </div>
        </div>
      )}
      {loading && <LoadingSpinner />}

      {/* ===== ALL FEATURES GRID ===== */}
      <div>
        <h2 className="section-title mb-5 flex items-center gap-2">
          <Sparkles size={20} className="text-green-600" /> All Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="card card-hover text-left animate-slideIn group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 transition-transform duration-200 group-hover:scale-110 ${
                item.color === 'primary' ? 'bg-green-100 text-green-700' :
                item.color === 'secondary' ? 'bg-sky-100 text-sky-700' :
                item.color === 'error' ? 'bg-red-100 text-red-600' :
                'bg-amber-100 text-amber-700'
              }`}>
                {item.icon}
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-green-700 transition-colors">{item.label}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
