# Pine Script v6 Wyckoff Indicator — Developer Reference

## Major Function / Section Breakdown

### 1. Input Groups (Lines ~20–70)
Three `input.group` sections organize all user-configurable parameters:
- **Detection Settings:** Controls sensitivity of Spring/UTAD detection, lookback period, climax volume multiplier, and expiry day adjustment
- **Display Settings:** Toggles for each visual layer — range box, labels, dashboard, equilibrium line, targets, volume signals
- **Alert Settings:** Individual enable/disable for each alert type so traders can subscribe selectively

### 2. Utility Functions (Lines ~100–140)
Self-contained helper functions used throughout the indicator:
- `isStrongUp()` / `isStrongDown()`: Returns `true` when a bar qualifies as an institutional-grade directional bar based on spread percentage
- `closePosition()`: Returns a 0.0–1.0 float indicating where in the bar range the close sits — critical for SC/BC vs genuine demand/supply bar differentiation
- `isExpiryDay()` / `isTuesdayExpiry()`: Detects expiry days using Pine Script v6's `dayofweek` constants
- `sensMult()`: Returns a sensitivity multiplier adjusted for input setting and expiry day boost

### 3. Volume Analysis Engine (Lines ~145–175)
Computes the institutional volume signals at each bar:
- `volRef`: Automatically switches from 20-period to 50-period average on expiry days, correcting for the artificial volume inflation those days create
- `isClimatic`: True when volume exceeds `i_volClimaxMult` × reference average
- `isNoDemand` / `isNoSupply`: Multi-condition checks for the classic Wyckoff no-demand and no-supply bar signatures
- `isAbsorption`: Detects effort-vs-result divergence — wide spread + high volume + narrow close spread

### 4. Trading Range Detection (Lines ~180–220)
Auto-detects ranging conditions using ATR compression:
- Compares current `atr(14)` against `atr(50)` — if the short-term ATR is compressed relative to the long-term average, ranging is active
- Dynamically expands the range as new high/low tests confirm the boundaries
- Classifies range as accumulation or distribution candidate by comparing average volume on down-tests vs up-tests using persistent counters (`var` variables)

### 5. Phase A Detection (Lines ~225–260)
Identifies the four Phase A events:
- **PS:** First demand appearance in downtrend — strong down-bar closing off lows with rising volume
- **SC:** Widest-spread climactic down-bar with close in upper-to-middle zone — the institutional absorption bar
- **AR:** Recovery off SC on good volume — defines range top
- **ST / PSY / BC:** Symmetric logic for accumulation bottom events and distribution top events

### 6. Spring and UTAD Detection — No-Repaint Logic (Lines ~265–335)
The most critical section. Uses a two-stage detection to eliminate repainting:
- **Stage 1 (Detection):** When a bar closes back above the range low after penetrating it, with low volume, a `springPending` flag is set and the spring parameters are recorded
- **Stage 2 (Confirmation):** Over the next 3 bars, the indicator monitors whether any bar undercuts the spring low with expanding volume. If yes, `springPending` is reset (failed spring). If 3 bars pass without a violation, `springDetected` is set permanently.
- All detection gates are wrapped in `barstate.isconfirmed` — zero repainting guaranteed
- Identical two-stage logic applies to UTAD detection

### 7. Phase D Detection (Lines ~340–390)
SOS, SOW, LPS, LPSY detection:
- **SOS:** Bar closing above range high with 1.5× volume and strong spread — Phase D begins
- **LPS:** After SOS, a pullback bar on below-average volume that holds above the range top — the conservative entry trigger
- **SOW / LPSY:** Mirror logic for distribution Phase D

### 8. Range Box and Target Lines (Lines ~420–505)
Dynamic `box.new()` drawing with v6 parameters:
- Deletes and redraws the box on every `barstate.islast` update so it always reflects the current range boundaries
- Box color switches automatically between `COLOR_ACC_BOX` and `COLOR_DIST_BOX` based on `isAccumulation`
- Target lines use `line.new()` with 50-bar right extension and `label.new()` with `label.style_label_left` for right-side text
- Equilibrium line uses `line.style_dashed` and `COLOR_EQUILIBRIUM` for subtle midline reference

