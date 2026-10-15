import PMScheme from '../../model/PMSchemes.js';

// ─── PM Schemes ───────────────────────────────────────────────────────────────
// Fetches relevant schemes from MongoDB; falls back to static data if DB is
// unavailable or returns no results.

const FALLBACK_SCHEMES = [
  {
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Income support of ₹6,000/year to all landholding farmer families in three equal instalments.',
    benefitsDescription: '₹6,000 per year in three instalments of ₹2,000 each, directly into the bank account.',
    eligibilityCriteria: 'All landholding farmer families excluding institutional landholders and high-income earners.',
    requiredDocuments: ['aadhaarCard', 'landRecords', 'bankPassbook'],
    officialWebsite: 'https://pmkisan.gov.in/',
  },
  {
    schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme that protects farmers against crop failure due to natural calamities.',
    benefitsDescription: 'Comprehensive insurance cover against crop failure at low premium rates.',
    eligibilityCriteria: 'All farmers growing notified crops in a notified area who have insurable interest in the crop.',
    requiredDocuments: ['aadhaarCard', 'landRecords', 'bankPassbook', 'kisanCreditCard'],
    officialWebsite: 'https://pmfby.gov.in/',
  },
  {
    schemeName: 'Kisan Credit Card (KCC)',
    description: 'Provides farmers with timely access to credit for agricultural and allied activities.',
    benefitsDescription: 'Short-term credit at 4% interest rate per annum with credit up to ₹3 lakh.',
    eligibilityCriteria: 'All farmers, including tenant farmers, oral lessees, and SHGs involved in farming.',
    requiredDocuments: ['aadhaarCard', 'landRecords', 'bankPassbook'],
    officialWebsite: 'https://www.nabard.org/',
  },
];

export async function fetchSchemes(query: string): Promise<any[]> {
  try {
    // Attempt a keyword search in MongoDB
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    let schemes: any[] = [];

    if (keywords.length > 0) {
      schemes = await PMScheme.find({
        $or: [
          { schemeName: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } },
          { eligibilityCriteria: { $regex: keywords.join('|'), $options: 'i' } },
        ],
      })
        .limit(5)
        .lean();
    }

    // If no keyword match, return all schemes (up to 10)
    if (schemes.length === 0) {
      schemes = await PMScheme.find({}).limit(10).lean();
    }

    return schemes.length > 0 ? schemes : FALLBACK_SCHEMES;
  } catch {
    // DB unavailable — use static fallback
    return FALLBACK_SCHEMES;
  }
}

// ─── Mandi / Market Data ──────────────────────────────────────────────────────
// Returns mock mandi price data relevant to the query.

const MANDI_DATA = [
  { crop: 'Wheat', price: 2275, unit: 'quintal', market: 'Delhi', trend: 'rising', change: '+₹45' },
  { crop: 'Rice (Paddy)', price: 2183, unit: 'quintal', market: 'Lucknow', trend: 'stable', change: '₹0' },
  { crop: 'Maize', price: 1890, unit: 'quintal', market: 'Pune', trend: 'falling', change: '-₹30' },
  { crop: 'Soybean', price: 4500, unit: 'quintal', market: 'Indore', trend: 'rising', change: '+₹120' },
  { crop: 'Cotton', price: 6800, unit: 'quintal', market: 'Ahmedabad', trend: 'rising', change: '+₹200' },
  { crop: 'Potato', price: 1540, unit: 'quintal', market: 'Agra', trend: 'falling', change: '-₹60' },
  { crop: 'Onion', price: 2100, unit: 'quintal', market: 'Nashik', trend: 'stable', change: '+₹10' },
  { crop: 'Tomato', price: 3200, unit: 'quintal', market: 'Bangalore', trend: 'rising', change: '+₹400' },
  { crop: 'Mustard', price: 5400, unit: 'quintal', market: 'Jaipur', trend: 'stable', change: '+₹20' },
  { crop: 'Sugarcane', price: 350, unit: 'quintal', market: 'Kanpur', trend: 'stable', change: '₹0' },
  { crop: 'Gram (Chana)', price: 5100, unit: 'quintal', market: 'Bhopal', trend: 'falling', change: '-₹80' },
  { crop: 'Groundnut', price: 5700, unit: 'quintal', market: 'Rajkot', trend: 'rising', change: '+₹150' },
];

