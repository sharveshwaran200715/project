// Agricultural knowledge base for recommendations and calculations

export const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean',
  'Tomato', 'Potato', 'Onion', 'Groundnut', 'Mustard', 'Pulses',
  'Cabbage', 'Cauliflower', 'Carrot', 'Banana', 'Mango', 'Chilli',
] as const

export const SOIL_TYPES = [
  'Loamy', 'Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Saline',
] as const

export interface CropInfo {
  name: string
  waterNeed: 'low' | 'medium' | 'high'
  phRange: [number, number]
  growingDays: number
  typicalYieldKgPerHa: number
  suitableSoils: string[]
}

export const CROP_INFO: Record<string, CropInfo> = {
  Rice: { name: 'Rice', waterNeed: 'high', phRange: [5.5, 6.5], growingDays: 120, typicalYieldKgPerHa: 4000, suitableSoils: ['Clay', 'Loamy'] },
  Wheat: { name: 'Wheat', waterNeed: 'medium', phRange: [6.0, 7.5], growingDays: 110, typicalYieldKgPerHa: 3500, suitableSoils: ['Loamy', 'Silty'] },
  Maize: { name: 'Maize', waterNeed: 'medium', phRange: [5.5, 7.0], growingDays: 90, typicalYieldKgPerHa: 5000, suitableSoils: ['Loamy', 'Sandy'] },
  Cotton: { name: 'Cotton', waterNeed: 'medium', phRange: [6.0, 7.5], growingDays: 150, typicalYieldKgPerHa: 2000, suitableSoils: ['Loamy', 'Sandy'] },
  Sugarcane: { name: 'Sugarcane', waterNeed: 'high', phRange: [6.0, 7.5], growingDays: 300, typicalYieldKgPerHa: 70000, suitableSoils: ['Loamy', 'Clay'] },
  Soybean: { name: 'Soybean', waterNeed: 'medium', phRange: [6.0, 7.0], growingDays: 100, typicalYieldKgPerHa: 2500, suitableSoils: ['Loamy', 'Silty'] },
  Tomato: { name: 'Tomato', waterNeed: 'medium', phRange: [6.0, 6.8], growingDays: 80, typicalYieldKgPerHa: 30000, suitableSoils: ['Loamy', 'Sandy'] },
  Potato: { name: 'Potato', waterNeed: 'medium', phRange: [5.0, 6.0], growingDays: 100, typicalYieldKgPerHa: 25000, suitableSoils: ['Loamy', 'Sandy'] },
  Onion: { name: 'Onion', waterNeed: 'low', phRange: [6.0, 7.0], growingDays: 90, typicalYieldKgPerHa: 20000, suitableSoils: ['Loamy', 'Sandy'] },
  Groundnut: { name: 'Groundnut', waterNeed: 'low', phRange: [5.5, 7.0], growingDays: 100, typicalYieldKgPerHa: 1500, suitableSoils: ['Sandy', 'Loamy'] },
  Mustard: { name: 'Mustard', waterNeed: 'low', phRange: [6.0, 7.5], growingDays: 110, typicalYieldKgPerHa: 1500, suitableSoils: ['Loamy', 'Silty'] },
  Pulses: { name: 'Pulses', waterNeed: 'low', phRange: [6.0, 7.0], growingDays: 90, typicalYieldKgPerHa: 1200, suitableSoils: ['Loamy', 'Sandy'] },
  Cabbage: { name: 'Cabbage', waterNeed: 'medium', phRange: [6.0, 7.0], growingDays: 75, typicalYieldKgPerHa: 35000, suitableSoils: ['Loamy', 'Silty'] },
  Cauliflower: { name: 'Cauliflower', waterNeed: 'medium', phRange: [6.0, 7.0], growingDays: 80, typicalYieldKgPerHa: 30000, suitableSoils: ['Loamy', 'Silty'] },
  Carrot: { name: 'Carrot', waterNeed: 'low', phRange: [6.0, 6.8], growingDays: 70, typicalYieldKgPerHa: 25000, suitableSoils: ['Sandy', 'Loamy'] },
  Banana: { name: 'Banana', waterNeed: 'high', phRange: [5.5, 7.0], growingDays: 300, typicalYieldKgPerHa: 40000, suitableSoils: ['Loamy', 'Clay'] },
  Mango: { name: 'Mango', waterNeed: 'low', phRange: [5.5, 7.5], growingDays: 365, typicalYieldKgPerHa: 10000, suitableSoils: ['Loamy', 'Sandy'] },
  Chilli: { name: 'Chilli', waterNeed: 'medium', phRange: [6.0, 7.0], growingDays: 120, typicalYieldKgPerHa: 8000, suitableSoils: ['Loamy', 'Sandy'] },
}

