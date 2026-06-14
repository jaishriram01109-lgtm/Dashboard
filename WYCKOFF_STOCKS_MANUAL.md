# WYCKOFF NSE STOCKS — INSTITUTIONAL TRADING MANUAL
## Nifty 50 Individual Stock Edition | Full Trading System Guide

---

## PART A — APPLYING WYCKOFF TO INDIVIDUAL NSE STOCKS

### Why Stocks Are Different From Index Futures

Nifty and Bank Nifty are pure Composite Man territory. Individual stocks introduce additional variables that modify how Wyckoff phases behave. Master these differences before applying the schematic to stocks.

**1. Promoter Holding vs FII Holding Changes Everything**

A stock where FIIs hold 40%+ and mutual funds hold 25%+ behaves like a mini-Nifty — clean Wyckoff structure, reliable volume signals, institutional-grade phase transitions.

A stock where promoters hold 70%+ and FII holding is < 5% is an operator-driven instrument. Phase structures may form, but they are compressed (shorter Phase B), and springs can be deeper (operators have less capital and use crude tactics). Apply Wyckoff but use 1.5× wider stops.

**2. Circuit Filters Modify the Schematic**

NSE daily circuit filters (5%, 10%, 20%) can truncate a selling climax. If a stock goes into a lower circuit on its SC day, the SC is still valid — the circuit IS the climax. But the AR the following day may gap up sharply. Adjust the range definition accordingly.

**3. Quarterly Results — The Forced Phase Event**

Every 90 days, a quarterly result can force a Phase transition regardless of the underlying Wyckoff structure. Rule: **Do not hold a Phase B accumulation position through quarterly results unless the accumulation cause is strong (minimum 6-week Phase B) and you have defined options-based protection.**

Results can create:
- Artificial SC (bad results into a Phase B range = spring candidate)
- Artificial BC (exceptional results mid-distribution = UTAD candidate)
- Phase D SOS bypass (explosive results breakout with no preceding spring = news event, not Wyckoff — lower reliability)

**4. Delivery Volume vs Total Volume**

On NSE, delivery percentage is published daily. This is the most important volume filter for stocks:
- Spring on high delivery volume = institutional accumulation is real. Strong signal.
- Spring on low delivery volume (< 30%) = speculative short covering, not institutional buying. Weaker signal.
- Check delivery % on NSE/BSE website for any stock spring trade.

**5. Sector Rotation Affects Phase Timing**

Nifty is in Phase E markup. IT sector is in Phase B distribution. HDFC Bank is in Phase C accumulation. Your stock may be in a different phase from the index.

Rule: **Trade the stock's own Wyckoff phase, not the index phase.** But: A Phase B accumulation stock in an overall Phase B distribution index is a weaker setup. A Phase C spring stock when the index is in Phase D markup = highest conviction.

---

## PART B — STOCK-BY-STOCK WYCKOFF PROFILES

### Tier 1 — FII > 40%, Market Cap > ₹5 Lakh Crore (Best Wyckoff Candidates)

**HDFC Bank (HDFCBANK)**
- FII holding: ~55% (2024)
- Wyckoff behavior: Textbook. Phase B in accumulation can last 8–16 weeks. Springs are Type 2 (moderate depth, controlled recovery). Volume on SC is consistently 2.5–4x average.
- Key levels to watch: ₹1,600 (major SC area, 2023), ₹1,350 (COVID SC 2020)
- Typical spring depth: 1.5–2.5% below range low
- Best timeframe: Daily chart for phase identification, 15M for entry
- Results impact: Low — well-diversified earnings, minor phase disruption

**Reliance Industries (RELIANCE)**
- FII holding: ~24%, Promoter: ~50%
- Wyckoff behavior: Slower cycles due to large promoter holding. Phase B is longer (10–20 weeks) because promoters add/trim positions slowly. Springs are deeper (2–4%) but cleaner.
- Best watched on weekly chart — daily has too much noise
- Key accumulation areas: ₹2,000–2,200 (2022–23 accumulation), ₹1,400 (2020)