export function getMandiData(query: string): typeof MANDI_DATA {
  const q = query.toLowerCase();
  // Try to return relevant crops first
  const matched = MANDI_DATA.filter(
    (m) =>
      q.includes(m.crop.toLowerCase()) ||
      m.crop.toLowerCase().split(/\s+/).some((word) => q.includes(word))
  );
  return matched.length > 0 ? matched : MANDI_DATA;
}

// ─── Disease / Pest Data ──────────────────────────────────────────────────────

const DISEASE_DATA = [
  {
    disease: 'Wheat Rust (Yellow Stripe Rust)',
    crop: 'Wheat',
    symptoms: 'Yellow stripes on leaves, powdery yellow-orange spores, leaf drying',
    cause: 'Fungus: Puccinia striiformis',
    treatment: 'Propiconazole 25 EC @ 1ml/L, Tebuconazole 250 EC @ 1ml/L',
    prevention: 'Resistant varieties (PBW 343), early sowing, avoid dense planting',
    urgency: 'HIGH',
  },
  {
    disease: 'Rice Blast',
    crop: 'Rice',
    symptoms: 'Diamond-shaped lesions with gray center and brown border on leaves and neck',
    cause: 'Fungus: Magnaporthe oryzae',
    treatment: 'Tricyclazole 75 WP @ 0.6g/L, Carbendazim 50 WP @ 1g/L',
    prevention: 'Balanced nitrogen fertilization, avoid water stress, resistant varieties',
    urgency: 'HIGH',
  },
  {
    disease: 'Cotton Bollworm',
    crop: 'Cotton',
    symptoms: 'Holes in bolls, frass (droppings), damaged bolls turning brownish',
    cause: 'Pest: Helicoverpa armigera',
    treatment: 'Indoxacarb 15.8 SC @ 0.75ml/L, Spinosad 45 SC @ 0.2ml/L',
    prevention: 'Bt cotton varieties, pheromone traps, intercropping with maize',
    urgency: 'MEDIUM',
  },
  {
    disease: 'Tomato Early Blight',
    crop: 'Tomato',
    symptoms: 'Brown spots with concentric rings on older leaves, yellow halo around spots',
    cause: 'Fungus: Alternaria solani',
    treatment: 'Mancozeb 75 WP @ 2.5g/L, Azoxystrobin 23 SC @ 1ml/L',
    prevention: 'Crop rotation, avoid overhead irrigation, remove infected leaves',
    urgency: 'MEDIUM',
  },
  {
    disease: 'Powdery Mildew',
    crop: 'General (Cucurbits, Grapes, Mustard)',
    symptoms: 'White powdery coating on leaves and stems, leaf yellowing and distortion',
    cause: 'Fungus: Erysiphe spp.',
    treatment: 'Sulfur 80 WP @ 3g/L, Myclobutanil 10 WP @ 1g/L',
    prevention: 'Good air circulation, avoid overcrowding, remove infected plant parts',
    urgency: 'LOW',
  },
  {
    disease: 'Aphid Infestation',
    crop: 'General (Mustard, Wheat, Vegetables)',
    symptoms: 'Curled/distorted leaves, sticky honeydew on leaves, ants around plant',
    cause: 'Pest: Aphids (various species)',
    treatment: 'Imidacloprid 17.8 SL @ 0.5ml/L, Dimethoate 30 EC @ 2ml/L',
    prevention: 'Neem oil spray, encourage natural predators (ladybirds), intercropping',
    urgency: 'LOW',
  },
];

export function getDiseaseData(query: string): typeof DISEASE_DATA {
  const q = query.toLowerCase();
  const matched = DISEASE_DATA.filter(
    (d) =>
      q.includes(d.crop.toLowerCase()) ||
      q.includes(d.disease.toLowerCase()) ||
      d.symptoms.toLowerCase().split(' ').some((w) => w.length > 4 && q.includes(w))
  );
  return matched.length > 0 ? matched : DISEASE_DATA;
}

// ─── Crop Recommendation Data ─────────────────────────────────────────────────

