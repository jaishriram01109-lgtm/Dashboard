// ============================================================
// CORE TYPES — AI Smart Money Dashboard
// ============================================================

export type Trend = "bullish" | "bearish" | "neutral" | "accumulation" | "distribution";
export type Signal = "buy" | "sell" | "hold" | "strong_buy" | "strong_sell";
export type TimeFrame = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y";
export type TradeType = "intraday" | "btst" | "swing" | "positional" | "long_term";
export type AlertSeverity = "critical" | "high" | "medium" | "low";

// ─── MACRO ───────────────────────────────────────────────────
export interface MacroIndicator {
  id: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
  unit: string;
  impact: "positive" | "negative" | "neutral";
  affectedSectors: string[];
  interpretation: string;
  lastUpdated: string;
}

export interface MacroData {
  dxy: MacroIndicator;
  usYield10Y: MacroIndicator;
  crude: MacroIndicator;
  gold: MacroIndicator;
  rbiRate: MacroIndicator;
  cpi: MacroIndicator;
  gdp: MacroIndicator;
  uspmI: MacroIndicator;
  indPMI: MacroIndicator;
  fiiFlow: MacroIndicator;
  diiFlow: MacroIndicator;
  mfFlow: MacroIndicator;
  usdrInr: MacroIndicator;
  vix: MacroIndicator;
}

export interface RBIPolicy {
  currentRate: number;
  stance: string;
  nextMeeting: string;
  expectedChange: number;
  probability: number;
  commentary: string;
}

// ─── SECTORS ─────────────────────────────────────────────────
export interface SectorData {
  id: string;
  name: string;
  index: string;
  price: number;
  change: number;
  changePct: number;
  weeklyChange: number;
  monthlyChange: number;
  yearlyChange: number;

  // Scoring
  relativeStrength: number;       // 0-100
  momentumScore: number;          // 0-100
  volumeExpansion: number;        // ratio vs 20D avg
  institutionalActivity: number;  // 0-100
  smartMoneyScore: number;        // 0-100
  breakoutProbability: number;    // 0-100
  rotationStrength: number;       // 0-100
  riskLevel: number;              // 0-100 (higher = riskier)
  valuationScore: number;         // 0-100 (higher = cheaper)
  earningsGrowth: number;         // YoY %
  govtSupport: number;            // 0-10

  // Flow
  fiiExposure: number;            // %
  diiExposure: number;            // %
  mfExposure: number;             // %

  trend: Trend;
  signal: Signal;
  phase: "markup" | "distribution" | "markdown" | "accumulation";
  rank: number;
  prevRank: number;
  aiComment: string;
  topStocks: string[];
  marketCap: number;              // Cr
  peRatio: number;
  futureOutlook: "strong_positive" | "positive" | "neutral" | "negative" | "strong_negative";
  globalDemandImpact: "high" | "medium" | "low";
}

// ─── STOCKS ──────────────────────────────────────────────────
export interface StockFundamentals {
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  promoterHolding: number;
  fiiHolding: number;
  diiHolding: number;
  fiiChangePct: number;
  diiChangePct: number;
  promoterChangePct: number;
  revenueGrowth: number;
  profitGrowth: number;
  epsGrowth: number;
  freeCashFlow: number;
  intrinsicValue: number;
  valuationScore: number;
  earningsQuality: number;
  futureGrowthScore: number;
  dividendYield: number;
}

export interface StockTechnicals {
  trend1D: Trend;
  trend1W: Trend;
  trend1M: Trend;
  rsi: number;
  macd: number;
  macdSignal: number;
  ema20: number;
  ema50: number;
  ema200: number;
  vwap: number;
  atr: number;
  volume: number;
  avgVolume20D: number;
  deliveryPct: number;
  relativeStrength: number;
  breakoutZone: number;
  supportZone: number;
  resistanceZone: number;
  supplyZone: [number, number];
  demandZone: [number, number];
  liquidityZone: number;
  orderBlock: number;
  fairValueGap: [number, number] | null;
  oiChange: number;
  futuresPremium: number;
  volatilityExpansion: boolean;
  momentumStrength: number;
}

export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  signal: Signal;
  trend: Trend;
  aiScore: number;             // 0-100
  smartMoneyScore: number;     // 0-100
  institutionalScore: number;  // 0-100
  fundamentals: StockFundamentals;
  technicals: StockTechnicals;
  phase: "accumulation" | "markup" | "distribution" | "markdown";
  aiAlert: string | null;
  accumulating: boolean;
  inWatchlist: boolean;
}

// ─── TRADE SETUPS ────────────────────────────────────────────
export interface TradeSetup {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  setupType: string;
  tradeType: TradeType;
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskReward: number;
  swingProbability: number;
  momentumProbability: number;
  convictionScore: number;
  smartMoneyScore: number;
  institutionalScore: number;
  holdingPeriod: string;
  aiRationale: string;
  timeframe: TimeFrame;
  generatedAt: string;
}

// ─── ALERTS ──────────────────────────────────────────────────
export interface Alert {
  id: string;
  type: string;
  symbol?: string;
  sector?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  actionable: boolean;
}

// ─── AI PREDICTION ───────────────────────────────────────────
export interface AIPrediction {
  id: string;
  type: "sector_rally" | "stock_outperform" | "rotation" | "breakout" | "crash_alert" | "weak_sector";
  target: string;
  confidence: number;
  timeframe: string;
  rationale: string;
  probability: number;
  expectedMove: number;
  generatedAt: string;
}

export interface MarketRegime {
  regime: "risk_on" | "risk_off" | "trending" | "ranging" | "volatile";
  confidence: number;
  description: string;
  recommendedStrategy: string;
  sectors: { bullish: string[]; bearish: string[] };
}

// ─── DASHBOARD STATE ─────────────────────────────────────────
export interface DashboardState {
  activeSection: string;
  selectedTimeframe: TimeFrame;
  selectedSector: string | null;
  selectedStock: string | null;
  alerts: Alert[];
  unreadAlerts: number;
  lastRefresh: string;
  marketStatus: "open" | "closed" | "pre_open";
  marketRegime: MarketRegime | null;
}

// ─── MARKET TICKER ───────────────────────────────────────────
export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}
