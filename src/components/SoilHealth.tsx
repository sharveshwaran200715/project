import { useState, useEffect } from 'react'
import { Sprout, FlaskConical, Beaker, Droplet, Leaf, TrendingUp } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner, ProgressBar } from './ui'
import { SOIL_TYPES, CROPS, calculateSoilHealthScore, getFertilizerRecommendation, getCropSuitability } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { SoilRecord } from '../lib/types'

export default function SoilHealth() {
  const [records, setRecords] = useState<SoilRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    soil_type: 'Loamy',
    ph_level: 6.5,
    nitrogen: 50,
    phosphorus: 25,
    potassium: 100,
    organic_matter: 2.5,
    moisture: 30,
  })
  const [selectedCrop, setSelectedCrop] = useState('Wheat')

  useEffect(() => {
    loadRecords()
  }, [])

  async function loadRecords() {
    setLoading(true)
    const { data } = await supabase.from('soil_records').select('*').order('created_at', { ascending: false }).limit(5)
    setRecords(data || [])
    setLoading(false)
  }

  const healthScore = calculateSoilHealthScore(form.ph_level, form.nitrogen, form.phosphorus, form.potassium, form.organic_matter, form.moisture)
  const fertilizerRec = getFertilizerRecommendation(form.ph_level, form.nitrogen, form.phosphorus, form.potassium, selectedCrop)
  const suitability = getCropSuitability(form.soil_type, form.ph_level, selectedCrop)

  async function saveRecord() {
    const rec = getFertilizerRecommendation(form.ph_level, form.nitrogen, form.phosphorus, form.potassium, selectedCrop)
    await supabase.from('soil_records').insert({
      ...form,
      health_score: healthScore,
      recommendation: rec,
    })
    loadRecords()
  }

  function scoreColor(score: number): 'green' | 'amber' | 'red' {
    if (score >= 70) return 'green'
    if (score >= 50) return 'amber'
    return 'red'
  }

  function scoreLabel(score: number): string {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Fair'
    if (score >= 35) return 'Poor'
    return 'Critical'
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Soil Health"
        subtitle="Analyze soil nutrients, get health scores and fertilizer recommendations"
        icon={<Sprout size={20} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input form */}
        <Card>
          <h3 className="font-semibold mb-4">Soil Test Input</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Soil Type</label>
                <select className="input" value={form.soil_type} onChange={e => setForm({ ...form, soil_type: e.target.value })}>
                  {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">pH Level</label>
                <input type="number" step="0.1" className="input" value={form.ph_level} onChange={e => setForm({ ...form, ph_level: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Nitrogen (kg/ha): {form.nitrogen}</label>
              <input type="range" min="0" max="120" className="w-full accent-primary-600" value={form.nitrogen} onChange={e => setForm({ ...form, nitrogen: +e.target.value })} />
            </div>
            <div>
              <label className="label">Phosphorus (kg/ha): {form.phosphorus}</label>
              <input type="range" min="0" max="80" className="w-full accent-primary-600" value={form.phosphorus} onChange={e => setForm({ ...form, phosphorus: +e.target.value })} />
            </div>
            <div>
              <label className="label">Potassium (kg/ha): {form.potassium}</label>
              <input type="range" min="0" max="250" className="w-full accent-primary-600" value={form.potassium} onChange={e => setForm({ ...form, potassium: +e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Organic Matter (%)</label>
                <input type="number" step="0.1" className="input" value={form.organic_matter} onChange={e => setForm({ ...form, organic_matter: +e.target.value })} />
              </div>
              <div>
                <label className="label">Moisture (%)</label>
                <input type="number" className="input" value={form.moisture} onChange={e => setForm({ ...form, moisture: +e.target.value })} />
              </div>
            </div>
            <button className="btn-primary w-full" onClick={saveRecord}>Save Soil Record</button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Soil Health Score</h3>
              <Badge color={scoreColor(healthScore)}>{scoreLabel(healthScore)}</Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${healthScore >= 70 ? 'text-primary-600' : healthScore >= 50 ? 'text-accent-600' : 'text-error-600'}`}>
                  {healthScore}
                </div>
                <p className="text-xs text-gray-400">out of 100</p>
              </div>
              <div className="flex-1">
                <ProgressBar value={healthScore} color={healthScore >= 70 ? 'primary' : healthScore >= 50 ? 'accent' : 'error'} />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>50</span><span>100</span></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <FlaskConical size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">N</p>
                <p className="font-semibold text-sm">{form.nitrogen}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Beaker size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">P</p>
                <p className="font-semibold text-sm">{form.phosphorus}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Droplet size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">K</p>
                <p className="font-semibold text-sm">{form.potassium}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-primary-500" /> Fertilizer Recommendation</h3>
            <p className="text-sm text-gray-600">{fertilizerRec}</p>
          </Card>
        </div>
      </div>

      {/* Crop suitability */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} className="text-primary-500" /> Crop Suitability Check</h3>
        <div className="flex gap-3 mb-4">
          <select className="input sm:w-48" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={`p-4 rounded-xl ${suitability.suitable ? 'bg-primary-50' : 'bg-error-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suitability.suitable ? 'bg-primary-100 text-primary-600' : 'bg-error-100 text-error-600'}`}>
              {suitability.suitable ? <Sprout size={16} /> : <Leaf size={16} />}
            </div>
            <p className={`font-medium ${suitability.suitable ? 'text-primary-700' : 'text-error-700'}`}>
              {suitability.suitable ? `${selectedCrop} is suitable for your soil` : `${selectedCrop} may struggle in your soil`}
            </p>
          </div>
          <ul className="space-y-1 ml-10">
            {suitability.reasons.map((r, i) => (
              <li key={i} className={`text-sm ${suitability.suitable ? 'text-primary-600' : 'text-error-600'}`}>• {r}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Past records */}
      <Card>
        <h3 className="font-semibold mb-4">Recent Soil Tests</h3>
        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <EmptyState message="No soil tests saved yet" icon={<Sprout size={40} />} />
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.health_score >= 70 ? 'bg-primary-100 text-primary-600' : r.health_score >= 50 ? 'bg-accent-100 text-accent-600' : 'bg-error-100 text-error-600'}`}>
                    <span className="font-bold text-sm">{r.health_score}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.soil_type} soil • pH {r.ph_level}</p>
                    <p className="text-xs text-gray-500">N:{r.nitrogen} P:{r.phosphorus} K:{r.potassium} • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge color={scoreColor(r.health_score)}>{scoreLabel(r.health_score)}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