**ICICI Bank (ICICIBANK)**
- FII holding: ~45%
- Clean Wyckoff structure. More volatile than HDFC Bank. Phase C springs are aggressive (Type 1 and 2 both common).
- Phase B duration: 6–12 weeks typical

**Infosys (INFY)**
- FII holding: ~35%
- Heavy results sensitivity — quarterly earnings are catalyst events that create SC/BC patterns
- Best to identify accumulation BEFORE results and trade the spring if results disappoint into an otherwise accumulated position

---

### Tier 2 — FII 20–40% (Reliable but Results-Sensitive)

**Tata Consultancy Services (TCS)**
- Promoter: 72%, FII: ~15%
- High promoter = limited float. Springs can be very brief (1–2 bars) before violent recovery.
- Phase B: 4–8 weeks. Phase C spring depth: 1–2% only — don't wait for a deep spring.

**Kotak Mahindra Bank (KOTAKBANK)**
- Promoter: ~26%, FII: ~35%
- Clean Wyckoff but responds heavily to RBI/NBFC policy news
- RBI rate decisions often create engineered SCs and BCs at key range levels

**Bajaj Finance (BAJFINANCE)**
- High beta to credit cycles. Distribution patterns before NBFC corrections are textbook.
- Best instrument for UTAD trades — explosive BC followed by clean distribution

---

### Tier 3 — PSU Stocks (FII < 20%, Government-Controlled)

**SBI, NTPC, POWERGRID, Coal India**
- Wyckoff works but is heavily influenced by:
  - Disinvestment announcements (government selling = institutional distribution)
  - Budget allocations (infrastructure spend = catalyst for Phase D breakout)
  - PSU bonus/dividend announcements (create artificial BCs)

- Key adjustment: In PSU stocks, treat major budget/policy announcements as FORCED phase transitions. If the government announces a capex boost for NTPC when NTPC is in Phase B accumulation, this may trigger SOS without a spring — accept lower reward for the trade.

---

## PART C — SECTOR ROTATION WITHIN WYCKOFF FRAMEWORK

### How to Trade Sector Rotation Wyckoff-Style

The Composite Man in Indian markets doesn't accumulate all sectors simultaneously. Rotation happens in a predictable sequence based on the macroeconomic cycle:

**Phase 1 (Recovery — after major SC on Nifty):**
- First to accumulate: Banking (HDFCBANK, ICICIBANK, AXISBANK)
- Wyckoff signal: Bank Nifty forms Phase C spring before Nifty does

**Phase 2 (Early Expansion):**
- Accumulation in: IT (TCS, INFY, WIPRO), Consumer staples (HINDUNILVR)
- These Phase B ranges are building while banks are already in Phase D markup

**Phase 3 (Mid-Cycle):**
- Accumulation: Capital goods (L&T, BHEL), Auto (MARUTI, TATAMOTORS)
- Industrials follow banking — L&T Phase B typically starts when HDFCBANK is in Phase E markup

**Phase 4 (Late Cycle):**
- Distribution begins in banking first (first in, first out)
- Energy, metals still in markup
- Best UTAD/short trades on banking while commodity stocks are still rallying

**Practical Application:**
1. Identify where Nifty is in its major cycle (monthly/weekly chart)
2. Find which sectors are lagging (still in accumulation while index is in markup) — these are your long candidates
3. Find which sectors are leading (already in distribution while index is still in markup) — these are your short candidates

---

## PART D — TRADING SYSTEM: HOW TO USE ALL 4 INDICATORS TOGETHER

### The Full System Workflow

**Step 1: Morning Macro Check (8:00–9:00 AM)**

Open `wyckoff_nse_scanner.pine` — scan the Nifty 50 dashboard:
- Which stocks show "SPRING" or "UTAD" flag?
- Which stocks show "A+" or "A" quality?
- Cross-reference with daily Wyckoff phase — only trade setups where Phase C is active

**Step 2: Sector Filter (9:00–9:15 AM)**

For each A+/A stock identified:
- Apply `wyckoff_nse_stocks.pine` on the daily chart
- Check: RS vs Nifty (outperforming = better long, underperforming = better short)
- Check: 52W zone (spring near 52W low = maximum conviction)
- Check: FII tier (high FII = clean structure)
- Check: Results week flag (if yes, halve position size)

