// ============================================================
// MOCK DATA ENGINE — Simulates real NSE/BSE institutional data
// ============================================================
import type {
  MacroData, SectorData, StockData, TradeSetup,
  Alert, AIPrediction, MarketRegime, TickerItem, RBIPolicy
} from "./types";

// ─── MARKET TICKER ───────────────────────────────────────────
export const tickerData: TickerItem[] = [
  { symbol: "NIFTY 50", price: 24856.20, change: 187.35, changePct: 0.76 },
  { symbol: "SENSEX", price: 81543.60, change: 624.80, changePct: 0.77 },
  { symbol: "BANK NIFTY", price: 53248.75, change: -124.50, changePct: -0.23 },
  { symbol: "NIFTY IT", price: 38124.40, change: 892.30, changePct: 2.40 },
  { symbol: "NIFTY PHARMA", price: 21456.80, change: 312.60, changePct: 1.48 },
  { symbol: "NIFTY DEFENCE", price: 8924.35, change: 245.80, changePct: 2.83 },
  { symbol: "NIFTY METAL", price: 9124.50, change: -187.40, changePct: -2.01 },
  { symbol: "NIFTY AUTO", price: 24312.60, change: 412.30, changePct: 1.73 },
  { symbol: "NIFTY ENERGY", price: 42156.80, change: -312.40, changePct: -0.74 },
  { symbol: "DXY", price: 104.23, change: -0.45, changePct: -0.43 },
  { symbol: "CRUDE OIL", price: 78.42, change: -1.23, changePct: -1.54 },
  { symbol: "GOLD", price: 72456.00, change: 312.00, changePct: 0.43 },
  { symbol: "USD/INR", price: 83.47, change: -0.12, changePct: -0.14 },
  { symbol: "10Y US YIELD", price: 4.42, change: -0.05, changePct: -1.12 },
  { symbol: "INDIA VIX", price: 13.24, change: -0.87, changePct: -6.17 },
];

