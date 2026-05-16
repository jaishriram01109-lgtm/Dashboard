"""
SmartFlow AI — Institutional Market Intelligence + AI Luxury Model Backend
FastAPI + WebSocket real-time data engine
"""
import asyncio
import json
import random
import math
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ─── MODELS ──────────────────────────────────────────────────

class MacroIndicator(BaseModel):
    id: str
    name: str
    value: float
    change: float
    change_pct: float
    unit: str
    impact: str
    affected_sectors: List[str]
    interpretation: str
    last_updated: str

class SectorData(BaseModel):
    id: str
    name: str
    price: float
    change_pct: float
    relative_strength: float
    momentum_score: float
    smart_money_score: float
    breakout_probability: float
    phase: str
    signal: str
    rank: int
    ai_comment: str

class StockQuote(BaseModel):
    symbol: str
    price: float
    change: float
    change_pct: float
    volume: int
    timestamp: str

class TradeSetup(BaseModel):
    id: str
    symbol: str
    setup_type: str
    trade_type: str
    entry: float
    stop_loss: float
    target1: float
    target2: float
    target3: float
    risk_reward: float
    conviction_score: int
    ai_rationale: str

class Alert(BaseModel):
    id: str
    type: str
    title: str
    message: str
    severity: str
    timestamp: str
    symbol: Optional[str] = None

class SmartMoneySignal(BaseModel):
    symbol: str
    signal_type: str
    confidence: float
    description: str
    timestamp: str

class AIPrediction(BaseModel):
    target: str
    type: str
    confidence: float
    probability: float
    expected_move: float
    timeframe: str
    rationale: str

# ─── CONNECTION MANAGER ──────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()

# ─── DATA ENGINE ─────────────────────────────────────────────

class MarketDataEngine:
    """Simulates real-time market data. Replace with live NSE/BSE API feeds."""

    BASE_PRICES = {
        "NIFTY": 24856.20, "BANKNIFTY": 53248.75, "SENSEX": 81543.60,
        "HAL": 4842.35, "TCS": 4284.60, "SUNPHARMA": 1842.40,
        "RVNL": 584.20, "DLF": 924.60, "HDFCBANK": 1784.60,
        "TATAMOTORS": 1024.80, "TATASTEEL": 148.40, "INFY": 1924.80,
        "WIPRO": 542.40, "ICICIBANK": 1182.60, "SBIN": 842.40,
    }

    def __init__(self):
        self.prices: Dict[str, float] = dict(self.BASE_PRICES)
        self.volumes: Dict[str, int] = {k: random.randint(500000, 5000000) for k in self.BASE_PRICES}
        self.last_update = datetime.utcnow()

    def tick(self) -> Dict[str, StockQuote]:
        """Generate one market tick (simulate bid/ask spread, real-time price)."""
        quotes = {}
        for symbol, price in self.prices.items():
            # Simulate realistic price movement
            volatility = 0.0015 if symbol in ["NIFTY", "SENSEX", "BANKNIFTY"] else 0.002
            change = price * (random.gauss(0.0001, volatility))
            new_price = round(price + change, 2)
            self.prices[symbol] = max(new_price, price * 0.85)  # Circuit breaker

            base = self.BASE_PRICES[symbol]
            delta = new_price - base
            delta_pct = (delta / base) * 100

            quotes[symbol] = StockQuote(
                symbol=symbol,
                price=new_price,
                change=round(delta, 2),
                change_pct=round(delta_pct, 2),
                volume=self.volumes[symbol] + random.randint(-10000, 50000),
                timestamp=datetime.utcnow().isoformat(),
            )
        self.last_update = datetime.utcnow()
        return quotes

market_engine = MarketDataEngine()

# ─── SMART MONEY ENGINE ──────────────────────────────────────

