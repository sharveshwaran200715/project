import { useState, useEffect } from 'react'
import {
  Compass,
  Droplets,
  Sprout,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Info,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  Save,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, Badge, SectionHeader, StatCard, LoadingSpinner } from './ui'
import { CROPS, CROP_INFO } from '../lib/agriData'
import { supabase } from '../lib/supabase'

export interface FarmScenario {
  id: string
  name: string
  isBaseline?: boolean
  crop: string
  farmAreaHa: number
  // Water & Irrigation
  waterAvailabilityPct: number // % of standard normal (e.g. 100 = 100%, 70 = -30%)
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'furrow'
  weatherAssumption: 'normal' | 'drought' | 'excess_rain' | 'heatwave'
  // Inputs & Resource usage
  fertilizerUsagePct: number // % of standard dose
  seedCost: number // ₹
  fertilizerCost: number // ₹
  labourCost: number // ₹
  waterCost: number // ₹
  powerFuelCost: number // ₹
  otherResourceCost: number // ₹
  // Yield & Pricing
  expectedYieldKg: number // base yield expected
  expectedSellingPricePerKg: number // ₹/kg
  marketPriceAssumption: number // ₹/kg
}

export interface SavedScenarioRecord {
  id: string
  name: string
  date: string
  crop: string
  areaHa: number
  netProfit: number
  waterLiters: number
  yieldKg: number
  scenario: FarmScenario
}

const STORAGE_KEY = 'farmwise_whatif_saved_history_v1'

const IRRIGATION_EFFICIENCY: Record<string, { factor: number; waterMultiplier: number; label: string }> = {
  drip: { factor: 1.1, waterMultiplier: 0.6, label: 'Drip (High Efficiency, -40% water)' },
  sprinkler: { factor: 1.02, waterMultiplier: 0.8, label: 'Sprinkler (Moderate, -20% water)' },
  flood: { factor: 0.95, waterMultiplier: 1.15, label: 'Flood (Traditional, +15% water)' },
  furrow: { factor: 0.98, waterMultiplier: 1.0, label: 'Furrow (Standard)' },
}

const WEATHER_MODIFIERS: Record<string, { yieldFactor: number; waterFactor: number; label: string }> = {
  normal: { yieldFactor: 1.0, waterFactor: 1.0, label: 'Normal Season (Favorable)' },
  drought: { yieldFactor: 0.8, waterFactor: 1.25, label: 'Drought / Dry Spell (-20% yield, +25% water demand)' },
  excess_rain: { yieldFactor: 0.92, waterFactor: 0.7, label: 'Excess Rain / Monsoonal (-8% yield, -30% irrigation needed)' },
  heatwave: { yieldFactor: 0.88, waterFactor: 1.2, label: 'Heatwave / Hot Spell (-12% yield, +20% evapotranspiration)' },
}