### 9. Event Labels (Lines ~510–580)
All labels use `yloc.belowbar` or `yloc.abovebar` positioning with `tooltip` parameters populated with institutional-grade explanations. Label rendering is gated on:
- `i_showLabels` (user toggle)
- `barstate.isconfirmed` (no-repaint guarantee)
- The specific bar index matching the detected event's bar index

### 10. Dashboard Table (Lines ~605–710)
Uses Pine Script v6 `table.new()` with full 11-row × 2-column layout:
- Each cell uses dynamic color logic that reflects the actual market state
- Phase color = green for markup, red for markdown, orange for Phase C (highest action), teal for Phase D
- Setup Quality cell includes a `bgcolor` highlight for A+ setups for instant visual recognition
- Expiry day row uses orange highlighting to visually flag the heightened-sensitivity session

### 11. Alert System (Lines ~715–760)
Dual-layer alert system:
- `alertcondition()`: Creates subscribable alert conditions in TradingView's Alerts menu — these persist and fire without the chart being open
- `alert()` with `alert.freq_once_per_bar_close`: Fires real-time alerts during live sessions, respecting the bar-close confirmation requirement

---

## 5 Advanced Customizations for Personal Trading Style

### Customization 1: Tighten Spring Detection for Day Trading
For intraday (15M chart) Nifty day trading, change:
```pine
i_springSens = "High"
i_rangeLookback = 20  // Shorter lookback for intraday ranges
```
And add a custom condition inside the spring detection:
```pine
// Only detect springs in the 10:30–11:30 IST window on 15M chart
inKillZone = (hour == 10 and minute >= 30) or (hour == 11 and minute <= 30)
if penetratedLow and recoveredIntoRange and lowVolumeSpring and inKillZone and not springDetected
```
This focuses the indicator exclusively on the institutional kill zone where Tuesday springs occur.

### Customization 2: Add P&F Column Count from Range Width
Replace the simple ATR-based target calculation with a proper P&F-equivalent count:
```pine
// P&F-style count: range width ÷ box size × reversal multiplier
pnfBoxSize    = 50.0   // 50-point box for Nifty
pnfReversal   = 3.0    // 3-box reversal
columnCount   = math.round(rangeWidthPoints / pnfBoxSize)
pnfCause      = columnCount * pnfBoxSize * pnfReversal
targetMinPnF  = isAccumulation ? rangeLow  + pnfCause * 0.75 : rangeHigh - pnfCause * 0.75
targetMaxPnF  = isAccumulation ? rangeLow  + pnfCause * 1.5  : rangeHigh - pnfCause * 1.5
```
Replace `targetMin`/`targetMax` with `targetMinPnF`/`targetMaxPnF` throughout.

### Customization 3: Multi-Timeframe Phase Confirmation Panel
Add a second mini-dashboard showing the Wyckoff phase on higher timeframes:
```pine
// Request higher timeframe data
htfClose_D  = request.security(syminfo.tickerid, "D",  close)
htfClose_W  = request.security(syminfo.tickerid, "W",  close)
htfHigh_D   = request.security(syminfo.tickerid, "D",  ta.highest(high, 50))
htfLow_D    = request.security(syminfo.tickerid, "D",  ta.lowest(low,  50))

// Compare daily close position to daily range
dailyPosition = (htfClose_D - htfLow_D) / (htfHigh_D - htfLow_D)
dailyPhase    = dailyPosition > 0.7 ? "DISTRIBUTION ZONE" :
                dailyPosition < 0.3 ? "ACCUMULATION ZONE" : "MID-RANGE"
```
Add these as additional rows in the dashboard table.

### Customization 4: FII/DII Data Integration via Input
Since real FII data requires external data subscriptions, create manual input fields that the trader updates daily:
```pine
var GRP_FII = "FII/DII Daily Data (Update Manually)"
i_fiiNet3Day = input.string("0", "FII Net 3-Day Trend (Positive/Negative/Neutral)", group = GRP_FII)
i_diiNet     = input.string("Neutral", "DII Today", options = ["Buying", "Selling", "Neutral"], group = GRP_FII)

// Use this in setup quality scoring
if i_fiiNet3Day == "Positive" and isAccumulation and springDetected
    qualityScore := qualityScore + 2
```
This creates a hybrid fundamental + technical confluence check.

