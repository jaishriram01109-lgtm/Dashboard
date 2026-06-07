"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import MarketTicker from "@/components/MarketTicker";
import AngelLogin from "@/components/AngelLogin";
import { getAngelSession, getStoredRefreshToken, refreshAngelSession } from "@/lib/angelOne";
import Sidebar from "@/components/Sidebar";
import { alertData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowLeft } from "lucide-react";

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
const PromoterActivity = dynamic(() => import("@/components/PromoterActivity"), { ssr: false });
const DeliveryAnalysis = dynamic(() => import("@/components/DeliveryAnalysis"), { ssr: false });
const HighLowScanner = dynamic(() => import("@/components/HighLowScanner"), { ssr: false });
const InsiderRegistry = dynamic(() => import("@/components/InsiderRegistry"), { ssr: false });
const TaxOptimizer = dynamic(() => import("@/components/TaxOptimizer"), { ssr: false });
const GoalPlanner = dynamic(() => import("@/components/GoalPlanner"), { ssr: false });
const DashboardHome = dynamic(() => import("@/components/DashboardHome"), { ssr: false });

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
  fiideriv:  FIIDerivativeStats,
  promoter:  PromoterActivity,
  delivery:  DeliveryAnalysis,
  highlows:  HighLowScanner,
  insider:   InsiderRegistry,
  tax:       TaxOptimizer,
  goals:     GoalPlanner,
};

// Sections with live data (no ★ mock indicator shown)
const LIVE_SECTIONS = new Set([
  "home", "portfolio", "watchlist", "scanner", "breadth",
  "global", "currency", "commodity", "bonds", "index", "stocks",
  "sectors", "advanced-chart", "options", "fno", "smart-money",
  "screener", "highlows", "heatmap", "trades", "alerts", "charts", "ai-predict", "volatility",
]);

function isValidSection(id: string) {
  return id === "home" || id in SECTIONS;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [alerts, setAlerts] = useState(alertData);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [angelActive, setAngelActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check Angel One session; auto-refresh if refresh token exists
  useEffect(() => {
    const init = async () => {
      const session = getAngelSession();
      if (session) { setAngelActive(true); return; }

      // Try silent refresh if we have a stored refresh token
      const hasRt = !!getStoredRefreshToken();
      if (hasRt) {
        setRefreshing(true);
        const refreshed = await refreshAngelSession();
        setRefreshing(false);
        if (refreshed) { setAngelActive(true); return; }
      }

      setShowLogin(true);
    };
    init();
  }, []);

  // Read hash on mount for direct links / bookmarks
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && isValidSection(hash)) {
      setActiveSection(hash);
    } else {
      // Seed history so first back-press goes to home, not out of site
      window.history.replaceState({ section: "home" }, "", "#home");
    }
  }, []);

  // Browser back / forward
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1) || "home";
      setActiveSection(isValidSection(hash) ? hash : "home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (id: string) => {
    if (id === activeSection) { setSidebarOpen(false); return; }
    window.history.pushState({ section: id }, "", `#${id}`);
    setActiveSection(id);
    setSidebarOpen(false);
    // Scroll content back to top on section change
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const Section = SECTIONS[activeSection];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Silent refresh indicator */}
      {refreshing && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-maroon-700 border-t-maroon-300 rounded-full animate-spin" />
            <span className="text-xs text-ivory-500 font-mono">Reconnecting Angel One...</span>
          </div>
        </div>
      )}

      {/* Angel One login modal */}
      {showLogin && (
        <AngelLogin
          onSuccess={() => { setShowLogin(false); setAngelActive(true); }}
          onSkip={() => setShowLogin(false)}
        />
      )}

      {/* Ticker */}
      <MarketTicker />

      {/* Header */}
      <Header
        unreadCount={unreadAlerts}
        onAlertClick={() => {
          setAlerts(prev => prev.map(a => ({ ...a, read: true })));
          navigateTo("alerts");
        }}
        onNavigate={navigateTo}
        angelActive={angelActive}
        onAngelLoginClick={() => setShowLogin(true)}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — desktop always visible, mobile overlay */}
        <div className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar
            active={activeSection}
            onChange={navigateTo}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Content area */}
        <main id="main-content" className="flex-1 overflow-y-auto relative">
          {/* Mobile hamburger FAB */}
          <button
            className="lg:hidden fixed bottom-5 left-4 z-50 w-12 h-12 bg-maroon-800 rounded-full flex items-center justify-center shadow-glow-maroon border border-maroon-700"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Open navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-ivory-100" /> : <Menu className="w-5 h-5 text-ivory-100" />}
          </button>

          <div className="p-3 md:p-6 max-w-screen-2xl mx-auto pb-24 lg:pb-6">
            {/* Angel One not connected banner */}
            {!angelActive && !refreshing && (
              <div className="mb-3 flex items-center justify-between gap-3 bg-maroon-900/30 border border-maroon-700/40 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs text-ivory-400">
                  <span className="w-2 h-2 rounded-full bg-signal-bear inline-block flex-shrink-0" />
                  <span>Angel One connected nahi hai — <span className="text-ivory-600">demo data dikh raha hai</span></span>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex-shrink-0 text-[11px] font-bold text-maroon-300 hover:text-maroon-100 bg-maroon-800/40 hover:bg-maroon-800/70 border border-maroon-700/50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  ⚡ Connect Angel One
                </button>
              </div>
            )}

            {activeSection !== "home" && (
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-1.5 text-[11px] text-ivory-500 hover:text-ivory-100 transition-colors font-mono"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                {!LIVE_SECTIONS.has(activeSection) && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-ivory-700 font-mono">
                    <span className="text-gold-500">★</span> Simulated data
                  </span>
                )}
              </div>
            )}
            {activeSection === "home" ? (
              <DashboardHome onNavigate={navigateTo} />
            ) : Section ? (
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