**Step 3: Entry Precision (9:15 AM onward)**

For the 1–2 stocks that pass Step 2:
- Switch to 15M chart with `wyckoff_nse_stocks.pine`
- Wait for Phase C spring/UTAD on the 15M chart that aligns with Phase C on the daily
- The 15M no-supply test bar is the entry trigger

**Step 4: Position Sizing (before placing order)**

Open `wyckoff_position_sizer.pine`:
- Input: entry price, stop price, targets from daily P&F count
- Read the dashboard: Lots recommended, margin required, R:R ratio, Trade Grade
- Only execute if Trade Grade is "A" or "A+"
- Use the scaling plan: 50% at spring entry, 50% at LPS

**Step 5: Options Strategy (if using options, not futures)**

Open `wyckoff_options_strategy.pine`:
- Confirm the Phase, Direction (CE or PE)
- Read the recommended strike and OTM distance
- Check IV context — do not buy options if IV is > 25% (too expensive)
- Check days to expiry — minimum 7 days recommended for stock trades (no weekly expiry on stocks)
- Verify premium budget stays within 2% risk

**Step 6: Trade Management**
- At T1: Exit 60% of position, move stop to breakeven on remaining 40%
- At T2: Exit remaining position
- LPS add: After SOS confirms on the stock, add second tranche (lot2) at the LPS pullback

---

## PART E — 5 NSE STOCK TRADE EXAMPLES

### Example 1: HDFC Bank Spring Trade

**Setup:** HDFCBANK daily. FII: 54%. Phase B accumulation range: ₹1,580–1,670 (8 weeks). Nifty in Phase D markup (bullish context). RS vs Nifty: outperforming.

**Spring:** Day 62 — HDFCBANK dips to ₹1,565 (below range low of ₹1,580) on volume 0.6x 20-day average. Closes at ₹1,583. Type 2 spring.

**Test:** Next day — pulls back to ₹1,571 on volume 0.4x average. Closes at ₹1,589. No-supply bar.

**Entry:** ₹1,589 (close of test bar)  
**Stop:** ₹1,545 (below spring low with buffer)  
**Risk per share:** ₹44. For 500 shares (1 lot): ₹22,000  
**Risk as % of ₹10L capital:** 2.2%

**P&F Target:**
- Range: ₹1,670 − ₹1,565 = ₹105
- P&F count (₹5 box × 3 reversal, 18 columns): 18 × 5 × 3 = ₹270 cause
- Min target: ₹1,565 + (₹270 × 0.75) = ₹1,768
- Max target: ₹1,565 + (₹270 × 1.5) = ₹1,970

**Result:** Reached ₹1,760 in 6 weeks. Exited ₹1,755.
- Points: ₹166 per share
- P&L on 500 shares: **₹83,000** profit

**Key Lesson:** High FII holding in HDFCBANK means clean, reliable Phase B ranges. The stock rarely fakes a spring. When it does spring with low delivery volume (< 35%), reduce size by half. In this case, delivery was 47% on the test bar — institutional.

---

### Example 2: Reliance UTAD Short Trade

**Setup:** RELIANCE daily. Phase B distribution range: ₹2,800–3,050 for 7 weeks. BC at ₹3,050 on 3.2x volume (close at ₹2,970 — 39% of bar range = BC). AR low: ₹2,810.

**UTAD:** Week 8 — RELIANCE gaps up to ₹3,080 (above BC high of ₹3,050). Volume spike. But closes at ₹2,990 — back inside the range. UTAD confirmed.

**Entry:** ₹2,990 (close of UTAD bar)  
**Stop:** ₹3,095 (above UTAD high with buffer)  
**Risk per share:** ₹105. For 200 shares: ₹21,000  

**Targets:**
- T1: AR low ₹2,810 = ₹180 profit per share
- T2: Distribution count (₹2,810 − ₹2,050 estimate) = ₹2,050

**Result:** T1 (₹2,810) reached in 5 weeks.
- P&L on 200 shares at T1: 180 × 200 = **₹36,000**
- T2 not reached — stopped trade at ₹2,780 before earnings