class SmartMoneyEngine:
    """Detects institutional footprints using delivery data, OI, block deals."""

    SIGNALS = [
        ("HAL", "institutional_accumulation", 96, "Block deal ₹284Cr. Delivery 68%. 3-session accumulation pattern."),
        ("TCS", "smart_money_entry", 88, "FII +1.8% stake QoQ. Delivery 72.4%. Large lot F&O buying."),
        ("RVNL", "operator_activity", 84, "Volume 2.8x avg. Dips bought aggressively. Strong delivery base."),
        ("SUNPHARMA", "hidden_buying", 82, "Delivery spike 78.4% — 52W high. Quiet accumulation before catalyst."),
        ("TATASTEEL", "distribution", 88, "FII -2.4% stake. High volume down days. Distribution confirmed."),
    ]

    def get_signals(self) -> List[SmartMoneySignal]:
        return [
            SmartMoneySignal(
                symbol=s[0], signal_type=s[1], confidence=s[2], description=s[3],
                timestamp=datetime.utcnow().isoformat()
            )
            for s in self.SIGNALS
        ]

    def get_ai_score(self, symbol: str) -> int:
        scores = {"HAL": 94, "TCS": 88, "SUNPHARMA": 82, "RVNL": 86, "DLF": 78, "HDFCBANK": 64, "TATASTEEL": 28}
        return scores.get(symbol, random.randint(40, 85))

sm_engine = SmartMoneyEngine()

# ─── QUANT ENGINE ────────────────────────────────────────────

class QuantEngine:
    """Quantitative ranking and signal generation."""

    @staticmethod
    def relative_strength(prices: List[float], benchmark: List[float]) -> float:
        """RS = (stock return) / (benchmark return)"""
        if not prices or not benchmark:
            return 50.0
        stock_return = (prices[-1] - prices[0]) / prices[0]
        bench_return = (benchmark[-1] - benchmark[0]) / benchmark[0]
        if bench_return == 0:
            return 50.0
        rs = stock_return / bench_return
        return min(max(rs * 50 + 50, 0), 100)

    @staticmethod
    def momentum_score(returns: List[float]) -> float:
        """Multi-factor momentum: 1M, 3M, 6M weighted average."""
        if len(returns) < 3:
            return 50.0
        weights = [0.4, 0.35, 0.25]
        score = sum(w * r for w, r in zip(weights, returns[:3]))
        return min(max(score * 100 + 50, 0), 100)

    @staticmethod
    def breakout_probability(price: float, resistance: float, volume_ratio: float, rsi: float) -> float:
        """Probability of breakout above resistance."""
        price_proximity = max(0, 1 - (resistance - price) / resistance * 10)
        volume_factor = min(volume_ratio / 3, 1.0)
        rsi_factor = min(rsi / 80, 1.0) if rsi < 80 else max(0, (100 - rsi) / 20)
        score = (price_proximity * 0.4 + volume_factor * 0.35 + rsi_factor * 0.25) * 100
        return round(min(max(score, 0), 100), 1)

    @staticmethod
    def entry_sl_target(price: float, atr: float, direction: str = "long") -> dict:
        """ICT-based entry, stop loss, and targets."""
        if direction == "long":
            entry = round(price * 1.002, 2)
            sl = round(price - 1.5 * atr, 2)
            t1 = round(price + 2 * atr, 2)
            t2 = round(price + 3.5 * atr, 2)
            t3 = round(price + 5.5 * atr, 2)
        else:
            entry = round(price * 0.998, 2)
            sl = round(price + 1.5 * atr, 2)
            t1 = round(price - 2 * atr, 2)
            t2 = round(price - 3.5 * atr, 2)
            t3 = round(price - 5.5 * atr, 2)

        risk = abs(entry - sl)
        reward = abs(t3 - entry)
        rr = round(reward / risk, 2) if risk > 0 else 0

        return {"entry": entry, "stop_loss": sl, "target1": t1, "target2": t2, "target3": t3, "risk_reward": rr}

quant = QuantEngine()

# ─── SECTOR ROTATION ENGINE ──────────────────────────────────

class SectorRotationEngine:
    """Tracks money rotation across NSE sectors using relative strength and flow data."""

    PHASES = ["accumulation", "markup", "distribution", "markdown"]

    SECTOR_SCORES = {
        "defence": {"rs": 94, "momentum": 91, "sm": 92, "phase": "markup"},
        "it": {"rs": 88, "momentum": 86, "sm": 85, "phase": "markup"},
        "pharma": {"rs": 82, "momentum": 79, "sm": 80, "phase": "markup"},
        "auto": {"rs": 78, "momentum": 81, "sm": 76, "phase": "markup"},
        "banking": {"rs": 62, "momentum": 58, "sm": 65, "phase": "accumulation"},
        "metals": {"rs": 32, "momentum": 28, "sm": 35, "phase": "markdown"},
        "fmcg": {"rs": 48, "momentum": 44, "sm": 52, "phase": "accumulation"},
        "railway": {"rs": 86, "momentum": 84, "sm": 82, "phase": "markup"},
    }

    def get_rotation_order(self) -> List[str]:
        """Returns sectors sorted by rotation strength (money flow direction)."""
        return sorted(self.SECTOR_SCORES, key=lambda s: (
            self.SECTOR_SCORES[s]["rs"] +
            self.SECTOR_SCORES[s]["momentum"] +
            self.SECTOR_SCORES[s]["sm"]
        ) / 3, reverse=True)

    def detect_rotation(self) -> dict:
        """Detects where money is rotating from/to."""
        order = self.get_rotation_order()
        return {
            "inflow_sectors": order[:3],
            "outflow_sectors": order[-2:],
            "neutral": order[3:-2],
            "confidence": 84,
            "timeframe": "3-6 weeks",
        }

