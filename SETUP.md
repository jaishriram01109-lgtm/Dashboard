# ZEPHYR VALE — AI Luxury Model System
## Complete Setup & Usage Guide

---

## What This System Does

An **autonomous AI influencer** that runs on autopilot:

1. **Generates** hyper-realistic luxury fashion photos & reels of AI male model ZEPHYR VALE
2. **Writes** luxury captions, hashtags, and DM replies automatically
3. **Sends** content to your Telegram for quick approval (one tap)
4. **Posts** to Instagram at the optimal time automatically
5. **Analyzes** performance and improves strategy every week
6. **Replies** to DMs with AI-generated luxury-toned responses

---

## Step 1 — Prerequisites

Install these on your machine:

```bash
# Node.js 18+
node --version   # should show v18+

# Python 3.11+
python3 --version

# Docker + Docker Compose
docker --version
docker compose version
```

---

## Step 2 — Clone & Configure

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd Dashboard

# 2. Copy environment file
cp .env.example .env

# 3. Open .env and fill in your keys (see section below)
nano .env
```

### Which keys are required?

| Key | Required? | Where to get |
|-----|-----------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** (for real AI) | console.anthropic.com |
| `INSTAGRAM_USER_ID` | **Yes** (for IG posting) | Meta Business Suite |
| `INSTAGRAM_ACCESS_TOKEN` | **Yes** (for IG posting) | Meta Business Suite |
| `REPLICATE_API_TOKEN` | **Yes** (for images) | replicate.com/account |
| `TELEGRAM_APPROVAL_BOT_TOKEN` | **Yes** (for approvals) | @BotFather on Telegram |
| `TELEGRAM_APPROVAL_CHAT_ID` | **Yes** (for approvals) | @userinfobot on Telegram |
| `R2_ACCOUNT_ID` etc | Recommended | cloudflare.com/r2 |
| Everything else | Optional | — |

> **Demo mode**: If keys are empty, the system runs with realistic mock data. All UI works, agents run, but nothing actually posts to Instagram.

---

## Step 3 — Start Everything (One Command)

```bash
docker compose up -d
```

This starts 5 services:

| Service | URL | What |
|---------|-----|------|
| Frontend (Next.js) | http://localhost:3000 | Dashboard UI |
| Backend (FastAPI) | http://localhost:8000 | API + agents |
| n8n Automation | http://localhost:5678 | Workflow engine |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

Check all are running:
```bash
docker compose ps
```

---

## Step 4 — Import n8n Automation Workflow

1. Open **http://localhost:5678**
2. Login: `admin` / `zephyrvale2025` (or your .env values)
3. Click **"Import Workflow"**
4. Paste or upload: `backend/n8n-workflow.json`
5. Click **"Activate"** toggle (top right)

The workflow now runs automatically:
- **Daily 9 AM** → generates content brief
- **Mon/Wed/Fri 8 PM** → posts approved content
- **Every 15 min** → checks + replies to DMs
- **Monday 9 AM** → weekly analytics report

---

## Step 5 — Set Up Telegram Approval Bot

```
1. Open Telegram → search @BotFather
2. Send: /newbot
3. Name: ZEPHYR VALE Approval
4. Username: zephyrvale_approve_bot (pick any available)
5. Copy the token → paste as TELEGRAM_APPROVAL_BOT_TOKEN in .env

6. Search @userinfobot on Telegram
7. Send /start → it gives you your Chat ID
8. Paste as TELEGRAM_APPROVAL_CHAT_ID in .env

9. Restart backend: docker compose restart backend
```

Now when content is ready, you get a Telegram message with:
- Preview of the generated image
- Caption + hashtags
- Quality score + predicted engagement
- **✅ Approve** / **❌ Reject** / **✏️ Edit** / **⏰ Reschedule** buttons

---

## Step 6 — Set Up Instagram API

```
1. Go to https://developers.facebook.com/
2. Create a new App → Business type
3. Add "Instagram Graph API" product
4. Connect your Instagram Business/Creator account
5. Generate a Long-Lived Access Token (valid 60 days)
6. Get your Instagram User ID from the API explorer

Permissions needed:
  ✓ instagram_basic
  ✓ instagram_content_publish
  ✓ instagram_manage_comments
  ✓ instagram_manage_messages
  ✓ instagram_manage_insights

Paste into .env:
  INSTAGRAM_USER_ID=your_numeric_id
  INSTAGRAM_ACCESS_TOKEN=EAAxxxx...
  FACEBOOK_APP_ID=xxxx
  FACEBOOK_APP_SECRET=xxxx