export interface DiseaseInfo {
  name: string
  crop: string
  symptoms: string
  cause: string
  severity: 'low' | 'medium' | 'high'
  type: 'disease' | 'pest'
  treatment: string
  prevention: string
}

export const DISEASE_DATABASE: DiseaseInfo[] = [
  { name: 'Blast Disease', crop: 'Rice', symptoms: 'Diamond-shaped lesions on leaves, neck rot', cause: 'Fungal (Magnaporthe oryzae)', severity: 'high', type: 'disease', treatment: 'Apply fungicide containing tricyclazole. Remove infected plants.', prevention: 'Use resistant varieties, maintain proper spacing, avoid excess nitrogen.' },
  { name: 'Rice Blast', crop: 'Rice', symptoms: 'White to gray lesions with brown borders', cause: 'Fungal infection', severity: 'high', type: 'disease', treatment: 'Spray with carbendazim 50% WP at 0.5g/L water', prevention: 'Plant resistant varieties, balanced fertilizer use' },
  { name: 'Wheat Rust', crop: 'Wheat', symptoms: 'Orange-brown pustules on leaves and stems', cause: 'Fungal (Puccinia spp.)', severity: 'high', type: 'disease', treatment: 'Apply propiconazole fungicide. Remove volunteer wheat plants.', prevention: 'Use rust-resistant varieties, timely planting, crop rotation.' },
  { name: 'Bacterial Blight', crop: 'Wheat', symptoms: 'Yellow streaks on leaves, black lesions', cause: 'Bacterial infection', severity: 'medium', type: 'disease', treatment: 'Copper-based bactericide spray', prevention: 'Use disease-free seeds, crop rotation' },
  { name: 'Fall Armyworm', crop: 'Maize', symptoms: 'Ragged holes in leaves, sawdust-like frass', cause: 'Insect (Spodoptera frugiperda)', severity: 'high', type: 'pest', treatment: 'Spray emamectin benzoate 5% SG. Use pheromone traps.', prevention: 'Plant early, use Bt maize varieties, intercrop with legumes.' },
  { name: 'Bollworm', crop: 'Cotton', symptoms: 'Holes in bolls, damaged squares, shed buds', cause: 'Insect (Helicoverpa armigera)', severity: 'high', type: 'pest', treatment: 'Spray chlorantraniliprole or spinosad. Use Bt cotton.', prevention: 'Use pheromone traps, crop rotation, biological control with Trichogramma.' },
  { name: 'Red Rot', crop: 'Sugarcane', symptoms: 'Red patches in internodes, fishy odor', cause: 'Fungal (Colletotrichum falcatum)', severity: 'high', type: 'disease', treatment: 'Remove infected canes, apply fungicide to setts before planting', prevention: 'Use resistant varieties, crop rotation, clean cultivation' },
  { name: 'Soybean Rust', crop: 'Soybean', symptoms: 'Tan to brown pustules on underside of leaves', cause: 'Fungal (Phakopsora pachyrhizi)', severity: 'medium', type: 'disease', treatment: 'Apply azoxystrobin fungicide at first sign', prevention: 'Use resistant varieties, narrow rows, avoid overhead irrigation' },
  { name: 'Early Blight', crop: 'Tomato', symptoms: 'Concentric ring spots on older leaves', cause: 'Fungal (Alternaria solani)', severity: 'medium', type: 'disease', treatment: 'Apply chlorothalonil or copper fungicide every 7-10 days', prevention: 'Crop rotation, mulching, avoid overhead watering, stake plants' },
  { name: 'Late Blight', crop: 'Tomato', symptoms: 'Water-soaked lesions, white mold on underside', cause: 'Fungal (Phytophthora infestans)', severity: 'high', type: 'disease', treatment: 'Apply cymoxanil + mancozeb immediately', prevention: 'Use resistant varieties, remove infected plants, avoid wet foliage' },
  { name: 'Early Blight', crop: 'Potato', symptoms: 'Dark brown spots with concentric rings', cause: 'Fungal (Alternaria solani)', severity: 'medium', type: 'disease', treatment: 'Apply mancozeb fungicide at 0.25%', prevention: 'Crop rotation, certified disease-free seed tubers' },
  { name: 'Purple Blotch', crop: 'Onion', symptoms: 'Purple lesions on leaves, bending of neck', cause: 'Fungal (Alternaria porri)', severity: 'medium', type: 'disease', treatment: 'Spray mancozeb 0.25% at weekly intervals', prevention: 'Crop rotation, proper spacing, avoid overhead irrigation' },
  { name: 'Tikka Leaf Spot', crop: 'Groundnut', symptoms: 'Small brown spots with yellow halos', cause: 'Fungal (Cercospora spp.)', severity: 'medium', type: 'disease', treatment: 'Spray carbendazim 0.05% at 2-week intervals', prevention: 'Crop rotation, use resistant varieties, seed treatment' },
  { name: 'Aphids', crop: 'Mustard', symptoms: 'Curled leaves, sticky honeydew, stunted growth', cause: 'Insect (Lipaphis erysimi)', severity: 'medium', type: 'pest', treatment: 'Spray imidacloprid 17.8% SL at 0.3ml/L', prevention: 'Early sowing, intercropping, use yellow sticky traps' },
  { name: 'Powdery Mildew', crop: 'Cabbage', symptoms: 'White powdery growth on leaf surface', cause: 'Fungal (Erysiphe cruciferarum)', severity: 'low', type: 'disease', treatment: 'Apply sulfur-based fungicide', prevention: 'Proper spacing, avoid excess nitrogen, crop rotation' },
  { name: 'Panama Wilt', crop: 'Banana', symptoms: 'Yellowing of leaves, splitting of pseudostem', cause: 'Fungal (Fusarium oxysporum)', severity: 'high', type: 'disease', treatment: 'No cure - remove and destroy infected plants, soil drench with carbendazim', prevention: 'Use tissue-culture plants, plant resistant varieties, avoid infected soil' },
]