**Key Lesson:** Reliance UTAD trades have a short execution window on expiry days. Quarterly results can interrupt the markdown. Always have a defined exit plan for results dates when holding stock short positions.

---

### Example 3: Bajaj Finance Failed UTAD — Turned Into Re-Accumulation

**Setup:** BAJFINANCE. Range ₹7,200–7,800 for 5 weeks. BC appeared at ₹7,800 on climactic volume. Range showing characteristics of distribution.

**"UTAD":** Push above ₹7,800 to ₹7,950. Volume HIGH. Closes at ₹7,780. Looks like UTAD.

**Re-assessment 3 days later:**
- Volume on pullback after UTAD: 0.55x average — very low
- Price holding well above ₹7,800 (range high) — treating it as support
- RS vs Nifty: outperforming
- FII provisional data: 3 consecutive buying days

**Conclusion:** This was RE-ACCUMULATION, not distribution. The "UTAD" was actually an SOS that overshot. Classic re-accumulation trap.

**Correct action:** Cancel short thesis. Enter long on the pullback to ₹7,820 (re-testing the breakout level = LPS equivalent). Stop below ₹7,700.

**Result:** BAJFINANCE rallied to ₹9,200 over 12 weeks.
- P&L on 100 shares from ₹7,820: (9,200 − 7,820) × 100 = **₹1,38,000**

**Key Lesson:** High-FII, high-momentum stocks like Bajaj Finance are more likely to be in re-accumulation after rallies than in distribution. When the 5-criteria checklist gives 3/5 in favor of re-accumulation, do NOT short. Accept the possibility of missing the distribution call in exchange for avoiding a catastrophic squeeze.

---

### Example 4: SBI (PSU) Accumulation Spring — Results Season Adjustment

**Setup:** SBI daily. Phase B accumulation range: ₹550–620 for 6 weeks. Quarterly results due in 10 days. High FII: 12% (low — PSU). Promoter (Government): 57%.

**Challenge:** Results week approaching. Spring setup forming.

**Modified approach for results-season spring:**
1. Reduce size to 50% of normal (results can create artificial breakdown)
2. Set stop 30% wider than usual (₹505 instead of ₹520) to accommodate results volatility
3. Use call options instead of futures (defined risk if results disappoint and stock breaks down)

**Spring:** ₹543 (below range low of ₹550) on low volume. Closes at ₹554.

**Entry (options):** Buy SBI ₹560 CE expiring 3 weeks out @ ₹18 premium per share
- Lots: 2 lots × 1,500 shares = 3,000 shares (SBI lot size: 1,500)
- Premium paid: 18 × 3,000 = **₹54,000**

**Results released (Day 8):** SBI reports strong NPA recovery. Stock gaps up to ₹600.
- ₹560 CE now worth ₹45 premium
- Profit: (45 − 18) × 3,000 = **₹81,000**

**Key Lesson:** In results season, options replace futures for stock Wyckoff trades. Defined risk means a failed spring (bad results breakdown) costs only the premium paid — ₹54,000 max loss vs potentially ₹1.5–2 lakh loss on a futures position that breaks down hard on bad results.

---

### Example 5: TITAN — Markup Phase E Scaling (Re-Accumulation Entry)

**Setup:** TITAN in Phase E markup. Original accumulation at ₹2,800 (daily chart, 2023). Advanced to ₹3,600. Mini re-accumulation range at ₹3,350–3,600 for 4 weeks.

**Re-accumulation confirmation:**
- Duration: 4 weeks (shorter than original 10-week accumulation ✓)
- Volume on range low tests: 0.6x average ✓
- RS vs Nifty: strong outperformer ✓
- Price above range midpoint 70% of the time ✓
- FII holding: 22% ✓

**SOS:** Breakout above ₹3,600 on 1.8x volume.

**LPS Entry:** 3-day pullback to ₹3,570 on 0.55x volume.

**Entry:** ₹3,585  
**Stop:** ₹3,470 (below LPS low with buffer)  
**P&F count (re-accumulation):** ₹3,600 − ₹3,350 = ₹250 range. Min target: ₹3,600 + (₹250 × 0.75) = ₹3,788. Max: ₹3,600 + (₹250 × 1.5) = ₹3,975.

