"""
Luxury prompt engineering system for ZEPHYR VALE.
All prompts are calibrated for hyper-realism and face consistency.
"""
from typing import Optional

# ─── Core identity anchor (injected into every prompt) ────────────────────
IDENTITY_ANCHOR = (
    "hyper realistic luxury male model ZEPHYR VALE, same consistent face identity, "
    "sharp defined jawline, deep-set hunter eyes, high cheekbones, straight refined nose, "
    "European-Indian masculine blend, natural skin texture with subtle pores, "
    "premium grooming, 27 years old, tall athletic lean physique"
)

# ─── Camera + technical quality anchor ────────────────────────────────────
CAMERA_ANCHOR = (
    "shot on Sony A7R V RAW, 85mm f/1.4 lens, cinematic depth of field, "
    "luxury editorial photography, Vogue and GQ magazine quality, "
    "8K ultra-detailed resolution, natural DSLR realism"
)

# ─── Universal negative prompt ─────────────────────────────────────────────
NEGATIVE_PROMPT = (
    "cartoon, anime, illustration, painting, low quality, blurry, watermark, "
    "signature, logo, text overlay, artificial looking skin, plastic face, "
    "over-smoothed skin, AI artifact, deformed hands, wrong anatomy, "
    "over-symmetry, unnatural lighting, cheap fashion, generic model look, "
    "distorted face, multiple people, extra limbs, bad proportions, "
    "unrealistic eyes, dull expression, poorly tailored clothing"
)

# ─── Location context templates ────────────────────────────────────────────
LOCATION_CONTEXT = {
    "Monaco Yacht Club": (
        "standing on the deck of a private mega-yacht in Monaco harbour, "
        "city lights and boats in bokeh background, Mediterranean golden sunset"
    ),
    "Paris Rooftop": (
        "on a Haussmann rooftop terrace in Paris at dusk, "
        "Eiffel Tower softly out of focus in the distance, golden city glow"
    ),
    "Milan Fashion District": (
        "walking through the Quadrilatero della Moda in Milan, "
        "luxury boutique storefronts, Italian architecture, editorial street style"
    ),
    "Amalfi Coast Villa": (
        "at a cliffside villa on the Amalfi Coast, "
        "turquoise Mediterranean sea below, bougainvillea in background"
    ),
    "Swiss Alpine Chalet": (
        "inside a luxury Swiss chalet, floor-to-ceiling windows, "
        "dramatic snow-capped alpine peaks visible, warm interior light"
    ),
    "Dubai Penthouse": (
        "in a glass-walled Dubai penthouse suite, "
        "aerial city skyline at night, Burj Khalifa visible, ambient city glow"
    ),
    "Tokyo Luxury Hotel": (
        "in a minimalist Japanese luxury hotel suite, "
        "floor-to-ceiling windows overlooking Tokyo city grid, neon ambient light"
    ),
    "London Private Club": (
        "in an old-world London private members club, "
        "dark wood panelling, leather chesterfields, warm amber light, "
        "oil paintings on walls, whisky glass on side table"
    ),
    "NYC Soho Studio": (
        "in a vast Soho loft studio, exposed brick, "
        "floor-to-ceiling industrial windows, dramatic natural light"
    ),
}

# ─── Outfit context templates ──────────────────────────────────────────────
OUTFIT_CONTEXT = {
    "Dior Homme SS25 Suit":          "wearing a perfectly tailored Dior Homme charcoal wool suit, crisp white shirt, no tie, top button open",
    "Tom Ford Tuxedo":                "wearing a Tom Ford black velvet tuxedo, white pleated dress shirt, black grosgrain bow tie",
    "Saint Laurent All-Black":        "wearing full Saint Laurent all-black — slim-cut black blazer, black trousers, black turtleneck",
    "Gucci Heritage Blazer":          "wearing a Gucci double-breasted navy blazer with gold buttons, cream trousers, loafers",
    "Brunello Cucinelli Cashmere":    "wearing a Brunello Cucinelli camel cashmere overcoat, cream cashmere turtleneck, grey flannel trousers",
    "Armani Linen":                   "wearing Giorgio Armani ivory linen suit, open collar shirt, no socks, leather loafers",
    "Loro Piana Weekend":             "wearing Loro Piana stone-grey cashmere polo and lightweight trousers, effortless weekend elegance",
    "Off-White Streetwear":           "wearing Off-White structured zip jacket, tailored cargo trousers, premium sneakers, subtle branding",
    "Prada Nylon Collection":         "wearing Prada nylon harness jacket over black turtleneck, slim trousers, Prada loafers",
}

# ─── Mood templates ────────────────────────────────────────────────────────
MOOD_CONTEXT = {
    "Mysterious & Brooding":      "dark brooding gaze into distance, slight jaw tension, intense and mysterious expression",
    "Confident & Powerful":       "strong direct gaze toward camera, slight confident smirk, commanding presence",
    "Relaxed Elegance":           "relaxed effortless expression, slight smile, comfortable in his own skin, eyes soft",
    "Fashion Week Intensity":     "intense editorial expression, strong energy, fashion week power aura",
    "Old Money Leisure":          "completely relaxed, effortlessly stylish, old money ease, quiet confidence",
    "Editorial Cinematic":        "cinematic editorial pose, strong angles, fashion photographer direction",
    "Raw Masculine Energy":       "raw masculine intensity, strong jaw set, powerful direct expression",
    "Quiet Contemplation":        "thoughtful distant gaze, introspective mood, philosophical quiet",
}

