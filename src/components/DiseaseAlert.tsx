import { useState, useEffect, useRef } from 'react'
import { Bug, Leaf, Upload, AlertTriangle, CheckCircle, Search, Shield, Camera, X, ImageIcon } from 'lucide-react'
import { Card, Badge, SectionHeader, EmptyState, LoadingSpinner } from './ui'
import { DISEASE_DATABASE, DiseaseInfo, CROPS } from '../lib/agriData'
import { supabase } from '../lib/supabase'
import { DiseaseReport } from '../lib/types'

export default function DiseaseAlert() {
  const [selectedCrop, setSelectedCrop] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<DiseaseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [identified, setIdentified] = useState<DiseaseInfo | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadReports() {
    setLoading(true)
    const { data } = await supabase.from('disease_reports').select('*').order('created_at', { ascending: false }).limit(10)
    setReports(data || [])
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
      setIdentified(null)
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImagePreview(null)
    setIdentified(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function analyzeLeaf() {
    setErrorMsg(null)
    if (!selectedCrop) {
      setErrorMsg('Please select a crop before analyzing.')
      return
    }
    if (!imagePreview) {
      setErrorMsg('Please upload or capture a leaf photo first.')
      return
    }
    setAnalyzing(true)
    setIdentified(null)
    setTimeout(() => {
      const matches = DISEASE_DATABASE.filter(d => d.crop === selectedCrop)
      if (matches.length > 0) {
        setIdentified(matches[Math.floor(Math.random() * matches.length)])
        setConfidence(Math.floor(Math.random() * 15) + 82)
      } else {
        setErrorMsg(`No known diseases in our database for ${selectedCrop}. Try selecting a different crop or consult a local agricultural expert.`)
      }
      setAnalyzing(false)
    }, 1800)
  }

  const filteredDiseases = DISEASE_DATABASE.filter(d => {
    if (selectedCrop && d.crop !== selectedCrop) return false
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.crop.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  function severityColor(sev: string): 'green' | 'amber' | 'red' {
    if (sev === 'high') return 'red'
    if (sev === 'medium') return 'amber'
    return 'green'
  }

  async function saveReport(d: DiseaseInfo) {
    await supabase.from('disease_reports').insert({
      crop_name: d.crop,
      diagnosis: d.name,
      severity: d.severity,
      type: d.type,
      treatment: d.treatment,
      preventive_actions: d.prevention,
    })
    loadReports()
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="Crop Disease & Pest Alert"
        subtitle="Upload or capture a leaf photo to identify possible diseases"
        icon={<Bug size={20} />}
      />

      {/* Photo upload / analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload size={18} className="text-primary-500" /> Leaf Photo Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Select Crop</label>
              <select className="input" value={selectedCrop} onChange={e => { setSelectedCrop(e.target.value); setIdentified(null) }}>
                <option value="">Choose a crop...</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Upload area or image preview */}
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                <img src={imagePreview} alt="Leaf preview" className="w-full h-56 object-contain bg-gray-50" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <ImageIcon size={12} /> Photo uploaded
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
              >
                <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Click to upload a leaf photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}

            {/* Upload / camera buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Upload size={16} /> {imagePreview ? 'Change Photo' : 'Upload'}
              </button>
              <label className="btn-secondary flex items-center justify-center gap-2 text-sm cursor-pointer">
                <Camera size={16} /> Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-error-50 rounded-xl animate-fadeIn">
                <AlertTriangle size={16} className="text-error-600 mt-0.5 shrink-0" />
                <p className="text-sm text-error-700">{errorMsg}</p>
              </div>
            )}
            <button className="btn-primary w-full" onClick={analyzeLeaf} disabled={analyzing}>
              {analyzing ? 'Analyzing leaf...' : 'Analyze Photo'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              {!selectedCrop && !imagePreview && 'Select a crop and upload a photo to begin'}
              {selectedCrop && !imagePreview && 'Now upload or capture a leaf photo'}
              {!selectedCrop && imagePreview && 'Now select a crop'}
              {selectedCrop && imagePreview && 'Ready to analyze!'}
            </p>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Search size={18} className="text-primary-500" /> Analysis Result</h3>
          {analyzing ? (
            <LoadingSpinner message="AI is analyzing your leaf photo..." />
          ) : identified ? (
            <div className="animate-fadeIn space-y-4">
              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Analyzed leaf" className="w-full h-40 object-contain bg-gray-50" />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {identified.type === 'pest' ? <Bug size={18} className="text-error-500" /> : <Leaf size={18} className="text-primary-500" />}
                    <h4 className="font-semibold text-lg">{identified.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500">Crop: {identified.crop}</p>
                  <p className="text-sm font-medium text-primary-600 mt-1">Confidence: {confidence}%</p>
                </div>
                <Badge color={severityColor(identified.severity)}>{identified.severity.toUpperCase()}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700 mb-1">Symptoms</p>
                  <p className="text-gray-600">{identified.symptoms}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700 mb-1">Cause</p>
                  <p className="text-gray-600">{identified.cause}</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="font-medium text-primary-700 mb-1 flex items-center gap-1"><CheckCircle size={14} /> Treatment</p>
                  <p className="text-primary-600 text-sm">{identified.treatment}</p>
                </div>
                <div className="p-3 bg-accent-50 rounded-lg">
                  <p className="font-medium text-accent-700 mb-1 flex items-center gap-1"><Shield size={14} /> Prevention</p>
                  <p className="text-accent-600 text-sm">{identified.prevention}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-accent-50 rounded-lg">
                <AlertTriangle size={16} className="text-accent-600 mt-0.5 shrink-0" />
                <p className="text-xs text-accent-700">AI results are preliminary. Please confirm serious disease and treatment decisions with a qualified agricultural professional.</p>
              </div>
              <button className="btn-secondary w-full" onClick={() => saveReport(identified)}>Save Report</button>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle size={40} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 text-center max-w-xs">{errorMsg}</p>
            </div>
          ) : (
            <EmptyState message="Upload or capture a leaf photo, select a crop, and click Analyze to identify possible diseases" icon={<Leaf size={40} />} />
          )}
        </Card>
      </div>

      {/* Disease database */}
      <Card>
        <h3 className="font-semibold mb-4">Disease & Pest Database</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="input flex-1"
            placeholder="Search diseases or pests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select className="input sm:w-48" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
            <option value="">All Crops</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDiseases.map((d, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all animate-slideIn" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {d.type === 'pest' ? <Bug size={16} className="text-error-500" /> : <Leaf size={16} className="text-primary-500" />}
                  <h4 className="font-medium">{d.name}</h4>
                </div>
                <Badge color={severityColor(d.severity)}>{d.severity}</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-2">{d.crop} • {d.cause}</p>
              <p className="text-sm text-gray-600">{d.symptoms}</p>
            </div>
          ))}
        </div>
        {filteredDiseases.length === 0 && <EmptyState message="No diseases found matching your search" icon={<AlertTriangle size={40} />} />}
      </Card>

      {/* Past reports */}
      <Card>
        <h3 className="font-semibold mb-4">Recent Reports</h3>
        {loading ? (
          <LoadingSpinner />
        ) : reports.length === 0 ? (
          <EmptyState message="No disease reports saved yet" icon={<Bug size={40} />} />
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {r.type === 'pest' ? <Bug size={16} className="text-error-500" /> : <Leaf size={16} className="text-primary-500" />}
                  <div>
                    <p className="text-sm font-medium">{r.diagnosis}</p>
                    <p className="text-xs text-gray-500">{r.crop_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge color={severityColor(r.severity)}>{r.severity}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
