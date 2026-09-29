import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, TrendingDown, DollarSign, Save, Receipt } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner, StatCard } from './ui'
import { CROPS, CROP_INFO } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { ProfitCalculation } from '../lib/types'

export default function ProfitCalculator() {
  const [saved, setSaved] = useState<ProfitCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    crop: 'Wheat',
    area: 1,
    seedCost: 1500,
    fertilizerCost: 3000,
    labourCost: 5000,
    waterCost: 1200,
    transportCost: 800,
    yieldKg: 0,
    pricePerKg: 22,
  })

  useEffect(() => { loadSaved() }, [])

  async function loadSaved() {
    setLoading(true)
    const { data } = await supabase.from('profit_calculations').select('*').order('created_at', { ascending: false }).limit(5)
    setSaved(data || [])
    setLoading(false)
  }

  function onCropChange(crop: string) {
    const info = CROP_INFO[crop]
    setForm({
      ...form,
      crop,
      yieldKg: info ? Math.round(info.typicalYieldKgPerHa * form.area) : 0,
    })
  }

  function onAreaChange(area: number) {
    const info = CROP_INFO[form.crop]
    setForm({ ...form, area, yieldKg: info ? Math.round(info.typicalYieldKgPerHa * area) : 0 })
  }

  const totalCost = form.seedCost + form.fertilizerCost + form.labourCost + form.waterCost + form.transportCost
  const grossRevenue = form.yieldKg * form.pricePerKg
  const netProfit = grossRevenue - totalCost
  const profitPerHa = Math.round(netProfit / form.area)
  const isProfit = netProfit > 0

  async function saveCalculation() {
    await supabase.from('profit_calculations').insert({
      crop_name: form.crop,
      area_hectares: form.area,
      seed_cost: form.seedCost,
      fertilizer_cost: form.fertilizerCost,
      labour_cost: form.labourCost,
      water_cost: form.waterCost,
      transport_cost: form.transportCost,
      total_cost: totalCost,
      expected_yield_kg: form.yieldKg,
      selling_price_per_kg: form.pricePerKg,
      gross_revenue: grossRevenue,
      net_profit: netProfit,
    })
    loadSaved()
  }

  function formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
  }

  const costBreakdown = [
    { label: 'Seed', value: form.seedCost, color: 'bg-primary-500' },
    { label: 'Fertilizer', value: form.fertilizerCost, color: 'bg-secondary-500' },
    { label: 'Labour', value: form.labourCost, color: 'bg-accent-500' },
    { label: 'Water', value: form.waterCost, color: 'bg-teal-500' },
    { label: 'Transport', value: form.transportCost, color: 'bg-orange-400' },
  ]

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Crop Profit Calculator"
        subtitle="Calculate costs, expected revenue, and net profit for any crop"
        icon={<Calculator size={20} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<DollarSign size={20} />} label="Total Cost" value={formatCurrency(totalCost)} sublabel={`${formatCurrency(Math.round(totalCost / form.area))}/ha`} color="error" />
        <StatCard icon={<TrendingUp size={20} />} label="Gross Revenue" value={formatCurrency(grossRevenue)} sublabel={`${form.yieldKg.toLocaleString()} kg expected`} color="secondary" />
        <StatCard icon={isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />} label="Net Profit" value={formatCurrency(netProfit)} sublabel={`${formatCurrency(profitPerHa)}/ha`} color={isProfit ? 'primary' : 'error'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost inputs */}
        <Card>
          <h3 className="font-semibold mb-4">Costs & Yield Input</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Crop</label>
                <select className="input" value={form.crop} onChange={e => onCropChange(e.target.value)}>
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Area (hectares)</label>
                <input type="number" step="0.5" min="0.5" className="input" value={form.area} onChange={e => onAreaChange(+e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Seed Cost ({formatCurrency(form.seedCost)})</label>
              <input type="range" min="0" max="10000" step="100" className="w-full accent-primary-600" value={form.seedCost} onChange={e => setForm({ ...form, seedCost: +e.target.value })} />
            </div>
            <div>
              <label className="label">Fertilizer Cost ({formatCurrency(form.fertilizerCost)})</label>
              <input type="range" min="0" max="20000" step="100" className="w-full accent-primary-600" value={form.fertilizerCost} onChange={e => setForm({ ...form, fertilizerCost: +e.target.value })} />
            </div>
            <div>
              <label className="label">Labour Cost ({formatCurrency(form.labourCost)})</label>
              <input type="range" min="0" max="30000" step="100" className="w-full accent-primary-600" value={form.labourCost} onChange={e => setForm({ ...form, labourCost: +e.target.value })} />
            </div>
            <div>
              <label className="label">Water Cost ({formatCurrency(form.waterCost)})</label>
              <input type="range" min="0" max="10000" step="100" className="w-full accent-primary-600" value={form.waterCost} onChange={e => setForm({ ...form, waterCost: +e.target.value })} />
            </div>
            <div>
              <label className="label">Transport Cost ({formatCurrency(form.transportCost)})</label>
              <input type="range" min="0" max="10000" step="100" className="w-full accent-primary-600" value={form.transportCost} onChange={e => setForm({ ...form, transportCost: +e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Expected Yield (kg)</label>
                <input type="number" className="input" value={form.yieldKg} onChange={e => setForm({ ...form, yieldKg: +e.target.value })} />
              </div>
              <div>
                <label className="label">Selling Price/kg</label>
                <input type="number" step="0.5" className="input" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: +e.target.value })} />
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Receipt size={18} className="text-primary-500" /> Profit Analysis</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isProfit ? 'bg-primary-50' : 'bg-error-50'}`}>
              <p className="text-sm text-gray-500 mb-1">Net Profit</p>
              <p className={`text-3xl font-bold ${isProfit ? 'text-primary-700' : 'text-error-700'}`}>{formatCurrency(netProfit)}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(profitPerHa)} per hectare</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</p>
              <div className="flex h-3 rounded-full overflow-hidden">
                {costBreakdown.map((c, i) => (
                  <div key={i} className={c.color} style={{ width: `${(c.value / totalCost) * 100}%` }} title={c.label} />
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                {costBreakdown.map((c, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${c.color}`} />
                    <p className="text-xs text-gray-500">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Gross Revenue</span>
                <span className="font-semibold text-sm">{formatCurrency(grossRevenue)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="font-semibold text-sm text-error-600">- {formatCurrency(totalCost)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="font-semibold text-sm">{grossRevenue > 0 ? `${((netProfit / grossRevenue) * 100).toFixed(1)}%` : '—'}</span>
              </div>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={saveCalculation}>
              <Save size={16} /> Save Calculation
            </button>
          </div>
        </Card>
      </div>

      {/* Saved calculations */}
      <Card>
        <h3 className="font-semibold mb-4">Saved Calculations</h3>
        {loading ? (
          <LoadingSpinner />
        ) : saved.length === 0 ? (
          <EmptyState message="No saved calculations yet" icon={<Calculator size={40} />} />
        ) : (
          <div className="space-y-2">
            {saved.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.net_profit > 0 ? 'bg-primary-100 text-primary-600' : 'bg-error-100 text-error-600'}`}>
                    {c.net_profit > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.crop_name} • {c.area_hectares} ha</p>
                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${c.net_profit > 0 ? 'text-primary-600' : 'text-error-600'}`}>{formatCurrency(c.net_profit)}</p>
                  <p className="text-xs text-gray-400">Net profit</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