```

---

## Step 7 — Train Your LoRA Face Model (Optional but Recommended)

This gives ZEPHYR VALE a **consistent face identity** across all generated images.

```bash
cd backend/lora_training

# Requirements: NVIDIA GPU with 24GB+ VRAM (RTX 3090, A100, etc.)
bash train_zephyr.sh
```

The script will:
1. Ask you to prepare 100-500 face photos in `datasets/zephyr_vale/images/`
2. Auto-caption them using BLIP-2 AI
3. Train a FLUX LoRA for ~4 hours
4. Save `ZephyrBase-v4.safetensors` in `lora_models/`

**Dataset tips:**
- 40% close-up portraits, 30% half-body, 20% full-body, 10% side profile
- No sunglasses (breaks training)
- Vary lighting: natural, studio, dramatic, golden hour
- Use the same person in all photos

---

## How to Use the Dashboard

Open **http://localhost:3000** → scroll left sidebar to **✦ AI INFLUENCER**

---

### Model Hub (Home)
**What to look at first:**
- Top bar shows: Claude API connected? Instagram connected? Queue depth
- KPI row: followers, engagement rate, reach, DMs
- Agent status grid: which of the 9 agents are active right now
- Upcoming posts: what's scheduled to post next

---

### Content Studio — How to Generate Content

1. Click **"Content Studio"** in sidebar
2. Select content type: Photo / Reel / Story / Caption
3. Set scene parameters:
   - **Location**: Monaco Yacht Club, Paris Rooftop, etc.
   - **Outfit**: Dior Homme, Tom Ford, Saint Laurent, etc.
   - **Mood**: Mysterious, Confident, Editorial, etc.
   - **Lighting**: Golden hour, Studio, Moonlit, etc.
4. Click **"Generate Prompt + Caption"** → Claude AI writes the prompt
5. Click **"Generate Image (FLUX.1-dev)"** → image generates in ~30 seconds
6. Review the image + caption + hashtags
7. Click **"Send to Approval Queue"**

---

### Approval Queue — Approving Content

1. Click **"Approval Queue"** in sidebar
2. See all pending content cards
3. Expand a card → review full caption, hashtags, quality score
4. Actions:
   - **✅ Approve** → content scheduled for next optimal posting window
   - **❌ Reject** → content removed
   - **✏️ Edit** → opens inline caption editor → save → approve
5. Also works via Telegram (if bot is set up): tap button in the notification

---

### DM Auto-Reply — Managing Instagram DMs

1. Click **"DM Auto-Reply"** in sidebar
2. See your DM inbox with category tags (Collab / Fan / Brand / Question)
3. Click any thread → see the message
4. Click **"Generate AI Reply"** → Claude writes a luxury-toned reply
5. To enable fully automatic replies:
   - Toggle **"AI Auto-Reply"** to Active
   - Fan messages and style questions auto-reply immediately
   - Collab and brand inquiries stay manual (you review)

---

### Agent Network — Monitoring the AI Agents

1. Click **"Agent Network"** in sidebar
2. See all 9 agents with live status (Active / Idle / Waiting)
3. Click any agent card to expand → see current task + last output
4. Live activity log at bottom shows real-time agent messages
   - Green "WS Live" = connected to backend WebSocket (real data)
   - Grey "Demo" = backend offline (simulated data)

---

### Instagram Growth — Analytics

1. Click **"Instagram Growth"** in sidebar
2. **Overview tab**: KPI row (real data when backend connected), follower growth chart
3. **Content tab**: performance by type (Reels vs Photos vs Stories)
4. **Hashtags tab**: which hashtags drive most reach
5. **Best Times tab**: posting time heatmap (gold = highest engagement hours)

---

### Campaign Planner — Planning Content

1. Click **"Campaign Planner"** in sidebar
2. **Campaigns tab**: active campaigns with progress bars (Monaco, Paris, FW, etc.)
3. **Year Calendar tab**: month-by-month content planning
4. **Brief Templates tab**: click "Use Template" on any template
   - 4 templates: Brand Portrait, Travel Editorial, Fashion Week, Brand Collab
   - Each template generates a full campaign brief automatically

---

## The Autonomous Daily Cycle

Once everything is set up, this happens **automatically every day** with zero manual work:

```
9:00 AM  → Creative Director agent plans today's content brief
           based on seasonal calendar + trending aesthetics