export default function WhatIfSimulator({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedHistory, setSavedHistory] = useState<SavedScenarioRecord[]>([])
  const [activeTab, setActiveTab] = useState<'comparison' | 'charts' | 'inputs' | 'assumptions' | 'history'>('comparison')

  // Baseline Scenario (Scenario 1: Current farming plan)
  const [baseline, setBaseline] = useState<FarmScenario>({
    id: 'baseline-current',
    name: 'Current Plan (Baseline)',
    isBaseline: true,
    crop: 'Wheat',
    farmAreaHa: 1.0,
    waterAvailabilityPct: 100,
    irrigationMethod: 'furrow',
    weatherAssumption: 'normal',
    fertilizerUsagePct: 100,
    seedCost: 2000,
    fertilizerCost: 3500,
    labourCost: 5500,
    waterCost: 1500,
    powerFuelCost: 1200,
    otherResourceCost: 1000,
    expectedYieldKg: 3500,
    expectedSellingPricePerKg: 24,
    marketPriceAssumption: 24,
  })

  // List of What-If Scenarios
  const [scenarios, setScenarios] = useState<FarmScenario[]>([
    {
      id: 'scenario-low-water',
      name: 'Scenario 2: Reduce Water by 30%',
      crop: 'Wheat',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 70,
      irrigationMethod: 'drip',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 100,
      seedCost: 2000,
      fertilizerCost: 3500,
      labourCost: 5200,
      waterCost: 1050,
      powerFuelCost: 950,
      otherResourceCost: 1000,
      expectedYieldKg: 3300,
      expectedSellingPricePerKg: 24,
      marketPriceAssumption: 24,
    },
    {
      id: 'scenario-change-crop',
      name: 'Scenario 3: Change Crop (Tomato)',
      crop: 'Tomato',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 100,
      irrigationMethod: 'drip',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 100,
      seedCost: 4500,
      fertilizerCost: 6500,
      labourCost: 9000,
      waterCost: 2200,
      powerFuelCost: 1800,
      otherResourceCost: 2500,
      expectedYieldKg: 28000,
      expectedSellingPricePerKg: 26,
      marketPriceAssumption: 26,
    },
    {
      id: 'scenario-reduce-fertilizer',
      name: 'Scenario 4: Reduce Fertilizer by 30%',
      crop: 'Wheat',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 100,
      irrigationMethod: 'furrow',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 70,
      seedCost: 2000,
      fertilizerCost: 2450,
      labourCost: 5300,
      waterCost: 1500,
      powerFuelCost: 1200,
      otherResourceCost: 900,
      expectedYieldKg: 3250,
      expectedSellingPricePerKg: 24,
      marketPriceAssumption: 24,
    },
    {
      id: 'scenario-increase-irrigation',
      name: 'Scenario 5: Increase Irrigation (+25%)',
      crop: 'Wheat',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 125,
      irrigationMethod: 'sprinkler',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 100,
      seedCost: 2000,
      fertilizerCost: 3600,
      labourCost: 5800,
      waterCost: 1900,
      powerFuelCost: 1500,
      otherResourceCost: 1100,
      expectedYieldKg: 3750,
      expectedSellingPricePerKg: 24,
      marketPriceAssumption: 24,
    },
    {
      id: 'scenario-selling-price',
      name: 'Scenario 6: Bull Market (+20% Price)',
      crop: 'Wheat',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 100,
      irrigationMethod: 'furrow',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 100,
      seedCost: 2000,
      fertilizerCost: 3500,
      labourCost: 5500,
      waterCost: 1500,
      powerFuelCost: 1200,
      otherResourceCost: 1000,
      expectedYieldKg: 3500,
      expectedSellingPricePerKg: 29,
      marketPriceAssumption: 29,
    },
    {
      id: 'scenario-resource-alloc',
      name: 'Scenario 7: Low-Input Sustainable Allocation',
      crop: 'Wheat',
      farmAreaHa: 1.0,
      waterAvailabilityPct: 80,
      irrigationMethod: 'drip',
      weatherAssumption: 'normal',
      fertilizerUsagePct: 75,
      seedCost: 2200,
      fertilizerCost: 2400,
      labourCost: 5000,
      waterCost: 950,
      powerFuelCost: 800,
      otherResourceCost: 850,
      expectedYieldKg: 3400,
      expectedSellingPricePerKg: 27,
      marketPriceAssumption: 27,
    },
  ])

  // Active scenario id (defaults to low-water scenario)
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-low-water')

  // Load real profile data on mount for baseline WITHOUT modifying any existing records
  useEffect(() => {
    async function loadBaselineDefaults() {
      try {
        const [farmRes, priceRes] = await Promise.all([
          supabase.from('farm_profiles').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
          supabase.from('crop_prices').select('*').order('recorded_date', { ascending: false }).limit(1).maybeSingle(),
        ])

        if (farmRes.data) {
          const farm = farmRes.data
          const crop = farm.main_crop || 'Wheat'
          const area = farm.area_hectares || 1.0
          const info = CROP_INFO[crop]
          const typicalYield = info ? Math.round(info.typicalYieldKgPerHa * area) : 3500 * area
          const price = priceRes.data?.crop_name === crop ? priceRes.data.price_per_kg : 24

          setBaseline(prev => ({
            ...prev,
            crop,
            farmAreaHa: area,
            expectedYieldKg: typicalYield,
            expectedSellingPricePerKg: price,
            marketPriceAssumption: price,
          }))
        }
      } catch (err) {
        console.error('Error loading baseline data:', err)
      } finally {
        setLoading(false)
      }
    }

    // Load saved history from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSavedHistory(JSON.parse(stored))
      }
    } catch {
      // Ignore local storage parse error
    }

    loadBaselineDefaults()
  }, [])

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0]

  // Calculate simulated metrics for a given scenario
  function calculateMetrics(s: FarmScenario) {
    const cropInfo = CROP_INFO[s.crop]
    const baseWaterPerHa = cropInfo?.waterNeed === 'high' ? 45000 : cropInfo?.waterNeed === 'medium' ? 25000 : 12000
    const irMethod = IRRIGATION_EFFICIENCY[s.irrigationMethod] || IRRIGATION_EFFICIENCY.furrow
    const weatherMod = WEATHER_MODIFIERS[s.weatherAssumption] || WEATHER_MODIFIERS.normal

    // Simulated Water Usage (Liters)
    const simulatedWaterLiters = Math.round(
      baseWaterPerHa * s.farmAreaHa * (s.waterAvailabilityPct / 100) * irMethod.waterMultiplier * weatherMod.waterFactor
    )

    // Fertilizer Usage (kg estimated)
    const baselineFertilizerKgPerHa = 120
    const simulatedFertilizerKg = Math.round(baselineFertilizerKgPerHa * s.farmAreaHa * (s.fertilizerUsagePct / 100))

    // Water factor impact on yield: water deficit below 100% reduces yield unless drip mitigates it
    const waterRatio = s.waterAvailabilityPct / 100
    const waterImpact = waterRatio < 1.0 ? 1.0 - (1.0 - waterRatio) * (s.irrigationMethod === 'drip' ? 0.4 : 0.75) : 1.0 + Math.min(0.08, (waterRatio - 1.0) * 0.2)

    // Fertilizer factor impact on yield
    const fertRatio = s.fertilizerUsagePct / 100
    const fertImpact = fertRatio < 1.0 ? 1.0 - (1.0 - fertRatio) * 0.35 : 1.0 + Math.min(0.06, (fertRatio - 1.0) * 0.15)

    // Simulated Expected Yield (kg)
    const estimatedYieldKg = Math.round(
      s.expectedYieldKg * waterImpact * fertImpact * irMethod.factor * weatherMod.yieldFactor
    )

    // Costs
    const totalCost = Math.round(
      s.seedCost +
      s.fertilizerCost +
      s.labourCost +
      s.waterCost +
      s.powerFuelCost +
      s.otherResourceCost
    )

    // Revenue & Profit
    const estimatedRevenue = Math.round(estimatedYieldKg * s.expectedSellingPricePerKg)
    const estimatedNetProfit = estimatedRevenue - totalCost
    const profitPerHa = s.farmAreaHa > 0 ? Math.round(estimatedNetProfit / s.farmAreaHa) : 0
    const profitPerAcre = Math.round(profitPerHa / 2.471)

    return {
      waterLiters: simulatedWaterLiters,
      fertilizerKg: simulatedFertilizerKg,
      yieldKg: estimatedYieldKg,
      totalCost,
      revenue: estimatedRevenue,
      netProfit: estimatedNetProfit,
      profitPerHa,
      profitPerAcre,
    }
  }

  const baselineMetrics = calculateMetrics(baseline)
  const scenarioMetrics = calculateMetrics(activeScenario)

  // Differences (Scenario vs Baseline)
  function getDiff(scenVal: number, baseVal: number) {
    const diff = scenVal - baseVal
    const pct = baseVal !== 0 ? (diff / baseVal) * 100 : 0
    return { diff, pct }
  }

  const waterDiff = getDiff(scenarioMetrics.waterLiters, baselineMetrics.waterLiters)
  const costDiff = getDiff(scenarioMetrics.totalCost, baselineMetrics.totalCost)
  const yieldDiff = getDiff(scenarioMetrics.yieldKg, baselineMetrics.yieldKg)
  const revenueDiff = getDiff(scenarioMetrics.revenue, baselineMetrics.revenue)
  const profitDiff = getDiff(scenarioMetrics.netProfit, baselineMetrics.netProfit)
  const profitPerHaDiff = getDiff(scenarioMetrics.profitPerHa, baselineMetrics.profitPerHa)

  // Currency Formatter
  function formatCurr(val: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Update an input field on the active scenario
  function updateActiveScenarioField<K extends keyof FarmScenario>(field: K, val: FarmScenario[K]) {
    setScenarios(prev =>
      prev.map(s => {
        if (s.id !== activeScenarioId) return s
        const updated = { ...s, [field]: val }
        // If crop changed, auto-update baseline yield and price recommendation
        if (field === 'crop') {
          const info = CROP_INFO[val as string]
          if (info) {
            updated.expectedYieldKg = Math.round(info.typicalYieldKgPerHa * updated.farmAreaHa)
          }
        }
        if (field === 'farmAreaHa') {
          const area = Number(val) || 1.0
          const info = CROP_INFO[updated.crop]
          if (info) {
            updated.expectedYieldKg = Math.round(info.typicalYieldKgPerHa * area)
          }
        }
        return updated
      })
    )
  }

  // Scenario management: Add, Duplicate, Delete, Rename
  function handleAddScenario() {
    const newId = `scenario-custom-${Date.now()}`
    const newScenario: FarmScenario = {
      ...activeScenario,
      id: newId,
      name: `Custom Scenario ${scenarios.length + 1}`,
      isBaseline: false,
    }
    setScenarios([...scenarios, newScenario])
    setActiveScenarioId(newId)
  }

  function handleDuplicateScenario() {
    const newId = `scenario-dup-${Date.now()}`
    const copy: FarmScenario = {
      ...activeScenario,
      id: newId,
      name: `${activeScenario.name} (Copy)`,
      isBaseline: false,
    }
    setScenarios([...scenarios, copy])
    setActiveScenarioId(newId)
  }

  function handleDeleteScenario(id: string) {
    if (scenarios.length <= 1) return
    const filtered = scenarios.filter(s => s.id !== id)
    setScenarios(filtered)
    if (activeScenarioId === id) {
      setActiveScenarioId(filtered[0].id)
    }
  }

  function startRename(id: string, currentName: string) {
    setEditingNameId(id)
    setTempName(currentName)
  }

  function saveRename() {
    if (!tempName.trim()) {
      setEditingNameId(null)
      return
    }
    setScenarios(prev =>
      prev.map(s => (s.id === editingNameId ? { ...s, name: tempName.trim() } : s))
    )
    setEditingNameId(null)
  }

  // Quick preset loader
  function loadPreset(presetNumber: number) {
    if (presetNumber === 1) {
      // Switch back to baseline view
      setActiveScenarioId(scenarios[0].id)
    } else if (presetNumber === 2) {
      updateActiveScenarioField('waterAvailabilityPct', 70)
      updateActiveScenarioField('irrigationMethod', 'drip')
    } else if (presetNumber === 3) {
      updateActiveScenarioField('crop', activeScenario.crop === 'Tomato' ? 'Maize' : 'Tomato')
    } else if (presetNumber === 4) {
      updateActiveScenarioField('fertilizerUsagePct', 70)
      updateActiveScenarioField('fertilizerCost', Math.round(activeScenario.fertilizerCost * 0.7))
    } else if (presetNumber === 5) {
      updateActiveScenarioField('waterAvailabilityPct', 125)
      updateActiveScenarioField('irrigationMethod', 'sprinkler')
    } else if (presetNumber === 6) {
      updateActiveScenarioField('expectedSellingPricePerKg', Math.round(activeScenario.expectedSellingPricePerKg * 1.25))
    } else if (presetNumber === 7) {
      updateActiveScenarioField('waterAvailabilityPct', 80)
      updateActiveScenarioField('fertilizerUsagePct', 75)
      updateActiveScenarioField('irrigationMethod', 'drip')
      updateActiveScenarioField('fertilizerCost', Math.round(activeScenario.fertilizerCost * 0.75))
      updateActiveScenarioField('waterCost', Math.round(activeScenario.waterCost * 0.8))
    }
  }

  // Save scenario to History (isolated localStorage only)
  function saveSimulationToHistory() {
    const record: SavedScenarioRecord = {
      id: `sim-hist-${Date.now()}`,
      name: activeScenario.name,
      date: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      crop: activeScenario.crop,
      areaHa: activeScenario.farmAreaHa,
      netProfit: scenarioMetrics.netProfit,
      waterLiters: scenarioMetrics.waterLiters,
      yieldKg: scenarioMetrics.yieldKg,
      scenario: { ...activeScenario },
    }
    const updated = [record, ...savedHistory.slice(0, 19)]
    setSavedHistory(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  function restoreSavedScenario(record: SavedScenarioRecord) {
    const existing = scenarios.find(s => s.id === record.scenario.id)
    if (existing) {
      setActiveScenarioId(existing.id)
    } else {
      const restored = { ...record.scenario, id: `restored-${Date.now()}` }
      setScenarios([...scenarios, restored])
      setActiveScenarioId(restored.id)
    }
    setActiveTab('comparison')
  }

  function deleteSavedRecord(id: string) {
    const updated = savedHistory.filter(h => h.id !== id)
    setSavedHistory(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }

  // Generate dynamic, farmer-friendly explanation
  function generateExplanation(): string[] {
    const reasons: string[] = []

    // Water reason
    if (activeScenario.waterAvailabilityPct < baseline.waterAvailabilityPct) {
      const diffWater = baselineMetrics.waterLiters - scenarioMetrics.waterLiters
      reasons.push(
        `Reducing water availability to ${activeScenario.waterAvailabilityPct}% decreased simulated irrigation usage by ${diffWater.toLocaleString()} L. ${
          activeScenario.irrigationMethod === 'drip'
            ? 'Using drip irrigation prevented severe crop stress by focusing water directly to the plant root zone.'
            : 'Without micro-irrigation, standard soil moisture deficit leads to a simulated yield reduction.'
        }`
      )
    } else if (activeScenario.waterAvailabilityPct > baseline.waterAvailabilityPct) {
      reasons.push(
        `Increasing water availability (+${activeScenario.waterAvailabilityPct - baseline.waterAvailabilityPct}%) allows optimal transpiration, supporting vegetative expansion and a higher simulated yield.`
      )
    }

    // Crop change reason
    if (activeScenario.crop !== baseline.crop) {
      reasons.push(
        `Switching crop from ${baseline.crop} to ${activeScenario.crop} completely shifts the biological yield potential (simulated ${scenarioMetrics.yieldKg.toLocaleString()} kg) and selling price (₹${activeScenario.expectedSellingPricePerKg}/kg), altering both revenue and operating input needs.`
      )
    }

    // Fertilizer reason
    if (activeScenario.fertilizerUsagePct < baseline.fertilizerUsagePct) {
      reasons.push(
        `Reducing fertilizer usage to ${activeScenario.fertilizerUsagePct}% cut fertilizer costs by ${formatCurr(baseline.fertilizerCost - activeScenario.fertilizerCost)}, with a slight simulated yield reduction due to lower nutrient availability.`
      )
    } else if (activeScenario.fertilizerUsagePct > baseline.fertilizerUsagePct) {
      reasons.push(
        `Higher fertilizer input (+${activeScenario.fertilizerUsagePct - baseline.fertilizerUsagePct}%) increases direct input costs while providing incremental yield benefits subject to diminishing returns.`
      )
    }

    // Selling price reason
    if (activeScenario.expectedSellingPricePerKg !== baseline.expectedSellingPricePerKg) {
      const priceDelta = activeScenario.expectedSellingPricePerKg - baseline.expectedSellingPricePerKg
      reasons.push(
        `The ${priceDelta > 0 ? 'higher' : 'lower'} assumed selling price (₹${activeScenario.expectedSellingPricePerKg}/kg vs baseline ₹${baseline.expectedSellingPricePerKg}/kg) has an immediate ${priceDelta > 0 ? 'positive' : 'negative'} leverage on gross revenue and net profit per hectare.`
      )
    }

    // Irrigation method
    if (activeScenario.irrigationMethod !== baseline.irrigationMethod) {
      reasons.push(
        `Switching irrigation method from ${baseline.irrigationMethod} to ${activeScenario.irrigationMethod} alters water distribution efficiency (${IRRIGATION_EFFICIENCY[activeScenario.irrigationMethod].label}), saving pumping energy and conserving groundwater.`
      )
    }

    // Weather
    if (activeScenario.weatherAssumption !== 'normal') {
      reasons.push(
        `The assumed weather condition (${WEATHER_MODIFIERS[activeScenario.weatherAssumption].label}) simulates stress factors, altering crop evapotranspiration and harvestable biomass.`
      )
    }

    if (reasons.length === 0) {
      reasons.push(
        'The scenario currently matches baseline parameters. Adjust any variable on the left or click a preset to simulate hypothetical changes.'
      )
    }

    return reasons
  }

  const explanations = generateExplanation()

  // Chart data for Recharts
  const financialChartData = [
    {
      metric: 'Total Cost',
      'Current Plan': baselineMetrics.totalCost,
      'What-If Scenario': scenarioMetrics.totalCost,
    },
    {
      metric: 'Gross Revenue',
      'Current Plan': baselineMetrics.revenue,
      'What-If Scenario': scenarioMetrics.revenue,
    },
    {
      metric: 'Net Profit',
      'Current Plan': baselineMetrics.netProfit,
      'What-If Scenario': scenarioMetrics.netProfit,
    },
  ]

  const resourceChartData = [
    {
      metric: 'Yield (kg)',
      'Current Plan': baselineMetrics.yieldKg,
      'What-If Scenario': scenarioMetrics.yieldKg,
    },
    {
      metric: 'Water (100 L)',
      'Current Plan': Math.round(baselineMetrics.waterLiters / 100),
      'What-If Scenario': Math.round(scenarioMetrics.waterLiters / 100),
    },
    {
      metric: 'Fertilizer (kg)',
      'Current Plan': baselineMetrics.fertilizerKg,
      'What-If Scenario': scenarioMetrics.fertilizerKg,
    },
  ]

  if (loading) return <LoadingSpinner message="Loading Farm Simulator..." />

  return (
    <div className="animate-fadeIn space-y-6">
      {/* ===== SECTION HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="🌾 What-If Farm Simulator"
          subtitle="Test hypothetical farming decisions, resource allocations, and market changes before applying them in the real world"
          icon={<Compass size={22} />}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={saveSimulationToHistory}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saveSuccess ? 'Scenario Saved!' : 'Save Simulation'}
          </button>
          <button
            onClick={() => onNavigate?.('support')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
          >
            <PhoneCall size={14} />
            Talk to Agronomist
          </button>
        </div>
      </div>

      {/* ===== MANDATORY SIMULATION DISCLAIMER ===== */}
      <div className="rounded-2xl p-4 bg-amber-50/90 border border-amber-200 text-amber-900 shadow-sm space-y-2">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm tracking-tight text-amber-950">
              Simulation Disclaimer — Estimates Only
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              "Simulation only — results are estimates based on the assumptions entered and are not guaranteed real-world outcomes."
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              "Actual results may vary depending on weather, soil conditions, crop performance, market prices, farming practices, and other factors."
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-amber-900/80">
              <span className="inline-flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60">
                🔒 Real Farm Data Protected
              </span>
              <span>•</span>
              <span>All outputs are clearly identified as simulated estimates.</span>
              <span>•</span>
              <span>Never treated as guaranteed predictions.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== QUICK 1-CLICK PRESET SCENARIO BAR ===== */}
      <div className="card p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary-600" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Quick 1-Click Hypothetical Scenarios:
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Click to apply instant what-if variables</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset(1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            Scenario 1: Current Plan
          </button>
          <button
            onClick={() => loadPreset(2)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
          >
            Scenario 2: Low Water (-30%)
          </button>
          <button
            onClick={() => loadPreset(3)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
          >
            Scenario 3: Change Crop
          </button>
          <button
            onClick={() => loadPreset(4)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
          >
            Scenario 4: Reduce Fertilizer (-30%)
          </button>
          <button
            onClick={() => loadPreset(5)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
          >
            Scenario 5: Increase Irrigation (+25%)
          </button>
          <button
            onClick={() => loadPreset(6)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
          >
            Scenario 6: Bull Market Price (+25%)
          </button>
          <button
            onClick={() => loadPreset(7)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
          >
            Scenario 7: Sustainable Resource Allocation
          </button>
        </div>
      </div>

      {/* ===== SCENARIO TAB MANAGER (Add, Rename, Duplicate, Delete) ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Scenario List */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {scenarios.map(s => {
            const isActive = s.id === activeScenarioId
            return (
              <div
                key={s.id}
                className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
                onClick={() => setActiveScenarioId(s.id)}
              >
                {editingNameId === s.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      className="bg-white text-gray-900 px-2 py-0.5 rounded text-xs outline-none border border-gray-300 w-36"
                      autoFocus
                    />
                    <button onClick={saveRename} className="p-1 hover:bg-primary-700 rounded text-white">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingNameId(null)} className="p-1 hover:bg-primary-700 rounded text-white">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{s.name}</span>
                    <button
                      title="Rename"
                      onClick={e => {
                        e.stopPropagation()
                        startRename(s.id, s.name)
                      }}
                      className={`opacity-60 hover:opacity-100 p-0.5 rounded ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      <Edit2 size={11} />
                    </button>
                    {scenarios.length > 1 && (
                      <button
                        title="Delete"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteScenario(s.id)
                        }}
                        className={`opacity-60 hover:opacity-100 p-0.5 rounded hover:text-red-500 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddScenario}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Plus size={13} /> Add Scenario
          </button>
          <button
            onClick={handleDuplicateScenario}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <Copy size={13} /> Duplicate
          </button>
        </div>
      </div>

      {/* ===== NAVIGATION PILLS (Comparison, Charts, Inputs, Assumptions, History) ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'comparison'
              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Side-by-Side Comparison
        </button>
        <button
          onClick={() => setActiveTab('inputs')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'inputs'
              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Scenario Variables & Inputs
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'charts'
              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Visual Chart Analysis
        </button>
        <button
          onClick={() => setActiveTab('assumptions')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'assumptions'
              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Assumptions & Logic
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Clock size={13} />
          Saved Simulations ({savedHistory.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SIDE-BY-SIDE COMPARISON & RESULT IMPACT */}
      {/* ============================================================== */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* ===== 🌾 SIMULATION RESULT IMPACT BANNER ===== */}
          <div className="card p-6 bg-gradient-to-br from-green-950 via-emerald-900 to-green-900 text-white rounded-3xl relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    🌾 Simulation Result
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">
                    What changes if I choose this scenario?
                  </h3>
                  <p className="text-xs text-green-200/80 mt-0.5">
                    Comparing <span className="font-semibold text-white">Current Plan</span> vs.{' '}
                    <span className="font-semibold text-green-300">{activeScenario.name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                    Hypothetical Model
                  </span>
                </div>
              </div>

              {/* 5 Impact Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Water Impact */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-green-300/80">Estimated Water Impact</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black">
                      {waterDiff.diff <= 0 ? '↓' : '↑'} {Math.abs(waterDiff.pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-green-200/70 mt-0.5 truncate">
                    {waterDiff.diff <= 0 ? 'Savings: ' : 'Increase: '}
                    {Math.abs(waterDiff.diff).toLocaleString()} L
                  </p>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">[Simulated]</span>
                </div>

                {/* Cost Impact */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-green-300/80">Estimated Cost Impact</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black">
                      {costDiff.diff <= 0 ? '↓' : '↑'} {Math.abs(costDiff.pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-green-200/70 mt-0.5 truncate">
                    {costDiff.diff <= 0 ? 'Savings: ' : 'Extra: '}
                    {formatCurr(Math.abs(costDiff.diff))}
                  </p>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">[Simulated]</span>
                </div>

                {/* Yield Impact */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-green-300/80">Estimated Yield Impact</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black">
                      {yieldDiff.diff >= 0 ? '↑' : '↓'} {Math.abs(yieldDiff.pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-green-200/70 mt-0.5 truncate">
                    {yieldDiff.diff >= 0 ? '+' : ''}
                    {yieldDiff.diff.toLocaleString()} kg
                  </p>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">[Simulated]</span>
                </div>

                {/* Revenue Impact */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-green-300/80">Estimated Revenue</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black">
                      {revenueDiff.diff >= 0 ? '↑' : '↓'} {Math.abs(revenueDiff.pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-green-200/70 mt-0.5 truncate">
                    {revenueDiff.diff >= 0 ? '+' : ''}
                    {formatCurr(revenueDiff.diff)}
                  </p>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">[Simulated]</span>
                </div>

                {/* Net-Result Impact */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 col-span-2 sm:col-span-1">
                  <p className="text-[10px] uppercase font-bold text-green-300/80">Estimated Net Result</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black">
                      {profitDiff.diff >= 0 ? '↑' : '↓'} {Math.abs(profitDiff.pct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-green-200/70 mt-0.5 truncate">
                    Net: {profitDiff.diff >= 0 ? '+' : ''}
                    {formatCurr(profitDiff.diff)}
                  </p>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">[Simulated]</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SIDE-BY-SIDE COMPARISON TABLE / CARDS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* CURRENT PLAN (COLUMN 1) */}
            <div className="card border-2 border-gray-200 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <Badge color="gray">Baseline</Badge>
                  <h4 className="text-base font-black text-gray-900 mt-1">CURRENT PLAN</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {baseline.crop} • {baseline.farmAreaHa} ha
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Method</span>
                  <span className="text-xs font-semibold text-gray-700 capitalize">{baseline.irrigationMethod}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Water Usage:</span>
                  <span className="font-bold text-gray-800">{baselineMetrics.waterLiters.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Estimated Fertilizer:</span>
                  <span className="font-bold text-gray-800">{baselineMetrics.fertilizerKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Expected Yield:</span>
                  <span className="font-bold text-gray-800">{baselineMetrics.yieldKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Estimated Total Cost:</span>
                  <span className="font-bold text-gray-800">{formatCurr(baselineMetrics.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Estimated Revenue:</span>
                  <span className="font-bold text-gray-800">{formatCurr(baselineMetrics.revenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-xl">
                  <span className="font-bold text-gray-700">Estimated Net Profit:</span>
                  <span className="font-black text-gray-900 text-sm">{formatCurr(baselineMetrics.netProfit)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3">
                  <span className="text-gray-500">Estimated Profit / Ha:</span>
                  <span className="font-semibold text-gray-700">{formatCurr(baselineMetrics.profitPerHa)} / ha</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center font-medium italic">
                * All values marked as Simulated / Estimated based on entered baseline
              </p>
            </div>

            {/* WHAT-IF SCENARIO (COLUMN 2) */}
            <div className="card border-2 border-primary-500 p-5 rounded-3xl space-y-4 shadow-md relative bg-gradient-to-b from-primary-50/30 to-transparent">
              <div className="absolute -top-3 right-4">
                <span className="bg-primary-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                  Active Simulation
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-primary-100 pb-3">
                <div>
                  <Badge color="green">Simulated</Badge>
                  <h4 className="text-base font-black text-gray-900 mt-1 truncate max-w-[190px]">
                    {activeScenario.name}
                  </h4>
                  <p className="text-xs text-primary-700 font-medium">
                    {activeScenario.crop} • {activeScenario.farmAreaHa} ha
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Method</span>
                  <span className="text-xs font-semibold text-primary-800 capitalize">
                    {activeScenario.irrigationMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-primary-50">
                  <span className="text-gray-600">Simulated Water:</span>
                  <span className="font-bold text-primary-900">{scenarioMetrics.waterLiters.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-primary-50">
                  <span className="text-gray-600">Simulated Fertilizer:</span>
                  <span className="font-bold text-primary-900">{scenarioMetrics.fertilizerKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-primary-50">
                  <span className="text-gray-600">Simulated Yield:</span>
                  <span className="font-bold text-primary-900">{scenarioMetrics.yieldKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-primary-50">
                  <span className="text-gray-600">Simulated Total Cost:</span>
                  <span className="font-bold text-primary-900">{formatCurr(scenarioMetrics.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-primary-50">
                  <span className="text-gray-600">Simulated Revenue:</span>
                  <span className="font-bold text-primary-900">{formatCurr(scenarioMetrics.revenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary-100/70 px-3 rounded-xl border border-primary-200">
                  <span className="font-bold text-primary-900">Simulated Net Profit:</span>
                  <span className="font-black text-primary-950 text-sm">{formatCurr(scenarioMetrics.netProfit)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3">
                  <span className="text-gray-600">Simulated Profit / Ha:</span>
                  <span className="font-semibold text-primary-900">{formatCurr(scenarioMetrics.profitPerHa)} / ha</span>
                </div>
              </div>
              <p className="text-[10px] text-primary-600/80 text-center font-medium italic">
                * Simulated outcomes are hypothetical estimates
              </p>
            </div>

            {/* DIFFERENCE / DELTA (COLUMN 3) */}
            <div className="card border-2 border-dashed border-gray-300 p-5 rounded-3xl space-y-4 bg-gray-50/50">
              <div className="border-b border-gray-200 pb-3">
                <Badge color="blue">Variance</Badge>
                <h4 className="text-base font-black text-gray-900 mt-1">VARIANCE & SAVINGS</h4>
                <p className="text-xs text-gray-500 font-medium">Difference relative to Current Plan</p>
              </div>

              <div className="space-y-3 text-xs">
                {/* Water Diff */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">Water Difference:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      waterDiff.diff <= 0 ? 'text-emerald-700' : 'text-blue-700'
                    }`}
                  >
                    {waterDiff.diff <= 0 ? '↓' : '↑'} {Math.abs(waterDiff.diff).toLocaleString()} L (
                    {Math.abs(waterDiff.pct).toFixed(1)}%)
                  </span>
                </div>

                {/* Fertilizer Diff */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">Fertilizer Difference:</span>
                  <span
                    className={`font-bold ${
                      scenarioMetrics.fertilizerKg <= baselineMetrics.fertilizerKg
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {scenarioMetrics.fertilizerKg - baselineMetrics.fertilizerKg <= 0 ? '↓' : '↑'}{' '}
                    {Math.abs(scenarioMetrics.fertilizerKg - baselineMetrics.fertilizerKg)} kg
                  </span>
                </div>

                {/* Yield Diff */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">Yield Difference:</span>
                  <span
                    className={`font-bold ${
                      yieldDiff.diff >= 0 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {yieldDiff.diff >= 0 ? '↑' : '↓'} {Math.abs(yieldDiff.diff).toLocaleString()} kg (
                    {Math.abs(yieldDiff.pct).toFixed(1)}%)
                  </span>
                </div>

                {/* Cost Diff */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">Total Cost Difference:</span>
                  <span
                    className={`font-bold ${
                      costDiff.diff <= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {costDiff.diff <= 0 ? '↓ Savings ' : '↑ Extra '}
                    {formatCurr(Math.abs(costDiff.diff))} ({Math.abs(costDiff.pct).toFixed(1)}%)
                  </span>
                </div>

                {/* Revenue Diff */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-gray-600">Revenue Difference:</span>
                  <span
                    className={`font-bold ${
                      revenueDiff.diff >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {revenueDiff.diff >= 0 ? '↑ ' : '↓ '}
                    {formatCurr(Math.abs(revenueDiff.diff))} ({Math.abs(revenueDiff.pct).toFixed(1)}%)
                  </span>
                </div>

                {/* Net Profit Diff */}
                <div className="flex justify-between items-center py-2 bg-white px-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="font-bold text-gray-800">Net Profit Variance:</span>
                  <span
                    className={`font-black text-sm ${
                      profitDiff.diff >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {profitDiff.diff >= 0 ? '↑ +' : '↓ '}
                    {formatCurr(profitDiff.diff)} ({profitDiff.pct >= 0 ? '+' : ''}
                    {profitDiff.pct.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 px-3">
                  <span className="text-gray-600">Profit / Acre Variance:</span>
                  <span
                    className={`font-bold ${
                      profitDiff.diff >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {profitDiff.diff >= 0 ? '+' : ''}
                    {formatCurr(Math.round(profitPerHaDiff.diff / 2.471))} / acre
                  </span>
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('inputs')}
                  className="w-full text-center py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
                >
                  Tune Scenario Variables →
                </button>
              </div>
            </div>
          </div>

          {/* ===== WHY DID THIS SCENARIO PRODUCE A DIFFERENT RESULT? ===== */}
          <div className="card p-6 rounded-3xl border border-blue-100 bg-blue-50/40 space-y-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Info size={18} className="text-blue-600" />
              <h4 className="font-black text-base">Why did this scenario produce a different result?</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Here is how the changed variables interact dynamically within the simulation model:
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              {explanations.map((exp, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed flex-1">{exp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SCENARIO VARIABLES & INPUTS (Interactive sliders/fields) */}
      {/* ============================================================== */}
      {activeTab === 'inputs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Adjust Variables for "{activeScenario.name}"
              </h3>
              <p className="text-xs text-gray-500">
                All changes calculate dynamically without affecting your real farm database.
              </p>
            </div>
            <button
              onClick={() => {
                // Reset active scenario to baseline clone
                setScenarios(prev =>
                  prev.map(s => (s.id === activeScenarioId ? { ...baseline, id: s.id, name: s.name } : s))
                )
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <RotateCcw size={13} /> Reset to Baseline
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARD 1: CROP & LAND AREA */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-gray-900 font-bold text-sm">
                <Sprout size={16} className="text-primary-600" />
                <span>Crop Selection & Land Area</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="label">Crop Selection</label>
                  <select
                    className="input"
                    value={activeScenario.crop}
                    onChange={e => updateActiveScenarioField('crop', e.target.value)}
                  >
                    {CROPS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Typical yield: {CROP_INFO[activeScenario.crop]?.typicalYieldKgPerHa.toLocaleString() || '3,500'} kg/ha
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Farm Area (Hectares)</label>
                    <span className="font-bold text-gray-800">{activeScenario.farmAreaHa} ha ({Math.round(activeScenario.farmAreaHa * 2.471)} acres)</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="15"
                    step="0.2"
                    value={activeScenario.farmAreaHa}
                    onChange={e => updateActiveScenarioField('farmAreaHa', parseFloat(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>

                <div>
                  <label className="label">Weather Assumption</label>
                  <select
                    className="input"
                    value={activeScenario.weatherAssumption}
                    onChange={e => updateActiveScenarioField('weatherAssumption', e.target.value as any)}
                  >
                    <option value="normal">Normal Season (Favorable)</option>
                    <option value="drought">Drought / Dry Spell (-20% Yield)</option>
                    <option value="excess_rain">Excess Rain / Flood Risk (-8% Yield)</option>
                    <option value="heatwave">Heatwave / High Temperature (-12% Yield)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 2: WATER & IRRIGATION ALLOCATION */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-gray-900 font-bold text-sm">
                <Droplets size={16} className="text-secondary-600" />
                <span>Water & Irrigation Parameters</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Water Availability (% of baseline)</label>
                    <span className={`font-bold ${activeScenario.waterAvailabilityPct < 100 ? 'text-amber-600' : 'text-blue-600'}`}>
                      {activeScenario.waterAvailabilityPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="160"
                    step="5"
                    value={activeScenario.waterAvailabilityPct}
                    onChange={e => updateActiveScenarioField('waterAvailabilityPct', parseInt(e.target.value))}
                    className="w-full accent-secondary-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>40% (Severe Deficit)</span>
                    <span>100% (Normal)</span>
                    <span>160% (Abundant)</span>
                  </div>
                </div>

                <div>
                  <label className="label">Irrigation Method</label>
                  <select
                    className="input"
                    value={activeScenario.irrigationMethod}
                    onChange={e => updateActiveScenarioField('irrigationMethod', e.target.value as any)}
                  >
                    <option value="drip">Drip Irrigation (40% Water Saved, Highest Efficiency)</option>
                    <option value="sprinkler">Sprinkler Irrigation (20% Water Saved)</option>
                    <option value="furrow">Furrow Irrigation (Standard baseline)</option>
                    <option value="flood">Flood Irrigation (Traditional, +15% water use)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Water / Pumping Energy Cost (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={activeScenario.waterCost}
                    onChange={e => updateActiveScenarioField('waterCost', Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: INPUT COSTS & RESOURCES */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-gray-900 font-bold text-sm">
                <DollarSign size={16} className="text-amber-600" />
                <span>Input Costs & Operating Budget (₹)</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Fertilizer Application Level</label>
                    <span className="font-bold text-gray-800">{activeScenario.fertilizerUsagePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    step="5"
                    value={activeScenario.fertilizerUsagePct}
                    onChange={e => {
                      const pct = parseInt(e.target.value)
                      updateActiveScenarioField('fertilizerUsagePct', pct)
                      // Pro-rate fertilizer cost
                      updateActiveScenarioField('fertilizerCost', Math.round((baseline.fertilizerCost * pct) / 100))
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Seed Cost (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={activeScenario.seedCost}
                      onChange={e => updateActiveScenarioField('seedCost', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div>
                    <label className="label">Fertilizer Cost (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={activeScenario.fertilizerCost}
                      onChange={e => updateActiveScenarioField('fertilizerCost', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div>
                    <label className="label">Labour Cost (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={activeScenario.labourCost}
                      onChange={e => updateActiveScenarioField('labourCost', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div>
                    <label className="label">Electricity/Fuel (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={activeScenario.powerFuelCost}
                      onChange={e => updateActiveScenarioField('powerFuelCost', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Other Resource Costs (Equipment, Pest Control) (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={activeScenario.otherResourceCost}
                    onChange={e => updateActiveScenarioField('otherResourceCost', Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: YIELD & PRICING ASSUMPTIONS */}
            <div className="card p-5 space-y-4 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-gray-900 font-bold text-sm">
                <Calculator size={16} className="text-primary-600" />
                <span>Yield & Selling Price Assumptions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="label">Base Expected Yield (kg for {activeScenario.farmAreaHa} ha)</label>
                  <input
                    type="number"
                    className="input"
                    value={activeScenario.expectedYieldKg}
                    onChange={e => updateActiveScenarioField('expectedYieldKg', Math.max(1, parseInt(e.target.value) || 0))}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Auto-adjusted by the model for water stress and fertilizer application levels.
                  </p>
                </div>
                <div>
                  <label className="label">Expected Selling Price (₹ / kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={activeScenario.expectedSellingPricePerKg}
                    onChange={e => updateActiveScenarioField('expectedSellingPricePerKg', Math.max(1, parseFloat(e.target.value) || 0))}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Your anticipated farmgate or local mandi sale rate.
                  </p>
                </div>
                <div>
                  <label className="label">Market Benchmark Price Assumption (₹ / kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={activeScenario.marketPriceAssumption}
                    onChange={e => updateActiveScenarioField('marketPriceAssumption', Math.max(1, parseFloat(e.target.value) || 0))}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Government MSP or wholesale APMC benchmark reference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setActiveTab('comparison')}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              View Side-by-Side Comparison →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: VISUAL CHART ANALYSIS (Recharts) */}
      {/* ============================================================== */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">
              Visual Scenario Comparison (Recharts)
            </h3>
            <span className="text-xs text-gray-400">Current Plan vs. {activeScenario.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Financial Comparison Chart */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900">Financial Comparison (₹)</h4>
                <Badge color="green">Simulated</Badge>
              </div>
              <p className="text-xs text-gray-500">
                Cost, Revenue, and Net Profit comparison between Current Plan and {activeScenario.name}.
              </p>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: number) => [formatCurr(val), '']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend />
                    <Bar dataKey="Current Plan" fill="#9ca3af" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="What-If Scenario" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resource & Yield Chart */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900">Resource & Yield Comparison</h4>
                <Badge color="blue">Simulated</Badge>
              </div>
              <p className="text-xs text-gray-500">
                Harvest Yield (kg), Water (x100 L), and Fertilizer (kg) requirements.
              </p>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: number, name: string) => [val.toLocaleString(), name]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend />
                    <Bar dataKey="Current Plan" fill="#64748b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="What-If Scenario" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cost Allocation Visual Stack */}
          <div className="card p-5 space-y-4">
            <h4 className="font-bold text-sm text-gray-900">
              Estimated Cost Breakdown Comparison (₹)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Baseline Breakdown */}
              <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
                <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-gray-200">
                  <span>Current Plan Costs</span>
                  <span>{formatCurr(baselineMetrics.totalCost)}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Seed</span>
                    <span>{formatCurr(baseline.seedCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Fertilizer</span>
                    <span>{formatCurr(baseline.fertilizerCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Labour</span>
                    <span>{formatCurr(baseline.labourCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Water Pumping</span>
                    <span>{formatCurr(baseline.waterCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Electricity / Fuel</span>
                    <span>{formatCurr(baseline.powerFuelCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Other Resources</span>
                    <span>{formatCurr(baseline.otherResourceCost)}</span>
                  </div>
                </div>
              </div>

              {/* Scenario Breakdown */}
              <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 space-y-2">
                <div className="flex justify-between font-bold text-primary-900 pb-1 border-b border-primary-200">
                  <span>{activeScenario.name} Costs</span>
                  <span>{formatCurr(scenarioMetrics.totalCost)}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-700">
                    <span>Seed</span>
                    <span>{formatCurr(activeScenario.seedCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Fertilizer</span>
                    <span>{formatCurr(activeScenario.fertilizerCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Labour</span>
                    <span>{formatCurr(activeScenario.labourCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Water Pumping</span>
                    <span>{formatCurr(activeScenario.waterCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Electricity / Fuel</span>
                    <span>{formatCurr(activeScenario.powerFuelCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Other Resources</span>
                    <span>{formatCurr(activeScenario.otherResourceCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ASSUMPTIONS & LOGIC */}
      {/* ============================================================== */}
      {activeTab === 'assumptions' && (
        <div className="card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-2 text-gray-900 font-black text-lg border-b border-gray-100 pb-3">
            <Layers size={20} className="text-primary-600" />
            <span>Assumptions Used in this Simulation</span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            The What-If Farm Simulator uses explicit mathematical modeling assumptions based on published agronomic research (ICAR & FAO guidelines). The calculations are parameterized as follows:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 space-y-2 border border-gray-100">
              <h5 className="font-black text-gray-900 text-sm">🌾 Crop Yield & Moisture Sensitivity</h5>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>Expected yield is based on the entered estimate and adjusted for water/fertilizer deviations.</li>
                <li>Water deficit below 100% reduces yield proportionally according to the Ky (yield response factor).</li>
                <li>Adoption of drip irrigation mitigates water deficit stress by maintaining high moisture retention in the active root zone.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 space-y-2 border border-gray-100">
              <h5 className="font-black text-gray-900 text-sm">💧 Water & Irrigation Logic</h5>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>Water usage is based on the selected irrigation assumption and crop water demand.</li>
                <li>Drip irrigation uses approximately 40% less water for equivalent transpiration relative to flood irrigation.</li>
                <li>Sprinkler irrigation achieves 20% water conservation under normal wind speeds.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 space-y-2 border border-gray-100">
              <h5 className="font-black text-gray-900 text-sm">💰 Costs & Financial Economics</h5>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>Costs are based on the values entered by the farmer.</li>
                <li>Selling price is based on the entered scenario value.</li>
                <li>Pumping energy and labour are modeled according to irrigation frequency and volume.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 space-y-2 border border-gray-100">
              <h5 className="font-black text-gray-900 text-sm">⚠️ Boundaries & Limitations</h5>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>Results do not account for every real-world variable such as unexpected pest infestations, unseasonal hail, or sudden hyper-inflation.</li>
                <li>If real agricultural data or sensor telemetry is unavailable, clearly labeled demo/sample assumptions are used.</li>
                <li>Sample data is never presented as live data.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SAVED SCENARIO HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="card p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-black text-lg">
              <Clock size={20} className="text-primary-600" />
              <span>Saved Simulation History</span>
            </div>
            <button
              onClick={saveSimulationToHistory}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Save Current Simulation
            </button>
          </div>

          <div className="rounded-xl bg-blue-50/80 p-3 text-xs text-blue-900 flex items-center gap-2">
            <Info size={15} className="shrink-0 text-blue-600" />
            <span>
              Simulation history is saved in your browser's private workspace. Running or saving simulations will{' '}
              <strong className="font-black">NEVER modify your real farm records, crop progress, or database profiles.</strong>
            </span>
          </div>

          {savedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p>No saved simulations yet.</p>
              <p className="text-[11px] mt-1 text-gray-400">
                Click "Save Simulation" above to bookmark hypothetical models for future reference.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedHistory.map(rec => (
                <div
                  key={rec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/70 border border-gray-100 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-gray-900">{rec.name}</h5>
                      <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {rec.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Crop: <strong className="text-gray-800">{rec.crop}</strong> ({rec.areaHa} ha) • Water:{' '}
                      <strong>{rec.waterLiters.toLocaleString()} L</strong> • Yield:{' '}
                      <strong>{rec.yieldKg.toLocaleString()} kg</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Simulated Net Profit</span>
                      <span className="text-sm font-black text-primary-700">{formatCurr(rec.netProfit)}</span>
                    </div>
                    <button
                      onClick={() => restoreSavedScenario(rec)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-700 transition-colors"
                    >
                      Restore & View
                    </button>
                    <button
                      onClick={() => deleteSavedRecord(rec.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SAFETY AND UNCERTAINTY ADVISORY BANNER ===== */}
      <div className="card p-5 rounded-3xl bg-gray-900 text-white space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert size={18} />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-sm text-white">
              Agricultural Safety & Real-World Uncertainty Advisory
            </h4>
            <p className="text-gray-300 leading-relaxed">
              The What-If Farm Simulator does not provide guaranteed agricultural or financial outcomes. For high-impact decisions involving fertilizer dosages, pesticides, irrigation shifts, crop selection, and major financial capital investments, please validate your plan with a certified agricultural extension officer (KVK) or FarmWise scientist.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate?.('support')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-gray-950 hover:bg-amber-300 transition-colors"
              >
                <PhoneCall size={13} />
                Connect with 24x7 Agronomist Hotline →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
