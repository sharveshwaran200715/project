import { useState, useEffect } from 'react'
import { RefreshCw, Leaf, ArrowRight, Plus, Info } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner } from './ui'
import { CROPS, CROP_INFO } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { CropRotation } from '../lib/types'

export default function CropRotationSuggestion() {
  const [rotations, setRotations] = useState<CropRotation[]>([])
  const [loading, setLoading] = useState(true)
  const [previousCrop, setPreviousCrop] = useState('Rice')
  const [customRotations, setCustomRotations] = useState<CropRotation[]>([])

  useEffect(() => { loadRotations() }, [])

  async function loadRotations() {
    setLoading(true)
    const { data } = await supabase.from('crop_rotations').select('*').order('created_at', { ascending: false })
    setRotations(data || [])
    setLoading(false)
  }

  const suggestions = rotations.filter(r => r.previous_crop === previousCrop)
  const allForCrop = [...suggestions, ...customRotations.filter(r => r.previous_crop === previousCrop)]

  function generateSuggestion() {
    const prevInfo = CROP_INFO[previousCrop]
    const candidates = CROPS.filter(c => {
      if (c === previousCrop) return false
      const info = CROP_INFO[c]
      if (!info) return false
      // Legumes are always good after nitrogen-depleting crops
      if (c === 'Pulses' || c === 'Soybean' || c === 'Groundnut') return true
      // Different water need is good
      if (prevInfo && info.waterNeed !== prevInfo.waterNeed) return true
      return false
    })
    const picked = candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))] || 'Pulses'
    const nextInfo = CROP_INFO[picked]
    const isLegume = picked === 'Pulses' || picked === 'Soybean' || picked === 'Groundnut'
    const reason = isLegume
      ? `${picked} fixes atmospheric nitrogen, replenishing what ${previousCrop} depleted`
      : `${picked} has different water and nutrient needs than ${previousCrop}, breaking pest cycles`
    const benefit = isLegume
      ? `Adds 40-60 kg nitrogen/ha to soil, reduces future fertilizer costs`
      : `Breaks pest and disease cycles, improves soil structure`
    const newRotation: CropRotation = {
      id: Math.random().toString(36),
      previous_crop: previousCrop,
      next_crop: picked,
      reason,
      soil_benefit: benefit,
      created_at: new Date().toISOString(),
    }
    setCustomRotations([newRotation, ...customRotations])
    supabase.from('crop_rotations').insert({ previous_crop: previousCrop, next_crop: picked, reason, soil_benefit: benefit }).then(() => loadRotations())
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Crop Rotation Suggestions"
        subtitle="Find the best next crop to maintain soil health and prevent disease"
        icon={<RefreshCw size={20} />}
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1">
            <label className="label">What was your previous crop?</label>
            <select className="input" value={previousCrop} onChange={e => setPreviousCrop(e.target.value)}>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={generateSuggestion}>
            <Plus size={16} /> Get Suggestion
          </button>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : allForCrop.length === 0 ? (
        <Card>
          <EmptyState message={`No rotation suggestions for ${previousCrop} yet. Click "Get Suggestion" to generate one.`} icon={<Leaf size={40} />} />
        </Card>
      ) : (
        <div className="space-y-4">
          {allForCrop.map((r, i) => (
            <Card key={r.id} className="animate-slideIn" >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Leaf size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Previous Crop</p>
                    <p className="font-semibold text-lg">{r.previous_crop}</p>
                  </div>
                </div>
                <ArrowRight size={28} className="text-primary-500" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Leaf size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Recommended Next</p>
                    <p className="font-semibold text-lg text-primary-700">{r.next_crop}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Why this rotation?</p>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                </div>
                {r.soil_benefit && (
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="text-xs font-medium text-primary-600 mb-1 flex items-center gap-1"><Info size={12} /> Soil Benefit</p>
                    <p className="text-sm text-primary-700">{r.soil_benefit}</p>
                  </div>
                )}
              </div>
              {i === 0 && <div className="mt-3"><Badge color="green">RECOMMENDED</Badge></div>}
            </Card>
          ))}
        </div>
      )}

      {/* All rotation knowledge */}
      <Card>
        <h3 className="font-semibold mb-4">Rotation Knowledge Base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rotations.slice(0, 10).map(r => (
            <div key={r.id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">{r.previous_crop}</span>
              <ArrowRight size={14} className="text-primary-400" />
              <span className="text-sm font-medium text-primary-700">{r.next_crop}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
