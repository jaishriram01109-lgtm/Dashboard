"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import MarketTicker from "@/components/MarketTicker";
import Sidebar from "@/components/Sidebar";
import { alertData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

// Lazy load all section components
const MacroIntelligence = dynamic(() => import("@/components/MacroIntelligence"), { ssr: false });
const SectorRotation = dynamic(() => import("@/components/SectorRotation"), { ssr: false });
const StockIntelligence = dynamic(() => import("@/components/StockIntelligence"), { ssr: false });
const SmartMoneyAnalysis = dynamic(() => import("@/components/SmartMoneyAnalysis"), { ssr: false });
const TradeOpportunities = dynamic(() => import("@/components/TradeOpportunities"), { ssr: false });
const AIPrediction = dynamic(() => import("@/components/AIPrediction"), { ssr: false });
const AlertSystem = dynamic(() => import("@/components/AlertSystem"), { ssr: false });
const Visualizations = dynamic(() => import("@/components/Visualizations"), { ssr: false });
const MomentumScanner = dynamic(() => import("@/components/MomentumScanner"), { ssr: false });
const AIPortfolio = dynamic(() => import("@/components/AIPortfolio"), { ssr: false });
const Watchlist = dynamic(() => import("@/components/Watchlist"), { ssr: false });
const OptionsChain = dynamic(() => import("@/components/OptionsChain"), { ssr: false });
const BulkDeals = dynamic(() => import("@/components/BulkDeals"), { ssr: false });
const EconomicCalendar = dynamic(() => import("@/components/EconomicCalendar"), { ssr: false });
const IPOTracker = dynamic(() => import("@/components/IPOTracker"), { ssr: false });
const AdvancedChart = dynamic(() => import("@/components/AdvancedChart"), { ssr: false });
const NewsSentiment = dynamic(() => import("@/components/NewsSentiment"), { ssr: false });
const FnOAnalytics = dynamic(() => import("@/components/FnOAnalytics"), { ssr: false });
const StockScreener = dynamic(() => import("@/components/StockScreener"), { ssr: false });
const GlobalMarkets = dynamic(() => import("@/components/GlobalMarkets"), { ssr: false });
const CorporateActions = dynamic(() => import("@/components/CorporateActions"), { ssr: false });
const RiskDashboard = dynamic(() => import("@/components/RiskDashboard"), { ssr: false });
const MutualFunds = dynamic(() => import("@/components/MutualFunds"), { ssr: false });
const TechnicalPatterns = dynamic(() => import("@/components/TechnicalPatterns"), { ssr: false });
const DerivativesDashboard = dynamic(() => import("@/components/DerivativesDashboard"), { ssr: false });
const MarketHeatmap = dynamic(() => import("@/components/MarketHeatmap"), { ssr: false });
const BacktestEngine = dynamic(() => import("@/components/BacktestEngine"), { ssr: false });
const TradeJournal = dynamic(() => import("@/components/TradeJournal"), { ssr: false });
const PeerComparison = dynamic(() => import("@/components/PeerComparison"), { ssr: false });
const DividendTracker = dynamic(() => import("@/components/DividendTracker"), { ssr: false });
const PortfolioRebalancer = dynamic(() => import("@/components/PortfolioRebalancer"), { ssr: false });
const EarningsAnalyzer = dynamic(() => import("@/components/EarningsAnalyzer"), { ssr: false });
const QuantFactorModel = dynamic(() => import("@/components/QuantFactorModel"), { ssr: false });
const IndexAnalytics = dynamic(() => import("@/components/IndexAnalytics"), { ssr: false });
const MarketBreadth = dynamic(() => import("@/components/MarketBreadth"), { ssr: false });
const VolatilitySurface = dynamic(() => import("@/components/VolatilitySurface"), { ssr: false });
const CapitalFlowMonitor = dynamic(() => import("@/components/CapitalFlowMonitor"), { ssr: false });
const OptionStrategyBuilder = dynamic(() => import("@/components/OptionStrategyBuilder"), { ssr: false });
const PositionSizing = dynamic(() => import("@/components/PositionSizing"), { ssr: false });
const SentimentDashboard = dynamic(() => import("@/components/SentimentDashboard"), { ssr: false });
const CommodityDashboard = dynamic(() => import("@/components/CommodityDashboard"), { ssr: false });
const BondMarket = dynamic(() => import("@/components/BondMarket"), { ssr: false });
const ETFAnalytics = dynamic(() => import("@/components/ETFAnalytics"), { ssr: false });
const MacroScorecard = dynamic(() => import("@/components/MacroScorecard"), { ssr: false });
const CurrencyAnalytics = dynamic(() => import("@/components/CurrencyAnalytics"), { ssr: false });
const FIIDerivativeStats = dynamic(() => import("@/components/FIIDerivativeStats"), { ssr: false });

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-maroon-700 border-t-maroon-300 rounded-full animate-spin" />
        <span className="text-xs text-ivory-600 font-mono">Loading intelligence...</span>
      </div>
    </div>
  );
}

const SECTIONS: Record<string, React.ComponentType> = {
  macro: MacroIntelligence,
  sectors: SectorRotation,
  stocks: StockIntelligence,
  "smart-money": SmartMoneyAnalysis,
  trades: TradeOpportunities,
  "ai-predict": AIPrediction,
  alerts: AlertSystem,
  charts: Visualizations,
  scanner: MomentumScanner,
  portfolio: AIPortfolio,
  watchlist: Watchlist,
  options: OptionsChain,
  "bulk-deals": BulkDeals,
  "economic-calendar": EconomicCalendar,
  ipo: IPOTracker,
  "advanced-chart": AdvancedChart,
  news: NewsSentiment,
  fno: FnOAnalytics,
  screener: StockScreener,
  global: GlobalMarkets,
  corporate: CorporateActions,
  risk: RiskDashboard,
  mf: MutualFunds,
  patterns: TechnicalPatterns,
  derivatives: DerivativesDashboard,
  heatmap: MarketHeatmap,
  backtest: BacktestEngine,
  journal: TradeJournal,
  peer: PeerComparison,
  dividends: DividendTracker,
  rebalancer: PortfolioRebalancer,
  earnings: EarningsAnalyzer,
  quant: QuantFactorModel,
  index: IndexAnalytics,
  breadth: MarketBreadth,
  volatility: VolatilitySurface,
  flows: CapitalFlowMonitor,
  optionstrategy: OptionStrategyBuilder,
  sizing: PositionSizing,
  sentiment: SentimentDashboard,
  commodity: CommodityDashboard,
  bonds: BondMarket,
  etf: ETFAnalytics,
  macroreport: MacroScorecard,
  currency: CurrencyAnalytics,
  fiideriv: FIIDerivativeStats,
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("macro");
  const [alerts, setAlerts] = useState(alertData);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const Section = SECTIONS[activeSection];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ticker */}
      <MarketTicker />

      {/* Header */}
      <Header
        unreadCount={unreadAlerts}
        onAlertClick={() => setActiveSection("alerts")}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop always visible, mobile overlay */}
        <div className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar
            active={activeSection}
            onChange={(id) => { setActiveSection(id); setSidebarOpen(false); }}
          />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden fixed bottom-4 left-4 z-50 w-10 h-10 bg-maroon-800 rounded-full flex items-center justify-center shadow-glow-maroon"
            onClick={() => setSidebarOpen(o => !o)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-ivory-100" /> : <Menu className="w-5 h-5 text-ivory-100" />}
          </button>

          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
            {Section ? (
              <Section />
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
