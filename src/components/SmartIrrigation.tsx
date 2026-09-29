import { useState, useEffect } from 'react'
import { Droplets, Waves, Calculator, Save, TrendingDown, Info } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner, StatCard } from './ui'
import { CROPS, SOIL_TYPES, calculateIrrigation, generateWeatherForecast } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { IrrigationLog } from '../lib/types'

export default function SmartIrrigation() {
  const [logs, setLogs] = useState<IrrigationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [crop, setCrop] = useState('Wheat')
  const [soilType, setSoilType] = useState('Loamy')
  const [areaHa, setAreaHa] = useState(1)
  const [saved, setSaved] = useState(false)

  const [weather] = useState(() => generateWeatherForecast()[0])
  const irrigation = calculateIrrigation(crop, soilType, weather.tempHigh, weather.humidity, weather.rainChance)

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase.from('irrigation_logs').select('*').order('created_at', { ascending: false }).limit(10)
    setLogs(data || [])
    setLoading(false)
  }

  const totalWater = logs.reduce((sum, l) => sum + l.water_amount_liters, 0)
  const totalSaved = logs.reduce((sum, l) => sum + l.water_saved_liters, 0)
  const waterForArea = Math.round(irrigation.litersPerHa * areaHa)

  async function saveLog() {
    const waterSaved = Math.round(waterForArea * 0.35)
    await supabase.from('irrigation_logs').insert({
      crop_name: crop,
      water_amount_liters: waterForArea,
      method: irrigation.method,
      water_saved_liters: waterSaved,
      scheduled_date: new Date().toISOString().split('T')[0],
      notes: irrigation.savingTip,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadLogs()
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Smart Irrigation"
        subtitle="Crop, soil, and weather-based watering recommendations"
        icon={<Droplets size={20} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Waves size={20} />} label="Total Water Used" value={`${(totalWater / 1000).toFixed(1)}K L`} sublabel="from saved logs" color="secondary" />
        <StatCard icon={<TrendingDown size={20} />} label="Water Saved" value={`${(totalSaved / 1000).toFixed(1)}K L`} sublabel="through smart practices" color="primary" />
        <StatCard icon={<Info size={20} />} label="Today's Need" value={`${waterForArea.toLocaleString()} L`} sublabel={`${areaHa} ha • ${crop}`} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Irrigation Calculator</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Crop</label>
              <select className="input" value={crop} onChange={e => setCrop(e.target.value)}>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Soil Type</label>
              <select className="input" value={soilType} onChange={e => setSoilType(e.target.value)}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Area (hectares): {areaHa}</label>
              <input type="range" min="0.5" max="20" step="0.5" className="w-full accent-primary-600" value={areaHa} onChange={e => setAreaHa(+e.target.value)} />
            </div>
            <div className="p-3 bg-secondary-50 rounded-xl text-sm text-secondary-700">
              <p className="font-medium mb-1">Today's Weather Context</p>
              <p>{weather.condition} • {weather.tempHigh}°C • {weather.humidity}% humidity • {weather.rainChance}% rain chance</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Recommendation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-sm text-primary-600">Water Needed Today</p>
                  <p className="text-2xl font-bold text-primary-700">{waterForArea.toLocaleString()} L</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Irrigation Frequency</span>
                <span className="font-medium text-sm">{irrigation.frequency}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Recommended Method</span>
                <span className="font-medium text-sm">{irrigation.method}</span>
              </div>
              <div className="p-3 bg-accent-50 rounded-lg">
                <p className="text-sm text-accent-700 flex items-start gap-2">
                  <TrendingDown size={16} className="mt-0.5 shrink-0" />
                  {irrigation.savingTip}
                </p>
              </div>
            </div>
            <button className="btn-primary w-full" onClick={saveLog}>
              {saved ? 'Saved!' : 'Log Irrigation'}
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Irrigation History</h3>
        {loading ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
          <EmptyState message="No irrigation logs yet" icon={<Droplets size={40} />} />
        ) : (
          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.crop_name} • {l.method}</p>
                    <p className="text-xs text-gray-500">{l.water_amount_liters.toLocaleString()} L • {new Date(l.scheduled_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge color="green">Saved {l.water_saved_liters.toLocaleString()} L</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
