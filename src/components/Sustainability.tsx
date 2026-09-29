import { useState, useEffect } from 'react'
import { Leaf, Droplets, FlaskConical, Recycle, Award, TrendingUp } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner, ProgressBar } from './ui'
import { calculateSustainability } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { SustainabilityScore } from '../lib/types'

export default function Sustainability() {
  const [scores, setScores] = useState<SustainabilityScore[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    water: 18,
    chemical: 15,
    soil: 20,
    waste: 12,
  })

  useEffect(() => { loadScores() }, [])

  async function loadScores() {
    setLoading(true)
    const { data } = await supabase.from('sustainability_scores').select('*').order('created_at', { ascending: false }).limit(5)
    setScores(data || [])
    setLoading(false)
  }

  const result = calculateSustainability(form.water, form.chemical, form.soil, form.waste)

  async function saveScore() {
    await supabase.from('sustainability_scores').insert({
      water_efficiency: form.water,
      chemical_usage: form.chemical,
      soil_practices: form.soil,
      waste_management_score: form.waste,
      total_score: result.total,
      grade: result.grade,
      recommendations: result.recommendations.join('. '),
    })
    loadScores()
  }

  function gradeColor(grade: string): 'green' | 'amber' | 'red' {
    if (grade.startsWith('A')) return 'green'
    if (grade.startsWith('B')) return 'amber'
    return 'red'
  }

  const categories = [
    { key: 'water', label: 'Water Efficiency', icon: <Droplets size={18} />, value: form.water, max: 25, desc: 'Drip irrigation, rainwater harvesting, water recycling' },
    { key: 'chemical', label: 'Chemical Usage', icon: <FlaskConical size={18} />, value: form.chemical, max: 25, desc: 'Organic fertilizers, reduced pesticide use, IPM practices' },
    { key: 'soil', label: 'Soil-Friendly Practices', icon: <Leaf size={18} />, value: form.soil, max: 25, desc: 'Crop rotation, cover crops, organic matter addition' },
    { key: 'waste', label: 'Waste Management', icon: <Recycle size={18} />, value: form.waste, max: 25, desc: 'Composting, mulching, biofertilizer from crop residue' },
  ]

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Sustainability Score"
        subtitle="Rate your farming practices and get a sustainability grade"
        icon={<Leaf size={20} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input sliders */}
        <Card>
          <h3 className="font-semibold mb-4">Rate Your Practices</h3>
          <div className="space-y-5">
            {categories.map(cat => (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cat.label}</p>
                      <p className="text-xs text-gray-400">{cat.desc}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{form[cat.key as keyof typeof form]}/{cat.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={cat.max}
                  className="w-full accent-primary-600"
                  value={form[cat.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [cat.key]: +e.target.value })}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Score display */}
        <div className="space-y-4">
          <Card>
            <div className="text-center">
              <div className={`inline-flex w-32 h-32 rounded-full items-center justify-center mb-3 ${result.grade.startsWith('A') ? 'bg-primary-50' : result.grade.startsWith('B') ? 'bg-accent-50' : 'bg-error-50'}`}>
                <div>
                  <p className={`text-4xl font-bold ${result.grade.startsWith('A') ? 'text-primary-600' : result.grade.startsWith('B') ? 'text-accent-600' : 'text-error-600'}`}>{result.grade}</p>
                  <p className="text-xs text-gray-400 mt-1">Grade</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{result.total}<span className="text-lg text-gray-400">/100</span></p>
              <p className="text-sm text-gray-500 mt-1">Sustainability Score</p>
              <div className="mt-4 max-w-xs mx-auto">
                <ProgressBar value={result.total} color={result.total >= 75 ? 'primary' : result.total >= 50 ? 'accent' : 'error'} />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Award size={18} className="text-primary-500" /> Recommendations</h3>
            <div className="space-y-2">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg animate-slideIn" style={{ animationDelay: `${i * 50}ms` }}>
                  <TrendingUp size={14} className="text-primary-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">{r}</p>
                </div>
              ))}
            </div>
          </Card>

          <button className="btn-primary w-full" onClick={saveScore}>Save Score</button>
        </div>
      </div>

      {/* Past scores */}
      <Card>
        <h3 className="font-semibold mb-4">Score History</h3>
        {loading ? (
          <LoadingSpinner />
        ) : scores.length === 0 ? (
          <EmptyState message="No scores saved yet" icon={<Leaf size={40} />} />
        ) : (
          <div className="space-y-2">
            {scores.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${s.grade?.startsWith('A') ? 'bg-primary-100 text-primary-600' : s.grade?.startsWith('B') ? 'bg-accent-100 text-accent-600' : 'bg-error-100 text-error-600'}`}>
                    {s.grade}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Score: {s.total_score}/100</p>
                    <p className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge color="green">W:{s.water_efficiency}</Badge>
                  <Badge color="amber">C:{s.chemical_usage}</Badge>
                  <Badge color="blue">S:{s.soil_practices}</Badge>
                  <Badge color="gray">Wm:{s.waste_management_score}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