export interface WeatherData {
  date: string
  tempHigh: number
  tempLow: number
  humidity: number
  rainChance: number
  condition: string
  windSpeed: number
}

export function generateWeatherForecast(): WeatherData[] {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Clear']
  const days: WeatherData[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const rainChance = Math.floor(Math.random() * 80) + 10
    const condition = rainChance > 60 ? (rainChance > 80 ? 'Heavy Rain' : 'Light Rain') : conditions[Math.floor(Math.random() * 3)]
    days.push({
      date: date.toISOString().split('T')[0],
      tempHigh: Math.floor(Math.random() * 12) + 24,
      tempLow: Math.floor(Math.random() * 8) + 14,
      humidity: Math.floor(Math.random() * 30) + 50,
      rainChance,
      condition,
      windSpeed: Math.floor(Math.random() * 20) + 5,
    })
  }
  return days
}

export function getFarmingAction(weather: WeatherData): { action: string; priority: 'low' | 'medium' | 'high'; icon: string }[] {
  const actions: { action: string; priority: 'low' | 'medium' | 'high'; icon: string }[] = []
  if (weather.rainChance > 70) {
    actions.push({ action: 'Rain expected — hold off on pesticide spraying and fertilizer application', priority: 'high', icon: 'rain' })
    actions.push({ action: 'Ensure proper drainage in low-lying fields to prevent waterlogging', priority: 'high', icon: 'flood' })
  } else if (weather.rainChance < 25 && weather.tempHigh > 33) {
    actions.push({ action: 'High temperature, low rain chance — increase irrigation frequency', priority: 'high', icon: 'sun' })
    actions.push({ action: 'Apply mulch to retain soil moisture and reduce evaporation', priority: 'medium', icon: 'mulch' })
  } else {
    actions.push({ action: 'Good conditions for field preparation and sowing activities', priority: 'low', icon: 'check' })
    actions.push({ action: 'Suitable day for fertilizer application and pesticide spraying', priority: 'medium', icon: 'spray' })
  }
  if (weather.humidity > 75) {
    actions.push({ action: 'High humidity increases fungal disease risk — monitor crops closely', priority: 'high', icon: 'alert' })
  }
  if (weather.windSpeed > 18) {
    actions.push({ action: 'Strong winds expected — delay spraying to prevent drift', priority: 'medium', icon: 'wind' })
  }
  return actions
}