const CROP_RECOMMENDATION_DATA = [
  {
    crop: 'Wheat',
    season: 'Rabi (Oct–Mar)',
    soilType: ['Loamy', 'Clay loam'],
    rainfall: '300–400mm',
    temperature: '10–25°C',
    states: ['Punjab', 'Haryana', 'UP', 'MP', 'Rajasthan'],
    yield: '35–50 quintal/acre',
    profitability: 'HIGH',
    investment: '₹15,000–20,000/acre',
  },
  {
    crop: 'Rice (Paddy)',
    season: 'Kharif (Jun–Nov)',
    soilType: ['Clay', 'Clay loam', 'Alluvial'],
    rainfall: '1000–2000mm',
    temperature: '20–35°C',
    states: ['WB', 'UP', 'Punjab', 'Andhra Pradesh', 'Odisha'],
    yield: '25–40 quintal/acre',
    profitability: 'MEDIUM',
    investment: '₹18,000–25,000/acre',
  },
  {
    crop: 'Maize',
    season: 'Kharif (Jun–Sep) / Rabi (Nov–Mar)',
    soilType: ['Sandy loam', 'Loamy'],
    rainfall: '500–800mm',
    temperature: '18–27°C',
    states: ['Karnataka', 'MP', 'Rajasthan', 'Bihar', 'UP'],
    yield: '20–35 quintal/acre',
    profitability: 'MEDIUM',
    investment: '₹12,000–18,000/acre',
  },
  {
    crop: 'Soybean',
    season: 'Kharif (Jun–Oct)',
    soilType: ['Black soil', 'Loamy'],
    rainfall: '600–1000mm',
    temperature: '20–30°C',
    states: ['MP', 'Maharashtra', 'Rajasthan', 'Karnataka'],
    yield: '8–15 quintal/acre',
    profitability: 'HIGH',
    investment: '₹10,000–15,000/acre',
  },
  {
    crop: 'Cotton',
    season: 'Kharif (Apr–Nov)',
    soilType: ['Black cotton soil', 'Alluvial'],
    rainfall: '500–1000mm',
    temperature: '20–35°C',
    states: ['Gujarat', 'Maharashtra', 'Telangana', 'Punjab', 'Haryana'],
    yield: '6–12 quintal/acre (lint)',
    profitability: 'HIGH',
    investment: '₹20,000–35,000/acre',
  },
  {
    crop: 'Mustard',
    season: 'Rabi (Oct–Mar)',
    soilType: ['Sandy loam', 'Loamy'],
    rainfall: '250–500mm',
    temperature: '10–25°C',
    states: ['Rajasthan', 'UP', 'Haryana', 'MP', 'WB'],
    yield: '6–12 quintal/acre',
    profitability: 'HIGH',
    investment: '₹8,000–12,000/acre',
  },
  {
    crop: 'Tomato',
    season: 'All seasons (with irrigation)',
    soilType: ['Well-drained loamy', 'Sandy loam'],
    rainfall: '400–600mm',
    temperature: '18–27°C',
    states: ['Maharashtra', 'Karnataka', 'AP', 'UP', 'HP'],
    yield: '120–200 quintal/acre',
    profitability: 'VERY HIGH',
    investment: '₹40,000–60,000/acre',
  },
  {
    crop: 'Potato',
    season: 'Rabi (Oct–Mar)',
    soilType: ['Sandy loam', 'Loamy'],
    rainfall: '500–700mm',
    temperature: '15–20°C',
    states: ['UP', 'WB', 'Bihar', 'Punjab', 'Gujarat'],
    yield: '100–150 quintal/acre',
    profitability: 'HIGH',
    investment: '₹35,000–50,000/acre',
  },
];

export function getCropRecommendationData(query: string): typeof CROP_RECOMMENDATION_DATA {
  const q = query.toLowerCase();
  const matched = CROP_RECOMMENDATION_DATA.filter(
    (c) =>
      q.includes(c.crop.toLowerCase()) ||
      c.soilType.some((s) => q.includes(s.toLowerCase())) ||
      c.states.some((st) => q.includes(st.toLowerCase())) ||
      q.includes(c.season.toLowerCase().split(' ')[0])
  );
  return matched.length > 0 ? matched : CROP_RECOMMENDATION_DATA;
}