rotation_engine = SectorRotationEngine()

# ─── LIFESPAN ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background WebSocket broadcast
    task = asyncio.create_task(broadcast_loop())
    # Start luxury post scheduler
    try:
        from luxury.scheduler import start_scheduler, stop_scheduler
        start_scheduler()
    except Exception:
        pass
    yield
    task.cancel()
    try:
        from luxury.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass

async def broadcast_loop():
    """Broadcasts live market ticks every 2 seconds to all WebSocket clients."""
    while True:
        try:
            await asyncio.sleep(2)
            quotes = market_engine.tick()
            await manager.broadcast({
                "type": "market_tick",
                "data": {k: v.model_dump() for k, v in quotes.items()},
                "timestamp": datetime.utcnow().isoformat(),
            })

            # Periodically broadcast AI alerts (every ~30 ticks)
            if random.random() < 0.03:
                alert = {
                    "type": "ai_alert",
                    "data": {
                        "id": f"alert_{random.randint(1000, 9999)}",
                        "type": random.choice(["smart_money_entry", "volume_explosion", "breakout"]),
                        "symbol": random.choice(["HAL", "TCS", "RVNL", "SUNPHARMA"]),
                        "title": "Real-time Alert",
                        "message": "Live smart money signal detected",
                        "severity": "high",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                }
                await manager.broadcast(alert)
        except asyncio.CancelledError:
            break
        except Exception:
            pass

# ─── APP ─────────────────────────────────────────────────────

app = FastAPI(
    title="SmartFlow AI + ZEPHYR VALE API",
    description="Institutional Market Intelligence + AI Luxury Model Backend",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount luxury model router ────────────────────────────────
try:
    from luxury import router as luxury_router
    app.include_router(luxury_router)
except Exception as _e:
    import logging
    logging.getLogger(__name__).warning(f"Luxury router not mounted: {_e}")

# ─── ROUTES ──────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "status": "SmartFlow AI + ZEPHYR VALE Engine Active",
        "version": "2.1.0",
        "modules": ["market", "luxury_model"],
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/market/quotes")
async def get_quotes(symbols: Optional[str] = Query(None)):
    """Get live quotes for given symbols (comma-separated) or all."""
    syms = symbols.split(",") if symbols else list(market_engine.prices.keys())
    quotes = {}
    for sym in syms:
        price = market_engine.prices.get(sym.strip().upper())
        if price:
            base = market_engine.BASE_PRICES.get(sym, price)
            quotes[sym] = {
                "symbol": sym,
                "price": round(price, 2),
                "change": round(price - base, 2),
                "change_pct": round((price - base) / base * 100, 2),
                "timestamp": datetime.utcnow().isoformat(),
            }
    return {"quotes": quotes}

@app.get("/api/macro")
async def get_macro():
    """Macro economic indicators dashboard."""
    return {
        "dxy": {"value": 104.23 + random.gauss(0, 0.1), "change_pct": -0.43, "impact": "positive"},
        "us_yield_10y": {"value": 4.42 + random.gauss(0, 0.02), "change_pct": -1.12, "impact": "positive"},
        "crude": {"value": 78.42 + random.gauss(0, 0.3), "change_pct": -1.54, "impact": "positive"},
        "gold": {"value": 72456 + random.gauss(0, 100), "change_pct": 0.43, "impact": "neutral"},
        "rbi_rate": {"value": 6.25, "change_pct": -3.85, "impact": "positive"},
        "fii_flow_mtd": {"value": 12450 + random.randint(-500, 500), "unit": "Cr"},
        "dii_flow_mtd": {"value": 8320 + random.randint(-300, 300), "unit": "Cr"},
        "india_vix": {"value": 13.24 + random.gauss(0, 0.2), "change_pct": -6.17},
        "usd_inr": {"value": 83.47 + random.gauss(0, 0.05), "change_pct": -0.14},
    }

@app.get("/api/sectors")
async def get_sectors():
    """Sector rotation analysis for all NSE sectors."""
    rotation = rotation_engine.detect_rotation()
    sectors = []
    for sid, scores in rotation_engine.SECTOR_SCORES.items():
        sectors.append({
            "id": sid,
            "relative_strength": scores["rs"] + random.gauss(0, 1),
            "momentum_score": scores["momentum"] + random.gauss(0, 1),
            "smart_money_score": scores["sm"] + random.gauss(0, 1),
            "phase": scores["phase"],
        })
    return {"sectors": sectors, "rotation": rotation}

@app.get("/api/stocks/{symbol}")
async def get_stock(symbol: str):
    """Full stock analysis — fundamental + technical + AI."""
    price = market_engine.prices.get(symbol.upper())
    if not price:
        raise HTTPException(404, f"Symbol {symbol} not found")

    atr = price * 0.015
    trade = quant.entry_sl_target(price, atr)
    ai_score = sm_engine.get_ai_score(symbol.upper())

    return {
        "symbol": symbol.upper(),
        "price": round(price, 2),
        "ai_score": ai_score,
        "smart_money_score": ai_score - random.randint(2, 8),
        "trade_setup": trade,
        "breakout_probability": quant.breakout_probability(price, price * 1.05, 2.2, 65),
        "rsi": 45 + random.gauss(15, 10),
        "delivery_pct": 55 + random.gauss(10, 8),
        "volume_ratio": 1.5 + random.gauss(0.5, 0.3),
    }

@app.get("/api/smart-money/signals")
async def get_smart_money_signals():
    """Smart money detection signals."""
    signals = sm_engine.get_signals()
    return {"signals": [s.model_dump() for s in signals]}

@app.get("/api/trade-setups")
async def get_trade_setups(
    trade_type: Optional[str] = None,
    min_rr: float = 2.0,
    min_conviction: int = 70,
):
    """AI-generated high-probability trade setups."""
    setups = [
        {
            "id": "ts1", "symbol": "HAL", "setup_type": "Breakout Continuation + FVG Fill",
            "trade_type": "swing", "entry": 4880, "stop_loss": 4620,
            "target1": 5100, "target2": 5400, "target3": 5800,
            "risk_reward": 3.8, "conviction_score": 92,
            "ai_rationale": "HAL breaking out of 3-week consolidation with 2.8x volume. FVG at 4700-4780 filled.",
        },
        {
            "id": "ts2", "symbol": "TCS", "setup_type": "Demand Zone Bounce",
            "trade_type": "swing", "entry": 4300, "stop_loss": 4080,
            "target1": 4500, "target2": 4700, "target3": 4900,
            "risk_reward": 2.9, "conviction_score": 88,
            "ai_rationale": "TCS bouncing from demand zone. DXY weakness + US tech spending recovery.",
        },
        {
            "id": "ts3", "symbol": "RVNL", "setup_type": "Momentum Continuation",
            "trade_type": "positional", "entry": 590, "stop_loss": 548,
            "target1": 640, "target2": 700, "target3": 780,
            "risk_reward": 4.5, "conviction_score": 86,
            "ai_rationale": "RVNL with 3x order inflow. Smart money buying every dip.",
        },
    ]

    filtered = [s for s in setups if s["risk_reward"] >= min_rr and s["conviction_score"] >= min_conviction]
    if trade_type:
        filtered = [s for s in filtered if s["trade_type"] == trade_type]

    return {"setups": filtered, "count": len(filtered)}

@app.get("/api/ai/predictions")
async def get_ai_predictions():
    """AI-powered market and sector predictions."""
    return {
        "predictions": [
            {
                "type": "sector_rally", "target": "Defence", "confidence": 91,
                "probability": 88, "expected_move": 15.4, "timeframe": "2-4 weeks",
                "rationale": "PLI scheme + ₹6.21L Cr budget + HAL backlog at record high.",
            },
            {
                "type": "sector_rally", "target": "Information Technology", "confidence": 86,
                "probability": 82, "expected_move": 12.8, "timeframe": "3-6 weeks",
                "rationale": "DXY weakness + AI spending boom + FII rotation into IT.",
            },
            {
                "type": "weak_sector", "target": "Metals", "confidence": 88,
                "probability": 84, "expected_move": -12.4, "timeframe": "4-8 weeks",
                "rationale": "China PMI weak. Global steel overcapacity. FII selling 6 consecutive weeks.",
            },
        ],
        "market_regime": {
            "regime": "risk_on",
            "confidence": 84,
            "description": "Sustained risk-on regime. FII at 3M high. VIX below 14.",
        },
    }

@app.get("/api/alerts")
async def get_alerts(limit: int = 20, severity: Optional[str] = None):
    """Live alert feed."""
    alerts = [
        {"id": "a1", "type": "smart_money_entry", "symbol": "HAL", "severity": "critical",
         "title": "Smart Money Entry", "message": "HAL: Block deal ₹284Cr. Accumulation confirmed.",
         "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat()},
        {"id": "a2", "type": "sector_rotation", "severity": "high",
         "title": "IT Sector Rotation", "message": "FII buying ₹2,840Cr in IT MTD. DXY falling below 104.",
         "timestamp": (datetime.utcnow() - timedelta(minutes=18)).isoformat()},
        {"id": "a3", "type": "volume_explosion", "symbol": "RVNL", "severity": "high",
         "title": "Volume Explosion — RVNL", "message": "RVNL volume at 2.8x 20D average. Breakout above 580.",
         "timestamp": (datetime.utcnow() - timedelta(minutes=28)).isoformat()},
    ]
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    return {"alerts": alerts[:limit], "total": len(alerts)}

@app.get("/api/fii-dii")
async def get_fii_dii():
    """FII/DII flow data."""
    history = []
    fii_cum, dii_cum = 0, 0
    for i in range(30, 0, -1):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        fii_day = random.gauss(400, 800)
        dii_day = random.gauss(300, 500)
        fii_cum += fii_day
        dii_cum += dii_day
        history.append({
            "date": date,
            "fii_day": round(fii_day, 0),
            "dii_day": round(dii_day, 0),
            "fii_cumulative": round(fii_cum, 0),
            "dii_cumulative": round(dii_cum, 0),
        })
    return {
        "fii_mtd": 12450,
        "dii_mtd": 8320,
        "net_mtd": 20770,
        "history": history,
    }

@app.get("/api/scanner")
async def run_scanner(
    scan_type: str = "breakout",
    min_score: int = 70,
    sector: Optional[str] = None,
):
    """Momentum scanner — returns matching stocks."""
    stocks = [
        {"symbol": "HAL", "ai_score": 94, "momentum": 91, "volume_ratio": 2.8, "delivery_pct": 68.4, "rsi": 68.4},
        {"symbol": "TCS", "ai_score": 88, "momentum": 86, "volume_ratio": 2.2, "delivery_pct": 72.4, "rsi": 64.2},
        {"symbol": "RVNL", "ai_score": 86, "momentum": 88, "volume_ratio": 2.8, "delivery_pct": 54.4, "rsi": 72.4},
        {"symbol": "SUNPHARMA", "ai_score": 82, "momentum": 80, "volume_ratio": 1.8, "delivery_pct": 78.4, "rsi": 62.4},
        {"symbol": "DLF", "ai_score": 78, "momentum": 78, "volume_ratio": 2.6, "delivery_pct": 62.4, "rsi": 64.8},
    ]
    return {
        "scan_type": scan_type,
        "results": [s for s in stocks if s["ai_score"] >= min_score],
        "count": len(stocks),
        "scanned_at": datetime.utcnow().isoformat(),
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "engine": "active",
        "websocket_clients": len(manager.active),
        "timestamp": datetime.utcnow().isoformat(),
    }

# ─── WEBSOCKET ────────────────────────────────────────────────

@app.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    """WebSocket endpoint — streams live market ticks every 2s."""
    await manager.connect(websocket)
    try:
        # Send initial snapshot
        quotes = market_engine.tick()
        await websocket.send_json({
            "type": "snapshot",
            "data": {k: v.model_dump() for k, v in quotes.items()},
        })
        # Keep alive
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket):
    """WebSocket endpoint — streams live alerts."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws_ping_interval=20)