export function calculateSoilHealthScore(ph: number, n: number, p: number, k: number, organic: number, moisture: number): number {
  let score = 0
  // pH score (0-25): ideal 6.0-7.0
  if (ph >= 6.0 && ph <= 7.0) score += 25
  else if (ph >= 5.5 && ph <= 7.5) score += 18
  else if (ph >= 5.0 && ph <= 8.0) score += 10
  else score += 5
  // Nitrogen score (0-25): ideal 40-80
  if (n >= 40 && n <= 80) score += 25
  else if (n >= 25 && n <= 100) score += 18
  else if (n >= 15) score += 10
  else score += 5
  // Phosphorus score (0-20): ideal 15-40
  if (p >= 15 && p <= 40) score += 20
  else if (p >= 10 && p <= 50) score += 14
  else if (p >= 5) score += 8
  else score += 3
  // Potassium score (0-15): ideal 80-150
  if (k >= 80 && k <= 150) score += 15
  else if (k >= 50 && k <= 200) score += 10
  else if (k >= 30) score += 6
  else score += 3
  // Organic matter score (0-10): ideal >2%
  if (organic >= 3) score += 10
  else if (organic >= 2) score += 7
  else if (organic >= 1) score += 4
  else score += 1
  // Moisture score (0-5): ideal 20-40%
  if (moisture >= 20 && moisture <= 40) score += 5
  else if (moisture >= 15 && moisture <= 50) score += 3
  else score += 1
  return Math.min(100, score)
}

export function getFertilizerRecommendation(ph: number, n: number, p: number, k: number, crop: string): string {
  const recs: string[] = []
  if (n < 25) recs.push('Apply nitrogen-rich fertilizer (Urea 46-0-0) at 50-80 kg/ha')
  else if (n < 40) recs.push('Moderate nitrogen needed — apply Urea at 30-40 kg/ha')
  if (p < 15) recs.push('Apply phosphorus fertilizer (DAP 18-46-0) at 40-50 kg/ha')
  else if (p < 25) recs.push('Light phosphorus dose — apply DAP at 20-25 kg/ha')
  if (k < 80) recs.push('Apply potash (Muriate of Potash 0-0-60) at 30-40 kg/ha')
  if (ph < 5.5) recs.push('Apply agricultural lime (1-2 tons/ha) to raise soil pH')
  else if (ph > 7.5) recs.push('Apply gypsum (500 kg/ha) or elemental sulfur to lower pH')
  if (recs.length === 0) recs.push('Soil nutrient levels are balanced — apply standard NPK 10-26-26 as maintenance dose')
  return recs.join('. ')
}