9:05 AM  → Full pipeline runs:
           Prompt Engineer writes FLUX prompt
           Image generated (FLUX.1-dev, ~30s)
           Caption Storytelling agent writes luxury caption
           Face Consistency agent verifies identity (>99%)
           Approval agent pre-screens content quality

9:10 AM  → You get a Telegram notification:
           [Preview image + caption + quality score]
           [✅ Approve] [❌ Reject] [✏️ Edit] [⏰ Reschedule]

9:11 AM  → You tap ✅ Approve on your phone (takes 3 seconds)

8:00 PM  → Content automatically posts to Instagram
           (Mon/Wed/Fri — optimal posting windows)

9:00 PM  → Analytics agent checks 1-hour engagement
           Telegram report: "Post live! Engagement: 11.2% | Reach: 18.4K"

Every 15 min → DM auto-reply checks for new messages, replies automatically

Monday 9 AM → Weekly analytics report + next week's strategy update
```

---

## Troubleshooting

### Backend not connecting?
```bash
docker compose logs backend --tail=50
```

### n8n workflow not triggering?
- Check n8n is running: http://localhost:5678
- Verify workflow is **Activated** (toggle in top-right)
- Check `BACKEND_URL=http://backend:8000` in n8n env vars

### Images not generating?
- Check `REPLICATE_API_TOKEN` is set correctly in `.env`
- Run `docker compose restart backend` after changing .env

### Telegram bot not sending?
- Make sure you started a conversation with your bot first (send /start)
- Verify `TELEGRAM_APPROVAL_CHAT_ID` is your personal chat ID, not the bot ID

### Instagram posting failing?
- Access tokens expire after 60 days — refresh using:
  `GET /api/luxury/instagram/token/refresh`
- Verify account is Instagram Business (not Personal)

---

## File Structure

```
Dashboard/
├── src/
│   ├── app/page.tsx                    # Main routing
│   ├── components/
│   │   ├── Sidebar.tsx                 # Navigation
│   │   └── luxury/
│   │       ├── LuxuryModelHub.tsx      # Main hub
│   │       ├── ModelIdentity.tsx       # Face DNA
│   │       ├── ContentStudio.tsx       # Generate content
│   │       ├── AgentHub.tsx            # 9 agents live
│   │       ├── InstagramGrowth.tsx     # Analytics
│   │       ├── ApprovalQueue.tsx       # Approve/reject
│   │       ├── DMManager.tsx           # DM auto-reply
│   │       └── CampaignPlanner.tsx     # Campaigns
│   └── lib/
│       ├── luxuryApi.ts                # All API calls
│       └── useLuxuryAgent.ts           # React hooks
├── backend/
│   ├── luxury/
│   │   ├── __init__.py                 # All 24 API endpoints
│   │   ├── agents.py                   # 9 Claude AI agents
│   │   ├── image_gen.py                # FLUX + SDXL generation
│   │   ├── instagram.py                # Instagram Graph API
│   │   ├── scheduler.py                # APScheduler posting
│   │   ├── telegram_bot.py             # Approval bot
│   │   ├── websocket_manager.py        # Real-time streaming
│   │   ├── prompts.py                  # Prompt engineering
│   │   └── models.py                   # Pydantic models
│   ├── lora_training/
│   │   └── train_zephyr.sh             # LoRA training pipeline
│   └── n8n-workflow.json               # n8n automation (14 nodes)
├── comfyui-workflows/
│   └── zephyr-vale-flux-v1.json        # ComfyUI FLUX workflow
├── docker-compose.yml                  # Full stack (5 services)
└── .env.example                        # All env vars documented
```

---

## API Reference (Quick)

```
POST /api/luxury/generate-prompt     → Generate FLUX prompt + caption
POST /api/luxury/generate-image      → Generate image via FLUX/SDXL
POST /api/luxury/create-full         → Full pipeline (prompt+image+caption)
GET  /api/luxury/content-queue       → List content items
POST /api/luxury/content/approve     → Approve/reject/edit content
GET  /api/luxury/agents/status       → All 9 agent statuses
POST /api/luxury/agents/run          → Run a specific agent
GET  /api/luxury/instagram/messages  → Fetch DMs
GET  /api/luxury/analytics/growth    → Growth metrics
GET  /api/luxury/schedule            → Posting schedule
WS   /api/luxury/ws                  → Real-time agent activity stream
GET  /api/luxury/health              → System health check
```

Full API docs: http://localhost:8000/docs

---

*Built with Claude Sonnet 4.6 · FLUX.1-dev · Instagram Graph API · n8n*