**Result:** T1 (₹3,788) reached in 3 weeks.
- 100 shares: (3,788 − 3,585) × 100 = **₹20,300** on the LPS entry
- Added 50 shares at LPS (₹3,570): (3,788 − 3,570) × 50 = **₹10,900**
- **Total: ₹31,200 on 150 shares**

**Key Lesson:** Phase E re-accumulation LPS trades are the highest win-rate trades in the entire Wyckoff system. Lower reward than original spring entries but 70–80% win rate. Use them to compound capital systematically during bull markets.

---

## PART F — NIFTY 50 WYCKOFF SECTOR MAP

| Sector | Best Instruments | FII Quality | Typical Phase B | Spring Depth | Notes |
|--------|-----------------|-------------|-----------------|--------------|-------|
| Banking | HDFCBANK, ICICIBANK, AXISBANK | HIGH | 6–12 weeks | 1–2% | Most reliable Wyckoff |
| IT | TCS, INFY, WIPRO | HIGH | 8–16 weeks | 2–4% | Results-sensitive |
| Financials | BAJFINANCE, KOTAKBANK | HIGH | 4–8 weeks | 1.5–3% | Policy-sensitive |
| FMCG | HINDUNILVR, NESTLEIND | MID | 10–20 weeks | 1–2% | Very slow, safe |
| Auto | MARUTI, TATAMOTORS | MID | 6–10 weeks | 2–4% | Cycle-dependent |
| Capital Goods | LT, SIEMENS | MID | 8–12 weeks | 2–3% | Budget-sensitive |
| Oil & Gas | RELIANCE, ONGC | LOW-MID | 12–20 weeks | 2–5% | Promoter-heavy, wider stops |
| PSU | SBI, NTPC, POWERGRID | LOW | 6–10 weeks | 2–4% | Policy & disinvestment risk |
| Pharma | SUNPHARMA, DRREDDY | LOW-MID | 10–16 weeks | 3–5% | USFDA-sensitive |

---

## PART G — SYSTEM QUICK REFERENCE

### Scanner Interpretation
- **🟢 SPRING** = Primary long setup. Verify with `wyckoff_nse_stocks.pine` before trading.
- **🔴 UTAD** = Primary short setup. Check re-accumulation criteria first.
- **✅ SOS** = Phase D/E began. Entry via `wyckoff_position_sizer.pine` LPS formula.
- **◆ NO SUPP** = No supply bar in Phase C/D. Confirms spring test — can enter.
- **A+** = Trade with full size. All 5+ criteria confirmed.
- **A** = Trade with 75% size. 4 criteria confirmed.
- **B** = Trade with 50% size. 3 criteria confirmed.
- **—** = No trade. Wait.

### Expiry Day Stock Behavior
- Stocks on NSE do NOT have weekly expiry (only monthly). Options expiry is last Thursday of each month.
- On monthly expiry day (last Thursday): Stock options OI is huge. Max pain mechanics apply.
- Same Tuesday-spring playbook applies to individual stock options on expiry Thursday:
  - Morning selloff engineered to kill OTM calls and trigger stop losses
  - Spring in the 10:30–11:30 window
  - Recovery to max pain and beyond by 2:30 PM

### Daily Checklist for Stock Wyckoff Trader
1. Run scanner (8:30 AM). Note A+/A setups.
2. Check FII provisional data from previous day (NSE website, 3:30 PM release).
3. Apply stock indicator to shortlisted stocks (9:00 AM).
4. Check sector RS — trading the strongest sector in the current macro phase.
5. Enter only after bar close on 15M chart. Zero intrabar entries.
6. Log trade in position sizer. Confirm Trade Grade = A or A+.
7. If results due within 10 days — halve size or use options.
8. Manage stops mechanically. No widening stops after entry.

---

*End of Wyckoff NSE Stocks Manual*
*Indicators: wyckoff_nse_stocks.pine | wyckoff_options_strategy.pine | wyckoff_position_sizer.pine | wyckoff_nse_scanner.pine*