### Customization 5: Options Max Pain Level Input
Add a daily-updated max pain level as a key Wyckoff target:
```pine
var GRP_OPTIONS = "Options Data (Update Weekly)"
i_maxPain    = input.float(0.0,  "Nifty Max Pain Level", group = GRP_OPTIONS)
i_maxPainOn  = input.bool(false, "Show Max Pain Line",   group = GRP_OPTIONS)

if i_maxPainOn and i_maxPain > 0.0 and barstate.islast
    line.new(bar_index - 20, i_maxPain, bar_index + 30, i_maxPain,
             color = color.new(color.purple, 30), style = line.style_dotted, width = 2)
    label.new(bar_index + 30, i_maxPain, "Max Pain: " + str.tostring(i_maxPain),
              color = color.new(color.purple, 30), textcolor = color.white, size = size.small,
              style = label.style_label_left)
```
On Tuesday expiry days, this line becomes the primary target for spring trades.

---

## Known Limitations and How to Work Around Them

### Limitation 1: Range Detection Relies on ATR Compression
**Problem:** The indicator uses ATR compression to detect ranging. In trending markets with brief consolidations, it may misidentify short pauses as ranges, generating false Phase A events.

**Workaround:** Use the minimum 3-week duration rule manually. Only trust the range box if it has been active for at least 15 bars on daily charts. Add a filter:
```pine
barsInRange = not na(rangeBox) ? bar_index - (bar_index - i_rangeLookback) : 0
validRange  = barsInRange >= 15  // Minimum 15 daily bars
```

### Limitation 2: P&F Targets Are Approximations
**Problem:** The Wyckoff P&F count requires a proper Point & Figure chart. This indicator approximates it using ATR-based range width. The true P&F count on a 50-point box chart may differ.

**Workaround:** Use the indicator targets as the first reference. Then open a P&F chart (TradingView supports it natively: Change chart type → "Point & Figure") and manually count the horizontal columns. Use the manual count for final target confirmation.

### Limitation 3: Volume Comparison May Not Work on All Instruments
**Problem:** The `volRef` calculation assumes the instrument has consistent volume data. Some Indian index derivatives (especially deep OTM options) have erratic volume that can trigger false climactic readings.

**Workaround:** Only apply this indicator to: Nifty futures (NIFTY1!), Bank Nifty futures (BANKNIFTY1!), Nifty spot (NSE:NIFTY), or large-cap cash equities with daily volumes > 50 lakh shares.

### Limitation 4: No Multi-Timeframe Phase Sync
**Problem:** The indicator detects phases on a single timeframe. A spring on the 15M chart during a daily distribution is a high-risk trade, but the indicator will still flag it.

**Workaround:** Apply the indicator to at least two timeframes simultaneously using TradingView's multi-chart layout. Check that the daily chart phase aligns with your intended trade direction before acting on the 15M signal.

### Limitation 5: Spring Confirmation Delay (3 Bars)
**Problem:** The 3-bar confirmation window means the spring signal appears 3 bars after the actual spring low. On fast-moving instruments like Bank Nifty, this delay may result in a less optimal entry price.

**Workaround:** For Bank Nifty, reduce the confirmation window to 2 bars by changing the `barsSinceSpring <= 3` check to `barsSinceSpring <= 2`. Accept that this increases the false-positive rate slightly. Use tighter stops (10–15 points) to compensate.

### Limitation 6: The Indicator Cannot Replace Phase Labeling Judgment
**Problem:** Wyckoff phase identification at the highest level requires human judgment about market context — news events, FII activity, quarterly results cycles. The algorithm can identify the mechanical structure but cannot incorporate macro context.

**Workaround:** Use the indicator as a structural map, not as a mechanical signal generator. When the indicator says "SPRING DETECTED," verify with: (1) FII data, (2) options chain, (3) macro context. Trade only when the algorithmic signal and human judgment agree.