export function getCropSuitability(soilType: string, ph: number, crop: string): { suitable: boolean; reasons: string[] } {
  const reasons: string[] = []
  const info = CROP_INFO[crop]
  if (!info) return { suitable: true, reasons: ['Insufficient data for detailed analysis'] }
  let suitable = true
  if (!info.suitableSoils.includes(soilType)) {
    suitable = false
    reasons.push(`${crop} prefers ${info.suitableSoils.join(' or ')} soil, not ${soilType}`)
  }
  if (ph < info.phRange[0] || ph > info.phRange[1]) {
    suitable = false
    reasons.push(`pH should be ${info.phRange[0]}-${info.phRange[1]} for ${crop}, current pH is ${ph}`)
  } else {
    reasons.push(`pH level is within the ideal range for ${crop}`)
  }
  if (info.waterNeed === 'high') reasons.push(`${crop} requires high water availability`)
  if (suitable && info.suitableSoils.includes(soilType)) reasons.push(`${soilType} soil is well-suited for ${crop}`)
  return { suitable, reasons }
}

export function calculateIrrigation(crop: string, soilType: string, tempHigh: number, humidity: number, rainChance: number): {
  litersPerHa: number
  frequency: string
  method: string
  savingTip: string
} {
  const info = CROP_INFO[crop]
  const waterNeed = info?.waterNeed ?? 'medium'
  let baseLiters = waterNeed === 'high' ? 50000 : waterNeed === 'medium' ? 30000 : 15000
  if (tempHigh > 33) baseLiters *= 1.3
  if (humidity < 50) baseLiters *= 1.15
  if (rainChance > 60) baseLiters *= 0.4
  else if (rainChance > 30) baseLiters *= 0.7
  const freq = waterNeed === 'high' ? 'Every 2-3 days' : waterNeed === 'medium' ? 'Every 4-5 days' : 'Every 7 days'
  let method = 'Drip irrigation'
  if (waterNeed === 'high' && soilType === 'Clay') method = 'Furrow irrigation'
  else if (waterNeed === 'high') method = 'Flood irrigation'
  else if (soilType === 'Sandy') method = 'Drip irrigation (recommended for water retention)'
  const savingTip = rainChance > 50
    ? 'Rain expected — skip irrigation and rely on natural rainfall to save water'
    : 'Use drip irrigation to save 30-50% water compared to flood irrigation'
  return { litersPerHa: Math.round(baseLiters), frequency: freq, method, savingTip }
}

export function calculateSustainability(waterEff: number, chemical: number, soilPrac: number, wasteMgmt: number): {
  total: number
  grade: string
  recommendations: string[]
} {
  const total = waterEff + chemical + soilPrac + wasteMgmt
  let grade = 'D'
  if (total >= 85) grade = 'A+'
  else if (total >= 75) grade = 'A'
  else if (total >= 65) grade = 'B'
  else if (total >= 50) grade = 'C'
  const recs: string[] = []
  if (waterEff < 20) recs.push('Adopt drip irrigation to improve water use efficiency')
  if (chemical < 20) recs.push('Reduce chemical fertilizer use — switch to organic alternatives')
  if (soilPrac < 20) recs.push('Practice crop rotation and add organic matter to improve soil health')
  if (wasteMgmt < 20) recs.push('Compost crop residue instead of burning — generates value from waste')
  if (recs.length === 0) recs.push('Excellent sustainable practices! Maintain your current approach.')
  return { total, grade, recommendations: recs }
}

export const WASTE_DISPOSAL_METHODS = [
  { method: 'Composting', description: 'Decompose organic waste into nutrient-rich compost', valuePerKg: 2, co2SavedKg: 0.9 },
  { method: 'Mulching', description: 'Spread crop residue on soil to retain moisture and suppress weeds', valuePerKg: 1, co2SavedKg: 1.2 },
  { method: 'Biofertilizer Production', description: 'Convert waste into biofertilizer using microbial processes', valuePerKg: 5, co2SavedKg: 1.5 },
  { method: 'Biogas Production', description: 'Anaerobic digestion produces methane for cooking fuel', valuePerKg: 3, co2SavedKg: 2.0 },
  { method: 'Biochar', description: 'Pyrolysis converts waste into stable carbon for soil amendment', valuePerKg: 8, co2SavedKg: 2.5 },
  { method: 'Animal Feed', description: 'Process certain crop residues into livestock feed', valuePerKg: 4, co2SavedKg: 0.7 },
]