// ─── MACRO DATA ───────────────────────────────────────────────
export const macroData: MacroData = {
  dxy: {
    id: "dxy", name: "US Dollar Index (DXY)", value: 104.23, change: -0.45, changePct: -0.43,
    unit: "pts", impact: "positive",
    affectedSectors: ["IT", "Pharma", "Metals", "Auto Ancillary"],
    interpretation: "DXY weakness benefits Indian IT exports. Expect FII inflows into emerging markets.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  usYield10Y: {
    id: "usYield10Y", name: "US 10Y Treasury Yield", value: 4.42, change: -0.05, changePct: -1.12,
    unit: "%", impact: "positive",
    affectedSectors: ["Banking", "IT", "Realty", "NBFC"],
    interpretation: "Yield compression signals risk-on. Positive for EM flows into Indian equities.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  crude: {
    id: "crude", name: "Brent Crude Oil", value: 78.42, change: -1.23, changePct: -1.54,
    unit: "$/bbl", impact: "positive",
    affectedSectors: ["Aviation", "Paint", "Chemicals", "Tyre", "FMCG"],
    interpretation: "Crude softening reduces input costs. Positive for paint, tyre, aviation sectors.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  gold: {
    id: "gold", name: "Gold (MCX)", value: 72456, change: 312, changePct: 0.43,
    unit: "₹/10g", impact: "neutral",
    affectedSectors: ["Jewellery", "Banking"],
    interpretation: "Mild gold rally signals cautious risk sentiment. Monitor for acceleration.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  rbiRate: {
    id: "rbiRate", name: "RBI Repo Rate", value: 6.25, change: -0.25, changePct: -3.85,
    unit: "%", impact: "positive",
    affectedSectors: ["Banking", "NBFC", "Realty", "Auto", "Capex"],
    interpretation: "Rate cut cycle beginning. Positive for rate-sensitive sectors: realty, NBFC, banking.",
    lastUpdated: "2026-05-15T00:00:00Z",
  },
  cpi: {
    id: "cpi", name: "India CPI Inflation", value: 4.12, change: -0.48, changePct: -10.43,
    unit: "%", impact: "positive",
    affectedSectors: ["Consumer", "FMCG", "Staples"],
    interpretation: "CPI below 4.5% supports RBI dovish pivot. Consumer spending recovery expected.",
    lastUpdated: "2026-05-12T00:00:00Z",
  },
  gdp: {
    id: "gdp", name: "India GDP Growth", value: 7.2, change: 0.4, changePct: 5.88,
    unit: "%", impact: "positive",
    affectedSectors: ["Infra", "Capital Goods", "Banking", "Consumer"],
    interpretation: "7%+ GDP sustained growth supports broad market. Infra and capex the main beneficiary.",
    lastUpdated: "2026-04-30T00:00:00Z",
  },
  uspmI: {
    id: "usPMI", name: "US Manufacturing PMI", value: 52.3, change: 1.2, changePct: 2.35,
    unit: "pts", impact: "positive",
    affectedSectors: ["IT", "Metals", "Chemicals"],
    interpretation: "US PMI expansion boosts Indian IT spending outlook and export demand.",
    lastUpdated: "2026-05-15T00:00:00Z",
  },
  indPMI: {
    id: "indPMI", name: "India Manufacturing PMI", value: 59.1, change: 0.8, changePct: 1.37,
    unit: "pts", impact: "positive",
    affectedSectors: ["Capital Goods", "Infra", "PSU", "Defence"],
    interpretation: "India PMI at multi-year high signals domestic manufacturing boom.",
    lastUpdated: "2026-05-15T00:00:00Z",
  },
  fiiFlow: {
    id: "fiiFlow", name: "FII Net Flow (MTD)", value: 12450, change: 2840, changePct: 29.58,
    unit: "₹ Cr", impact: "positive",
    affectedSectors: ["Banking", "IT", "Pharma", "Consumer"],
    interpretation: "FII buying accelerating. 3-month high inflow suggests sustained rally momentum.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  diiFlow: {
    id: "diiFlow", name: "DII Net Flow (MTD)", value: 8320, change: 1240, changePct: 17.52,
    unit: "₹ Cr", impact: "positive",
    affectedSectors: ["PSU", "Infra", "Defence", "Midcap"],
    interpretation: "SIP-driven DII flows at record levels. Strong domestic institutional support.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  mfFlow: {
    id: "mfFlow", name: "MF SIP Inflow (Monthly)", value: 21342, change: 845, changePct: 4.13,
    unit: "₹ Cr", impact: "positive",
    affectedSectors: ["Midcap", "Smallcap", "Consumption"],
    interpretation: "Monthly SIP at all-time high. Structural domestic liquidity engine continues.",
    lastUpdated: "2026-05-12T00:00:00Z",
  },
  usdrInr: {
    id: "usdrInr", name: "USD/INR Exchange Rate", value: 83.47, change: -0.12, changePct: -0.14,
    unit: "₹", impact: "positive",
    affectedSectors: ["IT", "Pharma", "Metals"],
    interpretation: "INR strengthening on FII inflows. IT sector earnings in INR could face minor headwind.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
  vix: {
    id: "vix", name: "India VIX", value: 13.24, change: -0.87, changePct: -6.17,
    unit: "pts", impact: "positive",
    affectedSectors: ["All"],
    interpretation: "VIX below 14 signals low fear. Historically bullish for markets at this level.",
    lastUpdated: "2026-05-15T10:30:00Z",
  },
};

export const rbiPolicy: RBIPolicy = {
  currentRate: 6.25,
  stance: "Accommodative",
  nextMeeting: "2026-06-06",
  expectedChange: -0.25,
  probability: 68,
  commentary: "With inflation firmly below 4.5% and GDP sustaining above 7%, RBI is expected to continue its rate cut cycle. Markets are pricing in 25bps cut in June with 68% probability. Banking and NBFC sectors to benefit most.",
};

// ─── SECTOR DATA ──────────────────────────────────────────────
export const sectorData: SectorData[] = [
  {
    id: "defence", name: "Defence & Aerospace", index: "NIFTY DEFENCE", price: 8924.35, change: 245.80, changePct: 2.83,
    weeklyChange: 8.24, monthlyChange: 18.42, yearlyChange: 87.32,
    relativeStrength: 94, momentumScore: 91, volumeExpansion: 2.8, institutionalActivity: 88, smartMoneyScore: 92,
    breakoutProbability: 87, rotationStrength: 89, riskLevel: 42, valuationScore: 45, earningsGrowth: 38.4,
    govtSupport: 10, fiiExposure: 12.4, diiExposure: 28.6, mfExposure: 34.2,
    trend: "bullish", signal: "strong_buy", phase: "markup", rank: 1, prevRank: 2,
    aiComment: "PLI scheme + ₹6.21L Cr defence budget. HAL, BEL at record backlog. Smart money aggressively accumulating.",
    topStocks: ["HAL", "BEL", "MTAR", "GRSE", "DCX"],
    marketCap: 285000, peRatio: 42.8, futureOutlook: "strong_positive", globalDemandImpact: "high",
  },
  {
    id: "it", name: "Information Technology", index: "NIFTY IT", price: 38124.40, change: 892.30, changePct: 2.40,
    weeklyChange: 6.12, monthlyChange: 14.28, yearlyChange: 32.14,
    relativeStrength: 88, momentumScore: 86, volumeExpansion: 2.2, institutionalActivity: 92, smartMoneyScore: 85,
    breakoutProbability: 82, rotationStrength: 84, riskLevel: 38, valuationScore: 52, earningsGrowth: 14.2,
    govtSupport: 7, fiiExposure: 38.4, diiExposure: 22.1, mfExposure: 28.4,
    trend: "bullish", signal: "strong_buy", phase: "markup", rank: 2, prevRank: 5,
    aiComment: "DXY weakness + US PMI expansion. AI spending boom driving order pipeline. FII leading the charge.",
    topStocks: ["TCS", "INFY", "WIPRO", "HCLTECH", "LTIM"],
    marketCap: 1245000, peRatio: 28.4, futureOutlook: "strong_positive", globalDemandImpact: "high",
  },
  {
    id: "pharma", name: "Pharmaceuticals", index: "NIFTY PHARMA", price: 21456.80, change: 312.60, changePct: 1.48,
    weeklyChange: 4.32, monthlyChange: 11.24, yearlyChange: 42.18,
    relativeStrength: 82, momentumScore: 79, volumeExpansion: 1.8, institutionalActivity: 76, smartMoneyScore: 80,
    breakoutProbability: 74, rotationStrength: 77, riskLevel: 35, valuationScore: 58, earningsGrowth: 22.8,
    govtSupport: 8, fiiExposure: 24.2, diiExposure: 31.4, mfExposure: 26.8,
    trend: "bullish", signal: "buy", phase: "markup", rank: 3, prevRank: 3,
    aiComment: "US FDA approvals accelerating. API advantage + domestic formulations growing. Defensive with growth.",
    topStocks: ["SUNPHARMA", "CIPLA", "DIVISLAB", "DRREDDY", "ALKEM"],
    marketCap: 680000, peRatio: 31.2, futureOutlook: "strong_positive", globalDemandImpact: "high",
  },
  {
    id: "auto", name: "Automobile & EV", index: "NIFTY AUTO", price: 24312.60, change: 412.30, changePct: 1.73,
    weeklyChange: 5.84, monthlyChange: 12.42, yearlyChange: 28.64,
    relativeStrength: 78, momentumScore: 81, volumeExpansion: 2.1, institutionalActivity: 74, smartMoneyScore: 76,
    breakoutProbability: 72, rotationStrength: 80, riskLevel: 44, valuationScore: 61, earningsGrowth: 18.4,
    govtSupport: 9, fiiExposure: 28.4, diiExposure: 24.8, mfExposure: 22.4,
    trend: "bullish", signal: "buy", phase: "markup", rank: 4, prevRank: 6,
    aiComment: "EV transition + rural recovery. Two-wheeler demand at 5Y high. PLI for EV components a catalyst.",
    topStocks: ["TATAMOTORS", "MARUTI", "M&M", "BAJAJ-AUTO", "EICHERMOT"],
    marketCap: 890000, peRatio: 24.8, futureOutlook: "positive", globalDemandImpact: "medium",
  },
  {
    id: "capgoods", name: "Capital Goods", index: "NIFTY CAPITAL GOODS", price: 67842.30, change: 924.50, changePct: 1.38,
    weeklyChange: 4.92, monthlyChange: 10.84, yearlyChange: 54.28,
    relativeStrength: 84, momentumScore: 83, volumeExpansion: 2.4, institutionalActivity: 82, smartMoneyScore: 84,
    breakoutProbability: 79, rotationStrength: 85, riskLevel: 40, valuationScore: 38, earningsGrowth: 32.4,
    govtSupport: 10, fiiExposure: 18.4, diiExposure: 36.2, mfExposure: 32.4,
    trend: "bullish", signal: "buy", phase: "markup", rank: 5, prevRank: 4,
    aiComment: "Capex supercycle. Govt ₹11L Cr infra spend. Order books at multi-year highs across L&T, ABB.",
    topStocks: ["LT", "ABB", "SIEMENS", "BHEL", "CUMMINSIND"],
    marketCap: 520000, peRatio: 38.4, futureOutlook: "strong_positive", globalDemandImpact: "medium",
  },
  {
    id: "banking", name: "Banking & Finance", index: "BANK NIFTY", price: 53248.75, change: -124.50, changePct: -0.23,
    weeklyChange: 1.24, monthlyChange: 4.82, yearlyChange: 12.48,
    relativeStrength: 62, momentumScore: 58, volumeExpansion: 1.2, institutionalActivity: 84, smartMoneyScore: 65,
    breakoutProbability: 61, rotationStrength: 55, riskLevel: 52, valuationScore: 72, earningsGrowth: 12.8,
    govtSupport: 7, fiiExposure: 32.4, diiExposure: 28.4, mfExposure: 24.2,
    trend: "neutral", signal: "hold", phase: "accumulation", rank: 6, prevRank: 1,
    aiComment: "Laggard despite rate cuts. Credit growth at 14%. PSU banks cheaply valued. Accumulation zone.",
    topStocks: ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
    marketCap: 1680000, peRatio: 14.2, futureOutlook: "positive", globalDemandImpact: "low",
  },
  {
    id: "realty", name: "Real Estate", index: "NIFTY REALTY", price: 12482.40, change: 284.60, changePct: 2.33,
    weeklyChange: 6.84, monthlyChange: 16.42, yearlyChange: 48.24,
    relativeStrength: 80, momentumScore: 82, volumeExpansion: 2.6, institutionalActivity: 72, smartMoneyScore: 78,
    breakoutProbability: 76, rotationStrength: 82, riskLevel: 56, valuationScore: 44, earningsGrowth: 42.8,
    govtSupport: 8, fiiExposure: 14.2, diiExposure: 22.4, mfExposure: 18.4,
    trend: "bullish", signal: "buy", phase: "markup", rank: 7, prevRank: 8,
    aiComment: "Rate cut cycle + PMAY 3.0. Luxury segment exploding. DLF, Prestige at record pre-sales.",
    topStocks: ["DLF", "PRESTIGE", "OBEROIRLTY", "GODREJPROP", "BRIGADE"],
    marketCap: 380000, peRatio: 52.4, futureOutlook: "positive", globalDemandImpact: "low",
  },
  {
    id: "power", name: "Power & Energy", index: "NIFTY ENERGY", price: 42156.80, change: -312.40, changePct: -0.74,
    weeklyChange: -1.24, monthlyChange: 3.42, yearlyChange: 62.84,
    relativeStrength: 72, momentumScore: 68, volumeExpansion: 1.4, institutionalActivity: 78, smartMoneyScore: 74,
    breakoutProbability: 65, rotationStrength: 62, riskLevel: 48, valuationScore: 35, earningsGrowth: 28.4,
    govtSupport: 10, fiiExposure: 16.4, diiExposure: 42.4, mfExposure: 28.2,
    trend: "neutral", signal: "hold", phase: "distribution", rank: 8, prevRank: 7,
    aiComment: "Power demand growing 8% YoY. Valuation stretched. Cooling phase after 60%+ rally. Wait for pullback.",
    topStocks: ["NTPC", "POWERGRID", "TATAPOWER", "ADANIGREEN", "CESC"],
    marketCap: 1120000, peRatio: 28.4, futureOutlook: "positive", globalDemandImpact: "low",
  },
  {
    id: "metals", name: "Metals & Mining", index: "NIFTY METAL", price: 9124.50, change: -187.40, changePct: -2.01,
    weeklyChange: -4.24, monthlyChange: -8.42, yearlyChange: -12.84,
    relativeStrength: 32, momentumScore: 28, volumeExpansion: 0.8, institutionalActivity: 42, smartMoneyScore: 35,
    breakoutProbability: 28, rotationStrength: 24, riskLevel: 78, valuationScore: 80, earningsGrowth: -8.4,
    govtSupport: 5, fiiExposure: 12.4, diiExposure: 18.4, mfExposure: 14.2,
    trend: "bearish", signal: "sell", phase: "markdown", rank: 24, prevRank: 18,
    aiComment: "China slowdown + weak global steel demand. Oversupply persisting. Avoid fresh longs.",
    topStocks: ["TATASTEEL", "JSWSTEEL", "HINDALCO", "VEDL", "COALINDIA"],
    marketCap: 680000, peRatio: 18.4, futureOutlook: "negative", globalDemandImpact: "high",
  },
  {
    id: "fmcg", name: "FMCG & Consumer", index: "NIFTY FMCG", price: 58642.30, change: 124.80, changePct: 0.21,
    weeklyChange: 0.84, monthlyChange: 2.42, yearlyChange: 8.24,
    relativeStrength: 48, momentumScore: 44, volumeExpansion: 0.9, institutionalActivity: 62, smartMoneyScore: 52,
    breakoutProbability: 42, rotationStrength: 38, riskLevel: 32, valuationScore: 42, earningsGrowth: 8.4,
    govtSupport: 6, fiiExposure: 22.4, diiExposure: 32.4, mfExposure: 28.4,
    trend: "neutral", signal: "hold", phase: "accumulation", rank: 15, prevRank: 12,
    aiComment: "Rural recovery helping volumes but urban premium slowing. Defensive quality at premium valuation.",
    topStocks: ["HINDUNILVR", "ITC", "NESTLEIND", "BRITANNIA", "DABUR"],
    marketCap: 920000, peRatio: 42.8, futureOutlook: "neutral", globalDemandImpact: "low",
  },
  {
    id: "psu", name: "PSU & Government", index: "NIFTY PSE", price: 10482.40, change: 184.60, changePct: 1.79,
    weeklyChange: 4.24, monthlyChange: 9.42, yearlyChange: 42.84,
    relativeStrength: 76, momentumScore: 74, volumeExpansion: 2.0, institutionalActivity: 68, smartMoneyScore: 72,
    breakoutProbability: 70, rotationStrength: 74, riskLevel: 45, valuationScore: 68, earningsGrowth: 24.8,
    govtSupport: 10, fiiExposure: 8.4, diiExposure: 52.4, mfExposure: 32.2,
    trend: "bullish", signal: "buy", phase: "markup", rank: 9, prevRank: 10,
    aiComment: "Budget capex + PSU reform drive earnings upgrades. DII strong holders. Rotation from private to PSU.",
    topStocks: ["NTPC", "BHEL", "COAL INDIA", "ONGC", "BEL"],
    marketCap: 780000, peRatio: 16.4, futureOutlook: "positive", globalDemandImpact: "low",
  },
  {
    id: "railway", name: "Railways & Logistics", index: "NIFTY INDIA RAILWAYS", price: 5842.40, change: 124.60, changePct: 2.18,
    weeklyChange: 7.24, monthlyChange: 14.42, yearlyChange: 78.84,
    relativeStrength: 86, momentumScore: 84, volumeExpansion: 2.6, institutionalActivity: 72, smartMoneyScore: 82,
    breakoutProbability: 80, rotationStrength: 84, riskLevel: 48, valuationScore: 32, earningsGrowth: 48.4,
    govtSupport: 10, fiiExposure: 6.4, diiExposure: 42.4, mfExposure: 36.4,
    trend: "bullish", signal: "buy", phase: "markup", rank: 10, prevRank: 11,
    aiComment: "₹2.65L Cr railway budget. Vande Bharat + electrification. RVNL, IRFC front runners.",
    topStocks: ["RVNL", "IRFC", "IRCTC", "RAILTEL", "TEXRAIL"],
    marketCap: 320000, peRatio: 58.4, futureOutlook: "strong_positive", globalDemandImpact: "low",
  },
];

// ─── STOCK DATA ───────────────────────────────────────────────
export const stockData: StockData[] = [
  {
    symbol: "HAL", name: "Hindustan Aeronautics Ltd", sector: "Defence", price: 4842.35, change: 184.25, changePct: 3.95,
    signal: "strong_buy", trend: "bullish", aiScore: 94, smartMoneyScore: 96, institutionalScore: 92,
    phase: "markup", aiAlert: "Institutional block deal accumulation detected. FII holding up 2.4% QoQ.",
    accumulating: true, inWatchlist: false,
    fundamentals: {
      marketCap: 324000, peRatio: 42.8, pbRatio: 8.4, roe: 24.8, roce: 28.4, debtToEquity: 0.12,
      promoterHolding: 71.6, fiiHolding: 12.4, diiHolding: 8.4, fiiChangePct: 2.4, diiChangePct: 0.8, promoterChangePct: 0.0,
      revenueGrowth: 28.4, profitGrowth: 38.4, epsGrowth: 36.2, freeCashFlow: 4820, intrinsicValue: 5200,
      valuationScore: 65, earningsQuality: 88, futureGrowthScore: 92, dividendYield: 0.84,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 68.4, macd: 124.5, macdSignal: 98.4, ema20: 4620, ema50: 4280, ema200: 3840,
      vwap: 4780, atr: 124.8, volume: 2480000, avgVolume20D: 1240000, deliveryPct: 68.4,
      relativeStrength: 94, breakoutZone: 4900, supportZone: 4600, resistanceZone: 5200,
      supplyZone: [5100, 5300], demandZone: [4500, 4700], liquidityZone: 4850,
      orderBlock: 4620, fairValueGap: [4700, 4780], oiChange: 12.4, futuresPremium: 42.4,
      volatilityExpansion: true, momentumStrength: 91,
    },
  },
  {
    symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", price: 4284.60, change: 124.40, changePct: 2.99,
    signal: "strong_buy", trend: "bullish", aiScore: 88, smartMoneyScore: 84, institutionalScore: 94,
    phase: "markup", aiAlert: "FII buying 3 consecutive sessions. Volume 2.2x average. Breakout zone ahead.",
    accumulating: true, inWatchlist: true,
    fundamentals: {
      marketCap: 1548000, peRatio: 28.4, pbRatio: 11.2, roe: 48.4, roce: 52.4, debtToEquity: 0.02,
      promoterHolding: 72.3, fiiHolding: 11.8, diiHolding: 8.2, fiiChangePct: 1.8, diiChangePct: 0.4, promoterChangePct: 0.0,
      revenueGrowth: 12.4, profitGrowth: 14.2, epsGrowth: 16.8, freeCashFlow: 42800, intrinsicValue: 4800,
      valuationScore: 62, earningsQuality: 94, futureGrowthScore: 82, dividendYield: 1.84,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 64.2, macd: 82.4, macdSignal: 68.4, ema20: 4180, ema50: 3920, ema200: 3680,
      vwap: 4240, atr: 84.2, volume: 4280000, avgVolume20D: 2180000, deliveryPct: 72.4,
      relativeStrength: 88, breakoutZone: 4350, supportZone: 4100, resistanceZone: 4600,
      supplyZone: [4500, 4700], demandZone: [4000, 4150], liquidityZone: 4280,
      orderBlock: 4080, fairValueGap: [4150, 4200], oiChange: 8.4, futuresPremium: 28.4,
      volatilityExpansion: false, momentumStrength: 86,
    },
  },
  {
    symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries", sector: "Pharma", price: 1842.40, change: 42.60, changePct: 2.37,
    signal: "buy", trend: "bullish", aiScore: 82, smartMoneyScore: 78, institutionalScore: 82,
    phase: "markup", aiAlert: "Delivery spike 78%. Smart money accumulating ahead of US FDA clearance.",
    accumulating: true, inWatchlist: false,
    fundamentals: {
      marketCap: 442000, peRatio: 34.8, pbRatio: 7.2, roe: 22.4, roce: 24.8, debtToEquity: 0.08,
      promoterHolding: 54.4, fiiHolding: 28.4, diiHolding: 12.4, fiiChangePct: 1.2, diiChangePct: 0.6, promoterChangePct: 0.0,
      revenueGrowth: 18.4, profitGrowth: 24.8, epsGrowth: 22.4, freeCashFlow: 12400, intrinsicValue: 2100,
      valuationScore: 68, earningsQuality: 84, futureGrowthScore: 78, dividendYield: 0.92,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 62.4, macd: 28.4, macdSignal: 22.4, ema20: 1800, ema50: 1680, ema200: 1520,
      vwap: 1828, atr: 42.4, volume: 3280000, avgVolume20D: 1580000, deliveryPct: 78.4,
      relativeStrength: 82, breakoutZone: 1880, supportZone: 1760, resistanceZone: 2000,
      supplyZone: [1950, 2050], demandZone: [1720, 1800], liquidityZone: 1850,
      orderBlock: 1760, fairValueGap: [1800, 1830], oiChange: 6.4, futuresPremium: 18.4,
      volatilityExpansion: true, momentumStrength: 80,
    },
  },
  {
    symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Auto", price: 1024.80, change: 32.40, changePct: 3.26,
    signal: "buy", trend: "bullish", aiScore: 80, smartMoneyScore: 76, institutionalScore: 78,
    phase: "markup", aiAlert: "JLR turnaround + EV launch cycle. FII holding increase 3rd consecutive quarter.",
    accumulating: true, inWatchlist: false,
    fundamentals: {
      marketCap: 381000, peRatio: 18.4, pbRatio: 3.8, roe: 21.4, roce: 18.4, debtToEquity: 1.24,
      promoterHolding: 42.4, fiiHolding: 24.4, diiHolding: 18.4, fiiChangePct: 2.8, diiChangePct: 1.2, promoterChangePct: 0.0,
      revenueGrowth: 14.8, profitGrowth: 28.4, epsGrowth: 32.4, freeCashFlow: 8400, intrinsicValue: 1180,
      valuationScore: 72, earningsQuality: 74, futureGrowthScore: 82, dividendYield: 0.0,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 58.4, macd: 18.4, macdSignal: 14.2, ema20: 988, ema50: 924, ema200: 858,
      vwap: 1012, atr: 28.4, volume: 12480000, avgVolume20D: 6240000, deliveryPct: 58.4,
      relativeStrength: 80, breakoutZone: 1050, supportZone: 980, resistanceZone: 1120,
      supplyZone: [1100, 1150], demandZone: [960, 1000], liquidityZone: 1020,
      orderBlock: 968, fairValueGap: [990, 1010], oiChange: 14.4, futuresPremium: 12.4,
      volatilityExpansion: false, momentumStrength: 78,
    },
  },
  {
    symbol: "DLF", name: "DLF Limited", sector: "Realty", price: 924.60, change: 28.40, changePct: 3.17,
    signal: "buy", trend: "bullish", aiScore: 78, smartMoneyScore: 74, institutionalScore: 72,
    phase: "markup", aiAlert: "Luxury housing pre-sales at record. Volume expansion 2.6x. Institutional accumulation confirmed.",
    accumulating: true, inWatchlist: false,
    fundamentals: {
      marketCap: 232000, peRatio: 82.4, pbRatio: 5.4, roe: 8.4, roce: 12.4, debtToEquity: 0.18,
      promoterHolding: 74.1, fiiHolding: 14.4, diiHolding: 6.4, fiiChangePct: 1.4, diiChangePct: 0.8, promoterChangePct: 0.0,
      revenueGrowth: 42.4, profitGrowth: 68.4, epsGrowth: 72.4, freeCashFlow: 4200, intrinsicValue: 1050,
      valuationScore: 48, earningsQuality: 72, futureGrowthScore: 84, dividendYield: 0.54,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 64.8, macd: 22.4, macdSignal: 18.4, ema20: 898, ema50: 842, ema200: 768,
      vwap: 912, atr: 22.4, volume: 8420000, avgVolume20D: 3240000, deliveryPct: 62.4,
      relativeStrength: 80, breakoutZone: 950, supportZone: 880, resistanceZone: 1000,
      supplyZone: [980, 1020], demandZone: [860, 900], liquidityZone: 928,
      orderBlock: 868, fairValueGap: [892, 920], oiChange: 18.4, futuresPremium: 24.4,
      volatilityExpansion: true, momentumStrength: 76,
    },
  },
  {
    symbol: "RVNL", name: "Rail Vikas Nigam Ltd", sector: "Railway", price: 584.20, change: 24.80, changePct: 4.43,
    signal: "strong_buy", trend: "bullish", aiScore: 86, smartMoneyScore: 84, institutionalScore: 76,
    phase: "markup", aiAlert: "Order inflow 3x target. Smart money buying dips. Rally continuation expected.",
    accumulating: true, inWatchlist: true,
    fundamentals: {
      marketCap: 154000, peRatio: 62.4, pbRatio: 9.8, roe: 18.4, roce: 22.4, debtToEquity: 0.08,
      promoterHolding: 72.8, fiiHolding: 4.4, diiHolding: 8.4, fiiChangePct: 0.8, diiChangePct: 1.2, promoterChangePct: 0.0,
      revenueGrowth: 48.4, profitGrowth: 52.4, epsGrowth: 48.2, freeCashFlow: 2840, intrinsicValue: 620,
      valuationScore: 42, earningsQuality: 82, futureGrowthScore: 88, dividendYield: 0.68,
    },
    technicals: {
      trend1D: "bullish", trend1W: "bullish", trend1M: "bullish",
      rsi: 72.4, macd: 18.4, macdSignal: 14.2, ema20: 558, ema50: 512, ema200: 448,
      vwap: 572, atr: 16.4, volume: 42800000, avgVolume20D: 18400000, deliveryPct: 54.4,
      relativeStrength: 88, breakoutZone: 600, supportZone: 552, resistanceZone: 650,
      supplyZone: [630, 660], demandZone: [540, 570], liquidityZone: 586,
      orderBlock: 548, fairValueGap: [558, 578], oiChange: 22.4, futuresPremium: 8.4,
      volatilityExpansion: true, momentumStrength: 86,
    },
  },
  {
    symbol: "HDFCBANK", name: "HDFC Bank Limited", sector: "Banking", price: 1784.60, change: -12.40, changePct: -0.69,
    signal: "hold", trend: "neutral", aiScore: 64, smartMoneyScore: 62, institutionalScore: 84,
    phase: "accumulation", aiAlert: "Smart money quietly accumulating at demand zone. High delivery % suggests long hands.",
    accumulating: true, inWatchlist: false,
    fundamentals: {
      marketCap: 1358000, peRatio: 18.4, pbRatio: 2.8, roe: 16.8, roce: 18.4, debtToEquity: 6.4,
      promoterHolding: 0.0, fiiHolding: 54.8, diiHolding: 18.4, fiiChangePct: -0.4, diiChangePct: 0.8, promoterChangePct: 0.0,
      revenueGrowth: 14.4, profitGrowth: 18.4, epsGrowth: 16.2, freeCashFlow: 0, intrinsicValue: 2100,
      valuationScore: 78, earningsQuality: 88, futureGrowthScore: 72, dividendYield: 1.12,
    },
    technicals: {
      trend1D: "neutral", trend1W: "neutral", trend1M: "bullish",
      rsi: 48.4, macd: 8.4, macdSignal: 12.4, ema20: 1792, ema50: 1724, ema200: 1648,
      vwap: 1788, atr: 28.4, volume: 18400000, avgVolume20D: 14200000, deliveryPct: 68.4,
      relativeStrength: 64, breakoutZone: 1850, supportZone: 1720, resistanceZone: 1900,
      supplyZone: [1860, 1920], demandZone: [1700, 1760], liquidityZone: 1780,
      orderBlock: 1724, fairValueGap: null, oiChange: -4.4, futuresPremium: 6.4,
      volatilityExpansion: false, momentumStrength: 58,
    },
  },
  {
    symbol: "TATASTEEL", name: "Tata Steel Limited", sector: "Metals", price: 148.40, change: -4.80, changePct: -3.13,
    signal: "sell", trend: "bearish", aiScore: 28, smartMoneyScore: 24, institutionalScore: 42,
    phase: "markdown", aiAlert: "Distribution pattern detected. FII reducing exposure. China demand headwinds.",
    accumulating: false, inWatchlist: false,
    fundamentals: {
      marketCap: 184000, peRatio: 24.8, pbRatio: 1.8, roe: 8.4, roce: 12.4, debtToEquity: 1.84,
      promoterHolding: 33.2, fiiHolding: 14.4, diiHolding: 18.4, fiiChangePct: -2.4, diiChangePct: -0.8, promoterChangePct: 0.0,
      revenueGrowth: -4.4, profitGrowth: -18.4, epsGrowth: -22.4, freeCashFlow: -2400, intrinsicValue: 130,
      valuationScore: 82, earningsQuality: 52, futureGrowthScore: 28, dividendYield: 0.0,
    },
    technicals: {
      trend1D: "bearish", trend1W: "bearish", trend1M: "bearish",
      rsi: 32.4, macd: -8.4, macdSignal: -4.8, ema20: 162, ema50: 178, ema200: 192,
      vwap: 154, atr: 5.4, volume: 48400000, avgVolume20D: 32400000, deliveryPct: 42.4,
      relativeStrength: 28, breakoutZone: 175, supportZone: 140, resistanceZone: 165,
      supplyZone: [160, 170], demandZone: [135, 145], liquidityZone: 148,
      orderBlock: 165, fairValueGap: null, oiChange: -12.4, futuresPremium: -4.4,
      volatilityExpansion: false, momentumStrength: 24,
    },
  },
];

// ─── TRADE SETUPS ─────────────────────────────────────────────
export const tradeSetups: TradeSetup[] = [
  {
    id: "ts1", symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", currentPrice: 4842.35,
    setupType: "Breakout Continuation + FVG Fill", tradeType: "swing",
    entry: 4880, stopLoss: 4620, target1: 5100, target2: 5400, target3: 5800,
    riskReward: 3.8, swingProbability: 88, momentumProbability: 91, convictionScore: 92,
    smartMoneyScore: 96, institutionalScore: 92, holdingPeriod: "2-4 weeks",
    aiRationale: "HAL breaking out of 3-week consolidation with 2.8x volume expansion. FVG at 4700-4780 filled. Institutional accumulation confirmed via block deals. Defence budget tailwind. Risk-defined trade above order block at 4620.",
    timeframe: "1W", generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "ts2", symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", currentPrice: 4284.60,
    setupType: "Demand Zone Bounce + EMA Alignment", tradeType: "swing",
    entry: 4300, stopLoss: 4080, target1: 4500, target2: 4700, target3: 4900,
    riskReward: 2.9, swingProbability: 82, momentumProbability: 86, convictionScore: 88,
    smartMoneyScore: 84, institutionalScore: 94, holdingPeriod: "3-6 weeks",
    aiRationale: "TCS bouncing from demand zone with 20/50/200 EMA all aligned bullish. DXY weakness + US tech spending recovery. Q4 results beat expectations. FII adding positions for 3rd consecutive session.",
    timeframe: "1W", generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "ts3", symbol: "RVNL", name: "Rail Vikas Nigam Ltd", sector: "Railway", currentPrice: 584.20,
    setupType: "Momentum Continuation + Order Block", tradeType: "positional",
    entry: 590, stopLoss: 548, target1: 640, target2: 700, target3: 780,
    riskReward: 4.5, swingProbability: 84, momentumProbability: 88, convictionScore: 86,
    smartMoneyScore: 84, institutionalScore: 76, holdingPeriod: "4-8 weeks",
    aiRationale: "RVNL with 3x order inflow target achievement. Smart money buying every dip. Government capex allocation at record. Railway electrification orders flow through 2027. Strong momentum with healthy consolidation.",
    timeframe: "1M", generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "ts4", symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", currentPrice: 1842.40,
    setupType: "Delivery Spike + Accumulation Zone", tradeType: "swing",
    entry: 1860, stopLoss: 1720, target1: 1980, target2: 2100, target3: 2250,
    riskReward: 2.8, swingProbability: 78, momentumProbability: 80, convictionScore: 82,
    smartMoneyScore: 78, institutionalScore: 82, holdingPeriod: "3-5 weeks",
    aiRationale: "Sun Pharma showing 78% delivery with high-quality buying. US FDA approval pipeline strongest in 5 years. Specialty segment margin expansion. Smart money building position below resistance at 1880.",
    timeframe: "1W", generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "ts5", symbol: "DLF", name: "DLF Limited", sector: "Realty", currentPrice: 924.60,
    setupType: "Cup & Handle Breakout + Institutional Buying", tradeType: "positional",
    entry: 940, stopLoss: 868, target1: 1020, target2: 1100, target3: 1200,
    riskReward: 3.6, swingProbability: 76, momentumProbability: 78, convictionScore: 80,
    smartMoneyScore: 74, institutionalScore: 72, holdingPeriod: "6-12 weeks",
    aiRationale: "DLF forming perfect cup & handle with handle at critical 920 zone. Rate cut cycle boosting luxury housing demand. Pre-sales at ₹14000 Cr — all-time high. Volume expansion 2.6x confirms institutional participation.",
    timeframe: "1M", generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "ts6", symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", currentPrice: 1784.60,
    setupType: "BTST — Demand Zone + High Delivery", tradeType: "btst",
    entry: 1790, stopLoss: 1748, target1: 1840, target2: 1880, target3: 1920,
    riskReward: 2.1, swingProbability: 68, momentumProbability: 64, convictionScore: 66,
    smartMoneyScore: 62, institutionalScore: 84, holdingPeriod: "1-3 days",
    aiRationale: "HDFC Bank at strong demand zone (1760-1800) with 68% delivery. Rate cut cycle will boost NIM expectations. Bank Nifty setup aligns. Short-term bounce trade with defined risk.",
    timeframe: "1D", generatedAt: "2026-05-15T10:30:00Z",
  },
];

// ─── ALERTS ───────────────────────────────────────────────────
export const alertData: Alert[] = [
  {
    id: "a1", type: "smart_money_entry", symbol: "HAL", title: "Smart Money Entry Detected",
    message: "HAL: Institutional block deal of ₹284 Cr detected at 4780. 3 consecutive sessions of delivery >65%. Smart money accumulation phase confirmed.",
    severity: "critical", timestamp: "2026-05-15T10:28:00Z", read: false, actionable: true,
  },
  {
    id: "a2", type: "sector_rotation", sector: "IT", title: "Sector Rotation: IT Accelerating",
    message: "NIFTY IT gaining RS vs NIFTY 50. FII buying ₹2,840 Cr in IT MTD. DXY falling below 104. IT sector entering markup phase.",
    severity: "high", timestamp: "2026-05-15T10:15:00Z", read: false, actionable: true,
  },
  {
    id: "a3", type: "volume_explosion", symbol: "RVNL", title: "Volume Explosion — RVNL",
    message: "RVNL volume at 2.8x 20D average. Order inflow news catalyst. Breakout above 580 resistance zone confirmed.",
    severity: "high", timestamp: "2026-05-15T10:05:00Z", read: false, actionable: true,
  },
  {
    id: "a4", type: "fii_buying", title: "FII Net Buying — MTD High",
    message: "FII net buying ₹12,450 Cr MTD — 3-month high. Flows concentrated in IT, Defence, Pharma. Bullish for NIFTY continuation.",
    severity: "high", timestamp: "2026-05-15T09:45:00Z", read: true, actionable: false,
  },
  {
    id: "a5", type: "breakdown", symbol: "TATASTEEL", title: "Breakdown — TATASTEEL",
    message: "TATASTEEL breaking below 150 support. Volume 1.5x. China PMI disappointing. Avoid longs. Distribution phase active.",
    severity: "critical", timestamp: "2026-05-15T09:30:00Z", read: false, actionable: true,
  },
  {
    id: "a6", type: "macro", title: "RBI Rate Cut — Market Impact",
    message: "RBI cuts repo rate 25bps to 6.25%. Positive for Banking, NBFC, Realty, Auto. Rupee may strengthen mildly. FII flows expected to accelerate.",
    severity: "critical", timestamp: "2026-05-15T09:00:00Z", read: true, actionable: true,
  },
  {
    id: "a7", type: "delivery_spike", symbol: "SUNPHARMA", title: "Delivery Spike — SUNPHARMA",
    message: "SUNPHARMA delivery % surged to 78.4% — 52-week high. Suggests long-term accumulation by institutions ahead of key FDA catalyst.",
    severity: "medium", timestamp: "2026-05-15T08:45:00Z", read: false, actionable: true,
  },
];

// ─── AI PREDICTIONS ───────────────────────────────────────────
export const aiPredictions: AIPrediction[] = [
  {
    id: "p1", type: "sector_rally", target: "Defence & Aerospace", confidence: 91, timeframe: "2-4 weeks",
    rationale: "Government defence budget 13% higher YoY. HAL backlog ₹94,000 Cr. FII allocation increasing. PLI scheme driving domestic manufacturing. Smart money aggressively positioned.",
    probability: 88, expectedMove: 15.4, generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "p2", type: "sector_rally", target: "Information Technology", confidence: 86, timeframe: "3-6 weeks",
    rationale: "US enterprise tech spending recovering. AI infrastructure deals accelerating. DXY at 6-month low. FII leading sector rotation into IT. TCS, Infosys order flows strengthening.",
    probability: 82, expectedMove: 12.8, generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "p3", type: "rotation", target: "Banking → IT Rotation", confidence: 84, timeframe: "1-3 weeks",
    rationale: "Bank Nifty underperforming Nifty IT for 4 consecutive weeks. Capital rotating from rate-sensitive banks to high-growth IT. Historical pattern shows 8-12% IT outperformance after such rotations.",
    probability: 78, expectedMove: 8.4, generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "p4", type: "weak_sector", target: "Metals & Mining", confidence: 88, timeframe: "4-8 weeks",
    rationale: "China PMI weak. Global steel overcapacity. Tata Steel, JSW Steel margins under pressure. FII selling metals for 6 consecutive weeks. Avoid fresh longs in sector.",
    probability: 84, expectedMove: -12.4, generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "p5", type: "breakout", target: "HAL", confidence: 92, timeframe: "1-2 weeks",
    rationale: "HAL consolidating 3 weeks at ATH zone. Volume pattern matches pre-breakout phase from Oct 2024. Institutional accumulation confirmed. Breakout above 4900 targets 5400+.",
    probability: 87, expectedMove: 11.5, generatedAt: "2026-05-15T10:30:00Z",
  },
  {
    id: "p6", type: "crash_alert", target: "Small Cap Metals", confidence: 76, timeframe: "2-4 weeks",
    rationale: "Overheated small cap metals trading at 60-80x PE. FII selling + weak commodity cycle. Risk of 20-30% correction. Institutional exit pattern detected. Caution advised.",
    probability: 72, expectedMove: -22.4, generatedAt: "2026-05-15T10:30:00Z",
  },
];

// ─── MARKET REGIME ────────────────────────────────────────────
export const marketRegime: MarketRegime = {
  regime: "risk_on",
  confidence: 84,
  description: "Markets in sustained risk-on regime. FII inflows at 3-month high. VIX below 14 signals low fear. Breadth indicators bullish with 68% stocks above 50D EMA.",
  recommendedStrategy: "Momentum + Breakout trading. Focus on Defence, IT, Pharma leaders. Size up on pullbacks in quality names. Avoid metals, energy sector longs.",
  sectors: {
    bullish: ["Defence", "IT", "Pharma", "Railway", "Auto", "Capital Goods", "Realty"],
    bearish: ["Metals", "Energy (short-term)", "Chemicals (global)"],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────
export function generateLivePrice(base: number, volatility = 0.002): number {
  const change = (Math.random() - 0.48) * base * volatility;
  return parseFloat((base + change).toFixed(2));
}

export function generateSparkline(base: number, points = 20): number[] {
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const prev = data[i - 1];
    const change = (Math.random() - 0.47) * prev * 0.008;
    data.push(parseFloat((prev + change).toFixed(2)));
  }
  return data;
}

export const SECTORS_ALL = sectorData.map(s => s.id);
export const SECTOR_HEATMAP_COLORS: Record<string, string> = {
  defence: "#00C853", it: "#00B0FF", pharma: "#69F0AE", auto: "#40C4FF",
  capgoods: "#CCFF90", banking: "#FFD740", realty: "#64FFDA", power: "#FF6D00",
  metals: "#FF1744", fmcg: "#BDBDBD", psu: "#4DB6AC", railway: "#7C4DFF",
};
