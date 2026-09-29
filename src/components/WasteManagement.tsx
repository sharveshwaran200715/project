import { useState, useEffect } from 'react'
import { Recycle, Trash2, Leaf, Flame, DollarSign, Cloud } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner, StatCard, ProgressBar } from './ui'
import { WASTE_DISPOSAL_METHODS } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { WasteRecord } from '../lib/types'

export default function WasteManagement() {
  const [records, setRecords] = useState<WasteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [wasteType, setWasteType] = useState('Rice Straw')
  const [quantity, setQuantity] = useState(500)
  const [selectedMethod, setSelectedMethod] = useState('Composting')

  const wasteTypes = ['Rice Straw', 'Wheat Stalk', 'Maize Stalk', 'Cotton Stalk', 'Sugarcane Bagasse', 'Pulses Residue', 'Vegetable Waste', 'Husks & Shells']

  useEffect(() => { loadRecords() }, [])

  async function loadRecords() {
    setLoading(true)
    const { data } = await supabase.from('waste_management').select('*').order('created_at', { ascending: false }).limit(10)
    setRecords(data || [])
    setLoading(false)
  }

  const method = WASTE_DISPOSAL_METHODS.find(m => m.method === selectedMethod)
  const valueGenerated = method ? method.valuePerKg * quantity : 0
  const co2Saved = method ? method.co2SavedKg * quantity : 0
  const burningCo2 = quantity * 1.5

  async function saveRecord() {
    await supabase.from('waste_management').insert({
      waste_type: wasteType,
      quantity_kg: quantity,
      disposal_method: selectedMethod,
      value_generated: valueGenerated,
      notes: `${method?.description || ''}`,
    })
    loadRecords()
  }

  const totalValue = records.reduce((s, r) => s + r.value_generated, 0)
  const totalWaste = records.reduce((s, r) => s + r.quantity_kg, 0)
  const totalCo2Saved = records.reduce((s, r) => {
    const m = WASTE_DISPOSAL_METHODS.find(x => x.method === r.disposal_method)
    return s + (m ? m.co2SavedKg * r.quantity_kg : 0)
  }, 0)

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Agricultural Waste Management"
        subtitle="Turn crop waste into value instead of burning it"
        icon={<Recycle size={20} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Recycle size={20} />} label="Waste Processed" value={`${(totalWaste / 1000).toFixed(1)}T`} sublabel="from saved records" color="primary" />
        <StatCard icon={<DollarSign size={20} />} label="Value Generated" value={`₹${totalValue.toLocaleString()}`} sublabel="from waste-to-value" color="accent" />
        <StatCard icon={<Cloud size={20} />} label="CO₂ Saved" value={`${(totalCo2Saved / 1000).toFixed(1)}T`} sublabel="vs burning" color="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <h3 className="font-semibold mb-4">Waste Details</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Waste Type</label>
              <select className="input" value={wasteType} onChange={e => setWasteType(e.target.value)}>
                {wasteTypes.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity (kg): {quantity}</label>
              <input type="range" min="50" max="5000" step="50" className="w-full accent-primary-600" value={quantity} onChange={e => setQuantity(+e.target.value)} />
            </div>
            <div>
              <label className="label">Disposal Method</label>
              <div className="grid grid-cols-2 gap-2">
                {WASTE_DISPOSAL_METHODS.map(m => (
                  <button
                    key={m.method}
                    onClick={() => setSelectedMethod(m.method)}
                    className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${selectedMethod === m.method ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {m.method}
                  </button>
                ))}
              </div>
            </div>
            {method && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        <Card>
          <h3 className="font-semibold mb-4">Environmental & Economic Impact</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-primary-50 rounded-xl">
                <DollarSign size={20} className="text-primary-600 mb-2" />
                <p className="text-xs text-gray-500">Value Generated</p>
                <p className="text-2xl font-bold text-primary-700">₹{valueGenerated.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-secondary-50 rounded-xl">
                <Cloud size={20} className="text-secondary-600 mb-2" />
                <p className="text-xs text-gray-500">CO₂ Saved</p>
                <p className="text-2xl font-bold text-secondary-700">{co2Saved.toFixed(0)} kg</p>
              </div>
            </div>
            <div className="p-4 bg-error-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-error-600" />
                <p className="text-sm font-medium text-error-700">Burning vs Sustainable Disposal</p>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-error-600">Burning: {burningCo2.toFixed(0)} kg CO₂</span>
                    <span className="text-primary-600">{selectedMethod}: {co2Saved.toFixed(0)} kg CO₂</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-error-500" style={{ width: '50%' }} />
                    <div className="bg-primary-500" style={{ width: '50%' }} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  You save {(co2Saved - 0).toFixed(0)} kg CO₂ by choosing {selectedMethod} over burning.
                </p>
              </div>
            </div>
            <button className="btn-primary w-full" onClick={saveRecord}>Save Record</button>
          </div>
        </Card>
      </div>

      {/* Waste-to-value ideas */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Leaf size={18} className="text-primary-500" /> Waste-to-Value Ideas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WASTE_DISPOSAL_METHODS.map((m, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{m.method}</h4>
                <Badge color="green">₹{m.valuePerKg}/kg</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-2">{m.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <Cloud size={12} className="text-secondary-500" />
                <span className="text-gray-500">Saves {m.co2SavedKg} kg CO₂/kg</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Past records */}
      <Card>
        <h3 className="font-semibold mb-4">Waste Management History</h3>
        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <EmptyState message="No waste records yet" icon={<Trash2 size={40} />} />
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Recycle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.waste_type} • {r.disposal_method}</p>
                    <p className="text-xs text-gray-500">{r.quantity_kg} kg • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="green">₹{r.value_generated.toLocaleString()}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