# ─── Lighting templates ────────────────────────────────────────────────────
LIGHTING_CONTEXT = {
    "Golden hour natural":        "warm golden hour sunlight, directional soft shadows, rim light on jaw",
    "Studio Rembrandt":           "classic Rembrandt studio lighting, one-light setup, dramatic shadow triangle under eye",
    "Moonlit cinematic":          "cool moonlight, low-key cinematic, deep shadows, mysterious ambient",
    "Morning window light":       "soft diffused morning light through floor-to-ceiling windows, gentle natural fill",
    "Harsh editorial flash":      "editorial strobe flash, sharp shadows, high-contrast fashion magazine lighting",
    "Cloudy diffused":            "overcast cloud-diffused natural light, even soft shadow, editorial outdoor quality",
    "Neon ambient luxury":        "luxury neon ambient light, coloured reflections on face, cinematic night scene",
    "Fireplace warm glow":        "warm amber fireplace glow, intimate luxury, flickering light on face",
}

# ─── Caption templates by mood ─────────────────────────────────────────────
CAPTION_OPENERS = {
    "Mysterious & Brooding": [
        "Some cities belong to those who don't explain themselves.",
        "Not everything worth having announces itself.",
        "The quieter the confidence, the louder the impact.",
        "Built different. Moves different. Says nothing.",
    ],
    "Confident & Powerful": [
        "This is what discipline looks like after a decade.",
        "Authority is earned in silence.",
        "The only competition is the version of you from yesterday.",
        "Power doesn't need an announcement.",
    ],
    "Relaxed Elegance": [
        "Some mornings are made for nothing but this.",
        "Unhurried. Unbothered. Exactly where I need to be.",
        "Elegance is a state of mind before it's a state of dress.",
        "The best things in life are unhurried.",
    ],
    "Old Money Leisure": [
        "Old money doesn't rush. It arrives.",
        "The lifestyle chose us. We simply maintained it.",
        "Generations of taste. Zero need to explain.",
        "There's a quiet grace to those who've always had enough.",
    ],
}

CAPTION_CLOSERS = [
    "— @zephyrvale",
    "\n\n— @zephyrvale",
    "\n\n✦",
    "\n\n🖤",
]

# ─── Hashtag sets ──────────────────────────────────────────────────────────
HASHTAG_SETS = {
    "luxury_fashion": "#LuxuryFashion #MensFashion #FashionEditorial #OldMoney #QuietLuxury",
    "old_money":      "#OldMoney #QuietLuxury #LuxuryLifestyle #LuxuryMen #Sophisticated",
    "editorial":      "#FashionEditorial #GQ #Vogue #FashionPhotography #EditorialFashion",
    "travel":         "#LuxuryTravel #LuxuryLifestyle #Monaco #Paris #Milan",
    "brands":         "#DiorHomme #TomFord #SaintLaurent #Gucci #LouisVuitton",
    "growth":         "#MensFashion #FashionWeek #FashionReel #StyleInspo #LuxuryStyle",
}

REEL_HOOKS = [
    "POV: You built an empire before 30 🖤",
    "The morning routine that changes everything 👀",
    "This is what 'dressing well' actually means 🖤",
    "When you move in silence and let the results speak ✨",
    "Old money energy — no explanation needed 🥂",
    "The outfit that made the room stop ✦",
    "What confidence looks like in real life 🖤",
    "This is why they stare 👀",
]

# ─── Builder functions ─────────────────────────────────────────────────────

def build_image_prompt(
    location: str,
    outfit: str,
    mood: str,
    lighting: str,
    brand_focus: Optional[str] = None,
    content_type: str = "photo",
) -> str:
    loc   = LOCATION_CONTEXT.get(location, f"at {location}, premium luxury environment")
    out   = OUTFIT_CONTEXT.get(outfit, f"wearing {outfit}")
    m     = MOOD_CONTEXT.get(mood, mood.lower())
    light = LIGHTING_CONTEXT.get(lighting, lighting.lower())

    brand_line = f", {brand_focus} aesthetic, brand partnership energy" if brand_focus else ""
    type_line  = ", 4K cinematic video frame" if content_type == "reel" else ""

    return (
        f"{IDENTITY_ANCHOR}, {out}, {loc}, "
        f"{light}, {m}, "
        f"{CAMERA_ANCHOR}, "
        f"luxury fashion editorial, hyper realistic, premium color grading, "
        f"Instagram luxury aesthetic, viral fashion composition"
        f"{brand_line}{type_line}"
    )


def build_caption(mood: str, brand: Optional[str] = None, location: Optional[str] = None) -> str:
    import random
    openers = CAPTION_OPENERS.get(mood, CAPTION_OPENERS["Mysterious & Brooding"])
    opener  = random.choice(openers)
    closer  = random.choice(CAPTION_CLOSERS)

    brand_tag = f"\n\n{brand}" if brand else ""
    loc_line  = f"\n\n📍 {location}" if location else ""

    return f"{opener}{brand_tag}{loc_line}{closer}"


def build_hashtags(
    brand: Optional[str] = None,
    is_travel: bool = False,
    is_reel: bool = False,
) -> str:
    tags = set()
    tags.update(HASHTAG_SETS["luxury_fashion"].split())
    tags.update(HASHTAG_SETS["old_money"].split())
    tags.update(HASHTAG_SETS["editorial"].split()[:3])

    if brand:
        tags.add(f"#{brand.replace(' ', '')}")
    if is_travel:
        tags.update(HASHTAG_SETS["travel"].split()[:4])
    if is_reel:
        tags.update(HASHTAG_SETS["growth"].split()[:3])

    return " ".join(sorted(tags)[:12])


def pick_reel_hook() -> str:
    import random
    return random.choice(REEL_HOOKS)
