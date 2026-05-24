import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, Heart, ShoppingBag, User, X, ChevronDown, ChevronRight, Star, Plus, Minus, Check, ArrowRight, Instagram, Menu } from 'lucide-react';

// ─── PRODUCTS DATA ───────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Obsidian Slim Blazer", category: "men", subcategory: "blazers",
    price: 8999, mrp: 12999, colors: ["#1a1a1a", "#2c2c3e", "#4a3728"],
    sizes: ["S","M","L","XL","XXL"], rating: 4.8, reviews: 234,
    badge: "BESTSELLER", isNew: false, inStock: true,
    description: "A masterwork in Italian-inspired tailoring. Pure wool blend with silk lining, hand-finished lapels.",
    img1: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { id: 2, name: "Ivory Drape Kurta Set", category: "women", subcategory: "ethnic",
    price: 6499, mrp: 9999, colors: ["#f5f0e8", "#c9a84c", "#2c3e2c"],
    sizes: ["XS","S","M","L","XL"], rating: 4.9, reviews: 189,
    badge: "NEW", isNew: true, inStock: true,
    description: "Hand-embroidered chanderi silk. Fluid drape that moves like water.",
    img1: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80" },
  { id: 3, name: "Onyx Straight-Cut Trousers", category: "men", subcategory: "trousers",
    price: 3499, mrp: 4999, colors: ["#1a1a1a", "#3d3d3d", "#1a2540"],
    sizes: ["28","30","32","34","36","38"], rating: 4.7, reviews: 312,
    badge: null, isNew: false, inStock: true,
    description: "Precision-cut Italian wool blend. A perfect break at the ankle.",
    img1: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80" },
  { id: 4, name: "Champagne Evening Gown", category: "women", subcategory: "gowns",
    price: 14999, mrp: 21999, colors: ["#c9a84c", "#f5f0e8", "#1a1a1a"],
    sizes: ["XS","S","M","L"], rating: 5.0, reviews: 67,
    badge: "LIMITED", isNew: true, inStock: true,
    description: "Floor-length bias-cut silk charmeuse. Gold embellishment at the neckline.",
    img1: "https://images.unsplash.com/photo-1566479179817-0b9e4f3c4a17?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
  { id: 5, name: "Slate Oxford Shirt", category: "men", subcategory: "shirts",
    price: 2499, mrp: 3499, colors: ["#708090", "#1a1a1a", "#f5f0e8"],
    sizes: ["S","M","L","XL","XXL"], rating: 4.6, reviews: 445,
    badge: null, isNew: false, inStock: true,
    description: "100% Egyptian cotton poplin. Mother-of-pearl buttons.",
    img1: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80" },
  { id: 6, name: "Velvet Emerald Co-ord Set", category: "women", subcategory: "coord",
    price: 7999, mrp: 11999, colors: ["#1a3a2a", "#4a1a1a", "#1a1a3a"],
    sizes: ["XS","S","M","L","XL"], rating: 4.8, reviews: 156,
    badge: "NEW", isNew: true, inStock: true,
    description: "Italian crushed velvet. Structured blazer + wide-leg trouser.",
    img1: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80" },
  { id: 7, name: "Shawl Collar Bandhgala", category: "men", subcategory: "ethnic",
    price: 9999, mrp: 14999, colors: ["#1a1a1a", "#2c1a0e", "#1a2540"],
    sizes: ["S","M","L","XL","XXL"], rating: 4.9, reviews: 98,
    badge: "BESTSELLER", isNew: false, inStock: true,
    description: "Brocade silk with zardozi accents. The modern maharaja's choice.",
    img1: "https://images.unsplash.com/photo-1620912189865-1e8a33da4d9d?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1521341957697-b93449760f30?w=600&q=80" },
  { id: 8, name: "Midnight Draped Saree Gown", category: "women", subcategory: "saree",
    price: 11999, mrp: 17999, colors: ["#080820", "#1a1a1a", "#c9a84c"],
    sizes: ["Free Size"], rating: 4.7, reviews: 203,
    badge: "LIMITED", isNew: false, inStock: true,
    description: "Pre-draped Georgette with real zari border. No pinning required.",
    img1: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80" },
  { id: 9, name: "Cashmere Overcoat", category: "men", subcategory: "outerwear",
    price: 18999, mrp: 26999, colors: ["#2c2418", "#1a1a1a", "#8B7355"],
    sizes: ["S","M","L","XL"], rating: 4.9, reviews: 52,
    badge: "PREMIUM", isNew: false, inStock: true,
    description: "100% Mongolian cashmere. Double-breasted, peak lapels.",
    img1: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80" },
  { id: 10, name: "Gold Tissue Lehenga Set", category: "women", subcategory: "bridal",
    price: 24999, mrp: 35999, colors: ["#c9a84c", "#f5f0e8", "#8B0000"],
    sizes: ["XS","S","M","L","XL"], rating: 5.0, reviews: 34,
    badge: "BRIDAL", isNew: true, inStock: true,
    description: "Hand-woven Banarasi tissue with real gold zari. 800 hours of craftsmanship.",
    img1: "https://images.unsplash.com/photo-1594969155368-f19485a2c0e5?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80" },
  { id: 11, name: "Linen Relaxed Suit", category: "men", subcategory: "suits",
    price: 12999, mrp: 18999, colors: ["#C4B49A", "#F5F0E8", "#4A4A3A"],
    sizes: ["S","M","L","XL","XXL"], rating: 4.7, reviews: 167,
    badge: "NEW", isNew: true, inStock: true,
    description: "Belgian linen, unstructured silhouette. Summer luxury at its most refined.",
    img1: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { id: 12, name: "Silk Embroidered Palazzo Set", category: "women", subcategory: "coord",
    price: 8499, mrp: 12499, colors: ["#1a1a3a", "#3a1a2a", "#f5f0e8"],
    sizes: ["XS","S","M","L","XL"], rating: 4.8, reviews: 221,
    badge: null, isNew: false, inStock: true,
    description: "Hand-block printed silk. Palazzo pants with a whisper-light top.",
    img1: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
    img2: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "I wore the Ivory Drape Kurta to my sister's wedding and received compliments the entire evening. This is not fashion — it's art.", product: "Ivory Drape Kurta Set" },
  { name: "Arjun Mehta", city: "Delhi", rating: 5, text: "The Obsidian Blazer transformed how I present myself in boardrooms. The quality is simply unmatched at this price point.", product: "Obsidian Slim Blazer" },
  { name: "Kavya Nair", city: "Bangalore", rating: 5, text: "The Gold Tissue Lehenga was everything I dreamed for my wedding. 800 hours of craftsmanship — you feel every stitch.", product: "Gold Tissue Lehenga Set" },
  { name: "Rohan Kapoor", city: "Hyderabad", rating: 5, text: "The Cashmere Overcoat is worth every rupee. Worn it in London and everyone asks where it's from.", product: "Cashmere Overcoat" },
];

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    :root {
      --black: #080808; --obsidian: #0D0D0D; --charcoal: #161616;
      --surface: #1C1C1C; --surface-2: #242424; --border: #2E2E2E;
      --gold: #C9A84C; --gold-light: #E8C96A; --gold-dim: #8A6B28;
      --ivory: #F5F0E8; --cream: #EDE8DC; --white: #FFFFFF;
      --text-primary: #F0EBE3; --text-muted: #9A9289; --text-dim: #5C5650;
      --font-display: 'Cinzel', serif;
      --font-editorial: 'Cormorant Garamond', serif;
      --font-body: 'Jost', sans-serif;
      --ease-luxury: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      --t-fast: 0.2s; --t-med: 0.4s; --t-slow: 0.7s;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--black); color: var(--text-primary); font-family: var(--font-body); cursor: none; overflow-x: hidden; }
    a { color: inherit; text-decoration: none; }
    img { display: block; max-width: 100%; }
    button { cursor: none; border: none; background: none; font-family: var(--font-body); }
    input, textarea { font-family: var(--font-body); }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes drawLine {
      from { width: 0; }
      to { width: 100%; }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes pulse-gold {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes scan {
      0% { top: 0; }
      100% { top: 100%; }
    }

    .gold-shimmer {
      background: linear-gradient(90deg, #C9A84C 0%, #E8C96A 30%, #F5DFA0 50%, #E8C96A 70%, #C9A84C 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }
    .gold-border-shimmer {
      position: relative;
      border: 1px solid transparent;
      background-clip: padding-box;
    }
    .nav-link {
      position: relative; font-family: var(--font-body); font-size: 11px;
      letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-primary);
      padding: 4px 0; transition: color 0.3s;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px;
      background: var(--gold); transition: width 0.4s var(--ease-luxury);
    }
    .nav-link:hover::after { width: 100%; }
    .nav-link:hover { color: var(--gold); }

    .btn-gold-outline {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px; border: 1px solid var(--gold);
      color: var(--gold); font-family: var(--font-body); font-size: 11px;
      letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
      transition: all 0.3s var(--ease-luxury); position: relative; overflow: hidden;
      background: transparent;
    }
    .btn-gold-outline::before {
      content: ''; position: absolute; inset: 0;
      background: var(--gold); transform: translateX(-101%);
      transition: transform 0.4s var(--ease-luxury);
    }
    .btn-gold-outline:hover::before { transform: translateX(0); }
    .btn-gold-outline:hover { color: var(--black); }
    .btn-gold-outline span { position: relative; z-index: 1; }

    .btn-ivory {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px; background: var(--ivory);
      color: var(--black); font-family: var(--font-body); font-size: 11px;
      letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
      transition: all 0.3s var(--ease-luxury); position: relative; overflow: hidden;
    }
    .btn-ivory::before {
      content: ''; position: absolute; inset: 0;
      background: var(--gold); transform: translateX(-101%);
      transition: transform 0.4s var(--ease-luxury);
    }
    .btn-ivory:hover::before { transform: translateX(0); }
    .btn-ivory span { position: relative; z-index: 1; }

    .section-reveal { overflow: hidden; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--obsidian); }
    ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

    @media (max-width: 768px) {
      body { cursor: auto; }
    }
  `}</style>
);

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [cursorState, setCursorState] = useState('default');
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 768) return;
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };
    const onEnter = (e) => {
      const el = e.target;
      if (el.dataset.cursor === 'view') setCursorState('view');
      else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.closest('button') || el.closest('a')) setCursorState('hover');
      else setCursorState('default');
    };
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8,
        background: 'var(--gold)', borderRadius: '50%', pointerEvents: 'none',
        zIndex: 99999, transition: 'opacity 0.3s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99998, pointerEvents: 'none',
        width: cursorState === 'view' ? 64 : cursorState === 'hover' ? 48 : 32,
        height: cursorState === 'view' ? 64 : cursorState === 'hover' ? 48 : 32,
        border: `1px solid var(--gold)`,
        borderRadius: '50%',
        background: cursorState === 'hover' ? 'rgba(201,168,76,0.15)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'width 0.3s, height 0.3s, background 0.3s',
        marginLeft: cursorState === 'view' ? -16 : 0,
        marginTop: cursorState === 'view' ? -16 : 0,
      }}>
        {cursorState === 'view' && (
          <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--gold)', fontFamily: 'var(--font-body)' }}>VIEW</span>
        )}
      </div>
    </>
  );
};

// ─── PAGE LOADER ──────────────────────────────────────────────────────────────
const PageLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1400);
    const t4 = setTimeout(() => setPhase(4), 2000);
    const t5 = setTimeout(() => onComplete(), 2800);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  const letters = "LUSSOVOGUE".split('');
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase >= 4 ? 0 : 1, scale: phase >= 4 ? 1.05 : 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, background: 'var(--black)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 10000,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: phase >= 1 ? '60%' : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ height: 1, background: 'var(--gold)', marginBottom: 40 }}
      />
      <div style={{ display: 'flex', gap: 2 }}>
        {letters.map((l, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 48px)',
              letterSpacing: '0.3em', color: 'var(--ivory)',
            }}
          >{l}</motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-editorial)', fontSize: 16, fontStyle: 'italic',
          color: 'var(--gold)', letterSpacing: '0.2em', marginTop: 16,
        }}
      >Wear the Extraordinary</motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: phase >= 1 ? '60%' : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ height: 1, background: 'var(--gold)', marginTop: 40 }}
      />
    </motion.div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div key={t.id}
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 280,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.type === 'success' ? '#4A9B6F' : '#C0392B', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}><X size={14} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ cartCount, wishlistCount, onCartOpen, onSearchOpen, onMobileMenuOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 60px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.4s, backdrop-filter 0.4s',
        background: scrolled ? 'rgba(8,8,8,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(46,46,46,0.6)' : '1px solid transparent',
      }}
    >
      {/* Logo */}
      <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.3em' }}
        className={scrolled ? 'gold-shimmer' : ''}>
        LUSSOVOGUE
      </a>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {['NEW IN','MEN','WOMEN','COLLECTIONS','THE EDIT','ABOUT'].map(item => (
          <div key={item} style={{ position: 'relative' }}
            onMouseEnter={() => (item === 'MEN' || item === 'WOMEN') && setMegaMenu(item)}
            onMouseLeave={() => setMegaMenu(null)}>
            <a href="#" className="nav-link">{item}</a>
          </div>
        ))}
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={onSearchOpen} style={{ color: 'var(--text-primary)', display: 'flex', transition: 'color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
          <Search size={18} />
        </button>
        <button style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, position: 'relative', transition: 'color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
          <Heart size={18} />
          {wishlistCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--gold)', color: 'var(--black)', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{wishlistCount}</span>}
        </button>
        <button style={{ color: 'var(--text-primary)', display: 'flex', transition: 'color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
          <User size={18} />
        </button>
        <button onClick={onCartOpen} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, position: 'relative', transition: 'color 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
          <ShoppingBag size={18} />
          {cartCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--gold)', color: 'var(--black)', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{cartCount}</span>}
        </button>
        <button onClick={onMobileMenuOpen} style={{ color: 'var(--text-primary)', display: 'none' }}><Menu size={20} /></button>
      </div>

      {/* Mega menu */}
      <AnimatePresence>
        {megaMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            onMouseEnter={() => setMegaMenu(megaMenu)} onMouseLeave={() => setMegaMenu(null)}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)', padding: '40px 80px',
              display: 'flex', gap: 80,
            }}
          >
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 20, textTransform: 'uppercase' }}>Shop {megaMenu}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(megaMenu === 'MEN' ? ['Shirts','Trousers','Blazers','Ethnic Wear','Outerwear','Suits'] : ['Kurta Sets','Gowns','Coord Sets','Sarees','Bridal','Palazzo Sets']).map(cat => (
                  <a key={cat} href="#" style={{ fontFamily: 'var(--font-editorial)', fontSize: 22, fontWeight: 300, color: 'var(--text-primary)', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>{cat}</a>
                ))}
              </div>
            </div>
            <div style={{ width: 220, position: 'relative' }}>
              <img src={megaMenu === 'MEN' ? PRODUCTS[0].img1 : PRODUCTS[1].img1}
                alt="featured" style={{ width: '100%', height: 280, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Featured</p>
                <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 16 }}>{megaMenu === 'MEN' ? PRODUCTS[0].name : PRODUCTS[1].name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ─── SEARCH OVERLAY ───────────────────────────────────────────────────────────
const SearchOverlay = ({ isOpen, onClose, onQuickView }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const results = query.length > 1 ? PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); setQuery(''); }
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.95)', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 160 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 28, right: 60, color: 'var(--text-muted)' }}><X size={24} /></button>
          <p style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--gold)', marginBottom: 32, textTransform: 'uppercase' }}>Search the Collection</p>
          <div style={{ width: '100%', maxWidth: 600, position: 'relative' }}>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Type to search..."
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--gold)',
                padding: '16px 0', fontSize: 32, color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'var(--font-editorial)', fontWeight: 300,
              }} />
            <Search size={20} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          {results.length > 0 && (
            <div style={{ width: '100%', maxWidth: 600, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {results.map(p => (
                <button key={p.id} onClick={() => { onQuickView(p); onClose(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', background: 'none', textAlign: 'left' }}>
                  <img src={p.img1} alt={p.name} style={{ width: 48, height: 60, objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 18, color: 'var(--text-primary)' }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--gold)' }}>₹{p.price.toLocaleString()}</p>
                  </div>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
const HeroSection = ({ onQuickView }) => {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 240]);
  const textY = useTransform(scrollY, [0, 600], [0, -80]);
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      {/* BG */}
      <motion.div style={{ position: 'absolute', inset: 0, y: bgY }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(201,168,76,0.12) 0%, transparent 60%), linear-gradient(135deg, #080808 0%, #161616 100%)',
        }} />
        {/* Noise */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.04, width: '100%', height: '100%' }}>
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        {/* Particles */}
        {particles.map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 17 + 5) % 95}%`,
            bottom: `${(i * 13 + 10) % 40}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: 'var(--gold)',
            opacity: 0.3 + (i % 5) * 0.1,
            animation: `float ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
      </motion.div>

      {/* Content */}
      <motion.div style={{ position: 'relative', zIndex: 2, paddingLeft: 'clamp(24px, 10vw, 160px)', maxWidth: 700, y: textY }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ fontSize: 11, letterSpacing: '0.5em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 24 }}>
          SS 2025 Collection
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1, marginBottom: 8, color: 'var(--ivory)' }}>
          DEFINE YOUR
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}
          className="gold-shimmer"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1, marginBottom: 32 }}>
          LEGACY.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.7, marginBottom: 40 }}>
          Premium menswear &amp; womenswear crafted for those who refuse the ordinary. Exclusively Indian. Globally luxurious.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <button className="btn-gold-outline"><span>SHOP MEN</span></button>
          <button className="btn-ivory"><span>SHOP WOMEN</span></button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 40, letterSpacing: '0.1em' }}>
          or explore the new collection ↓
        </motion.p>
      </motion.div>

      {/* Right editorial label */}
      <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase' }}>New Arrivals 2025</p>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: 80, padding: '20px 60px',
        background: 'rgba(8,8,8,0.5)', backdropFilter: 'blur(10px)',
      }}>
        {[['2,400+', 'Styles'], ['48h', 'Delivery'], ['Free', 'Returns']].map(([num, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)' }}>{num}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── MARQUEE BAR ──────────────────────────────────────────────────────────────
const MarqueeBar = () => {
  const items = ['FREE SHIPPING ABOVE ₹4,999', 'HANDCRAFTED IN INDIA', 'LUXURY FABRICS', 'EASY RETURNS', 'EXCLUSIVE DESIGNS', '48H DELIVERY'];
  const repeated = [...items, ...items];
  return (
    <div style={{ background: 'var(--gold)', padding: '12px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap' }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.3em', color: 'var(--black)', padding: '0 40px' }}>
            {item} <span style={{ opacity: 0.5, marginLeft: 40 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, subtitle, center }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <div ref={ref} style={{ textAlign: center ? 'center' : 'left', marginBottom: 60 }}>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 0.5 }}
        style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>
        {eyebrow}
      </motion.p>
      <div style={{ overflow: 'hidden' }}>
        <motion.h2
          initial={{ y: '100%' }} animate={{ y: inView ? 0 : '100%' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, lineHeight: 1.1, color: 'var(--ivory)' }}>
          {title}
        </motion.h2>
      </div>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 0.3 }}
          style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 16, fontWeight: 300, maxWidth: center ? 500 : 400, margin: center ? '16px auto 0' : '16px 0 0' }}>
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onQuickView, onAddToCart, onWishlist, wishlist }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [hovered, setHovered] = useState(false);
  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', cursor: 'none' }}
    >
      {/* Image */}
      <div data-cursor="view" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--surface)', marginBottom: 16 }}>
        <img src={product.img1} alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.6s, opacity 0.5s', opacity: hovered ? 0 : 1 }} />
        <img src={product.img2} alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.6s, opacity 0.5s', opacity: hovered ? 1 : 0 }} />

        {/* Badge */}
        {product.badge && (
          <div style={{ position: 'absolute', top: 16, left: 16, padding: '4px 10px', background: product.badge === 'BESTSELLER' ? 'var(--gold)' : product.badge === 'LIMITED' || product.badge === 'BRIDAL' ? '#8B0000' : 'var(--surface-2)', color: product.badge === 'BESTSELLER' ? 'var(--black)' : 'var(--ivory)', fontSize: 9, letterSpacing: '0.2em', fontWeight: 600 }}>
            {product.badge}
          </div>
        )}

        {/* Wishlist */}
        <button onClick={() => onWishlist(product.id)}
          style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(8,8,8,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isWishlisted ? '#C0392B' : 'var(--text-primary)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
          <Heart size={15} fill={isWishlisted ? '#C0392B' : 'none'} />
        </button>

        {/* Quick View pill */}
        <motion.button
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: hovered ? 0 : '100%', opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onQuickView(product)}
          style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', padding: '10px 24px', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(8px)', color: 'var(--ivory)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,0.4)', whiteSpace: 'nowrap' }}>
          Quick View
        </motion.button>

        {/* Discount */}
        {discount > 0 && (
          <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(74,155,111,0.9)', padding: '4px 8px', fontSize: 10, color: '#fff', fontWeight: 600, opacity: hovered ? 0 : 1, transition: 'opacity 0.3s' }}>
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0 4px' }}>
        <p style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{product.subcategory}</p>
        <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8 }}>{product.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {product.colors.map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.15)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-editorial)', fontSize: 22, color: 'var(--gold)' }}>₹{product.price.toLocaleString()}</span>
          <span style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={11} fill={i < Math.floor(product.rating) ? 'var(--gold)' : 'none'} color="var(--gold)" />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>({product.reviews})</span>
        </div>
        <button onClick={() => onAddToCart(product)}
          style={{ width: '100%', marginTop: 14, padding: '12px', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'transparent', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

// ─── NEW ARRIVALS ─────────────────────────────────────────────────────────────
const NewArrivalsSection = ({ onQuickView, onAddToCart, onWishlist, wishlist }) => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter || (filter === 'new' && p.isNew));

  return (
    <section style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <SectionHeader eyebrow="The Collection" title="New Arrivals" />
        <div style={{ display: 'flex', gap: 4 }}>
          {[['all','All'],['men','Men'],['women','Women'],['new','New In']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '8px 20px', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', border: `1px solid ${filter === val ? 'var(--gold)' : 'var(--border)'}`, color: filter === val ? 'var(--gold)' : 'var(--text-muted)', background: filter === val ? 'rgba(201,168,76,0.08)' : 'transparent', transition: 'all 0.3s', cursor: 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 32 }}>
        <AnimatePresence>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onQuickView={onQuickView} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ─── CATEGORIES GRID ──────────────────────────────────────────────────────────
const CategoriesGrid = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const cats = [
    { label: 'Men', sub: 'The New Season', img: PRODUCTS[0].img1, span: '2' },
    { label: 'Women', sub: 'Redefine Elegance', img: PRODUCTS[3].img1, span: '1' },
    { label: 'Bridal', sub: 'Your Eternal Day', img: PRODUCTS[9].img1, span: '1' },
    { label: 'Ethnic', sub: 'Roots of Luxury', img: PRODUCTS[6].img1, span: '1' },
  ];
  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', background: 'var(--obsidian)' }}>
      <SectionHeader eyebrow="Shop by Category" title="Curated for You" center />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 16 }}>
        {cats.map((cat, i) => (
          <motion.div key={cat.label}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.95 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{ gridColumn: i === 0 ? 'span 2' : 'span 1', position: 'relative', overflow: 'hidden', aspectRatio: i === 0 ? '16/9' : '4/5', cursor: 'none' }}
            className="cat-card"
            onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; }}>
            <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: i === 0 ? 36 : 24, color: 'var(--ivory)' }}>{cat.label}</p>
              <p style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.15em', marginTop: 4 }}>{cat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── BRAND STORY ──────────────────────────────────────────────────────────────
const BrandStorySection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap' }}>
      <motion.div
        initial={{ opacity: 0, x: -60 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -60 }}
        transition={{ duration: 0.7 }}
        style={{ flex: '1 1 400px', position: 'relative' }}>
        <img src={PRODUCTS[9].img1} alt="Brand Story" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: -24, right: -24, background: 'var(--surface)', padding: 24, border: '1px solid var(--border)', maxWidth: 240 }}>
          <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 18, color: 'var(--gold)', marginBottom: 8 }}>"Born in India."</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>Every thread tells a story of 5,000 years of Indian craft heritage, reimagined for the modern world.</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 60 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{ flex: '1 1 400px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 20 }}>Our Story</p>
        <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--ivory)', lineHeight: 1.2, marginBottom: 24 }}>
          Where Indian Heritage Meets Global Luxury
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, fontWeight: 300, marginBottom: 24 }}>
          LussoVogue was born from a single belief: that Indian craftsmanship deserves to stand alongside the greatest luxury houses in the world. We work with master artisans from Varanasi, Jaipur, and Surat — ensuring that every garment carries centuries of tradition in every stitch.
        </p>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, fontWeight: 300, marginBottom: 40 }}>
          Our fabrics are sourced from the finest mills in Italy and India. Our designs are conceived in Mumbai and finished by hand. The result is clothing that feels extraordinary — because it is.
        </p>
        <button className="btn-gold-outline"><span>DISCOVER OUR STORY</span> <ArrowRight size={14} /></button>
      </motion.div>
    </section>
  );
};

// ─── STATS ────────────────────────────────────────────────────────────────────
const CountUp = ({ end, prefix = '', suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      const eased = 1 - Math.pow(1 - Math.min(elapsed, 1), 3);
      setCount(Math.floor(eased * end));
      if (elapsed >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const stats = [
    { num: 2400, suffix: '+', label: 'Unique Styles', prefix: '' },
    { num: 98, suffix: '%', label: 'Happy Customers', prefix: '' },
    { num: 50000, suffix: '+', label: 'Orders Delivered', prefix: '' },
    { num: 800, suffix: ' hrs', label: 'In Every Garment', prefix: '' },
  ];
  return (
    <section ref={ref} style={{ background: 'var(--charcoal)', padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
            transition={{ delay: i * 0.1 }}
            style={{ textAlign: 'center' }}>
            <p className="gold-shimmer" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)', marginBottom: 8 }}>
              <CountUp end={s.num} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── VIRTUAL TRY-ON ───────────────────────────────────────────────────────────
const VirtualTryOn = ({ onAddToCart }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [photo, setPhoto] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [filter, setFilter] = useState('all');
  const [phase, setPhase] = useState('idle'); // idle | processing | result
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const fileRef = useRef(null);

  const msgs = ['Analyzing your silhouette...', 'Matching fabric texture...', 'Rendering fit...', 'Almost ready...'];
  const filteredProducts = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter || (filter === 'trending' && p.badge));

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleTryOn = () => {
    if (!photo) return;
    setPhase('processing');
    setProgress(0);
    let pct = 0;
    let msgIdx = 0;
    setProgressMsg(msgs[0]);
    const iv = setInterval(() => {
      pct += 2 + Math.random() * 3;
      if (pct > 100) pct = 100;
      setProgress(Math.floor(pct));
      msgIdx = Math.min(3, Math.floor((pct / 100) * 4));
      setProgressMsg(msgs[msgIdx]);
      if (pct >= 100) { clearInterval(iv); setTimeout(() => setPhase('result'), 400); }
    }, 50);
  };

  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', background: 'var(--obsidian)', borderTop: '1px solid var(--border)' }}>
      <SectionHeader eyebrow="Innovation" title="Try Before You Buy" subtitle="Upload your photo and see our collection on YOU. The future of fashion shopping is here." center />

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {/* Upload panel */}
        <div style={{ flex: '1 1 340px' }}>
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => !photo && fileRef.current?.click()}
            style={{
              border: `2px dashed ${photo ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 4, minHeight: 280, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: 32,
              position: 'relative', cursor: 'none', transition: 'border-color 0.3s',
              background: photo ? 'transparent' : 'var(--surface)',
            }}>
            {photo ? (
              <>
                <img src={photo} alt="upload" style={{ maxHeight: 260, objectFit: 'contain', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(74,155,111,0.9)', padding: '4px 10px', fontSize: 10, color: '#fff', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} /> Photo Ready
                </div>
                <button onClick={(e) => { e.stopPropagation(); setPhoto(null); setPhase('idle'); }}
                  style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <div style={{ width: 64, height: 64, border: '1px solid var(--gold-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <User size={28} color="var(--gold-dim)" />
                </div>
                <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Drop your photo here</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>or click to browse</p>
                <p style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>JPG · PNG · WEBP · MAX 10MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6 }}>
            🔒 Your photo is processed locally and never stored on our servers.
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Tips for best results</p>
            {['Face forward, arms slightly apart', 'Well-lit background works best', 'Solid color backgrounds ideal'].map(tip => (
              <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div style={{ flex: '1 1 340px' }}>
          {phase === 'idle' && (
            <div style={{ height: '100%', minHeight: 280, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 32 }}>
              <div style={{ width: 80, height: 80, border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pulse-gold 2s ease-in-out infinite' }}>
                <span style={{ fontSize: 28 }}>✨</span>
              </div>
              <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>Your Look Appears Here</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>Upload your photo, select a garment, and see the magic happen.</p>
            </div>
          )}

          {phase === 'processing' && (
            <div style={{ height: '100%', minHeight: 280, border: '1px solid var(--border)', background: 'var(--surface)', padding: 32, position: 'relative', overflow: 'hidden' }}>
              {photo && <img src={photo} alt="processing" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.4 }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(8,8,8,0.6) 80%)' }} />
              {/* Scan line */}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', animation: 'scan 1.5s ease-in-out infinite', opacity: 0.8 }} />
              <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
                <p style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: 12 }}>{progressMsg}</p>
                <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', transition: 'width 0.1s', borderRadius: 1 }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>{progress}%</p>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div style={{ border: '1px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                {photo && <img src={photo} alt="result" style={{ width: '100%', height: 380, objectFit: 'cover', objectPosition: 'top' }} />}
                <img src={selectedProduct.img1} alt="outfit"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.75 }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(8,8,8,0.7)', padding: '4px 10px', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em' }}>
                  Powered by LussoVogue AI ✦
                </div>
              </div>
              <div style={{ padding: 20, background: 'var(--surface)', display: 'flex', gap: 12 }}>
                <button className="btn-gold-outline" style={{ flex: 1 }} onClick={() => onAddToCart(selectedProduct)}><span>Add to Cart</span></button>
                <button onClick={() => setPhase('idle')} style={{ padding: '12px 16px', border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', fontSize: 10, letterSpacing: '0.15em' }}>RETRY</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product selector */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Select Garment to Try</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['all','All'],['men','Men'],['women','Women'],['trending','Trending']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                style={{ padding: '6px 14px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', border: `1px solid ${filter === val ? 'var(--gold)' : 'var(--border)'}`, color: filter === val ? 'var(--gold)' : 'var(--text-muted)', background: 'transparent', transition: 'all 0.3s', cursor: 'none' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => setSelectedProduct(p)} style={{ flexShrink: 0, width: 120, cursor: 'none' }}>
              <div style={{ position: 'relative', border: `2px solid ${selectedProduct.id === p.id ? 'var(--gold)' : 'transparent'}`, transition: 'border-color 0.3s' }}>
                <img src={p.img1} alt={p.name} style={{ width: 120, height: 150, objectFit: 'cover', display: 'block' }} />
              </div>
              <p style={{ fontSize: 10, color: selectedProduct.id === p.id ? 'var(--gold)' : 'var(--text-muted)', marginTop: 6, lineHeight: 1.3, textAlign: 'center' }}>{p.name}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn-gold-outline" onClick={handleTryOn} style={{ opacity: photo ? 1 : 0.4 }}>
            <span>TRY THIS ON →</span>
          </button>
          {!photo && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>Upload your photo first</p>}
        </div>
      </div>
    </section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  useEffect(() => {
    const iv = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(iv);
  }, []);
  const t = TESTIMONIALS[active];
  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', background: 'var(--charcoal)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
      <SectionHeader eyebrow="Testimonials" title="What Our Clients Say" center />
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
            {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />)}
          </div>
          <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)', lineHeight: 1.6, marginBottom: 32 }}>
            "{t.text}"
          </p>
          <p style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{t.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{t.city} · {t.product}</p>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ width: i === active ? 28 : 8, height: 2, background: i === active ? 'var(--gold)' : 'var(--border)', border: 'none', transition: 'all 0.3s', cursor: 'none' }} />
        ))}
      </div>
    </section>
  );
};

// ─── INSTAGRAM STRIP ──────────────────────────────────────────────────────────
const InstagramStrip = () => {
  const images = PRODUCTS.slice(0, 6).map(p => p.img1);
  return (
    <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)', background: 'var(--obsidian)' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <Instagram size={18} color="var(--gold)" />
          <p style={{ fontSize: 12, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>@lussovogue</p>
        </div>
        <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 28, color: 'var(--ivory)', fontWeight: 300 }}>Seen on Instagram</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', cursor: 'none' }}
            onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'; e.currentTarget.querySelector('.ig-overlay').style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; e.currentTarget.querySelector('.ig-overlay').style.opacity = '0'; }}>
            <img src={img} alt="instagram" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
            <div className="ig-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}>
              <Instagram size={24} color="white" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
const NewsletterSection = ({ addToast }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSent(true);
    addToast('Welcome to LussoVogue! Check your inbox.', 'success');
  };

  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Exclusive Access</p>
        <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, color: 'var(--ivory)', marginBottom: 16, lineHeight: 1.2 }}>
          The Inner Circle
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: 40 }}>
          Join 50,000+ subscribers for exclusive access to new collections, private sales, and the art of dressing extraordinarily.
        </p>
        {sent ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--gold)' }}>
            <Check size={20} /> <span style={{ fontFamily: 'var(--font-editorial)', fontSize: 20 }}>Welcome to the Circle</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
              style={{ flex: 1, padding: '14px 20px', background: 'var(--charcoal)', border: '1px solid var(--border)', borderRight: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
            <button type="submit" className="btn-gold-outline" style={{ borderRadius: 0 }}><span>JOIN</span></button>
          </form>
        )}
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 16 }}>No spam. Unsubscribe anytime.</p>
      </motion.div>
    </section>
  );
};

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
const CartDrawer = ({ isOpen, onClose, cart, updateQty, removeItem, addToast }) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleCheckout = () => {
    addToast('Redirecting to secure checkout...', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'var(--black)', zIndex: 8000 }} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '100vw', background: 'var(--obsidian)', zIndex: 8001, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)' }}>

            {/* Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.2em' }}>YOUR BAG</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 80 }}>
                  <ShoppingBag size={40} color="var(--border)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 22, color: 'var(--text-muted)', marginBottom: 8 }}>Your bag is empty</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Add something extraordinary.</p>
                  <button onClick={onClose} className="btn-gold-outline" style={{ marginTop: 24 }}><span>SHOP NOW</span></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <AnimatePresence>
                    {cart.map((item, i) => (
                      <motion.div key={`${item.id}-${item.size}`}
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                        transition={{ delay: i * 0.06 }}
                        style={{ display: 'flex', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                        <img src={item.img1} alt={item.name} style={{ width: 80, height: 100, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>Size: {item.size} · {item.category}</p>
                          <p style={{ fontSize: 15, color: 'var(--gold)', marginBottom: 12 }}>₹{item.price.toLocaleString()}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                              <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} style={{ padding: '6px 10px', color: 'var(--text-muted)', display: 'flex' }}><Minus size={12} /></button>
                              <span style={{ padding: '6px 12px', fontSize: 13, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} style={{ padding: '6px 10px', color: 'var(--text-muted)', display: 'flex' }}><Plus size={12} /></button>
                            </div>
                            <button onClick={() => removeItem(item.id, item.size)} style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'underline', letterSpacing: '0.05em' }}>Remove</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SUBTOTAL</span>
                  <span style={{ fontFamily: 'var(--font-editorial)', fontSize: 20, color: 'var(--gold)' }}>₹{total.toLocaleString()}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 20 }}>Shipping & taxes calculated at checkout</p>
                <button onClick={handleCheckout} className="btn-ivory" style={{ width: '100%', justifyContent: 'center' }}><span>PROCEED TO CHECKOUT</span></button>
                <button onClick={onClose} style={{ width: '100%', textAlign: 'center', padding: 12, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: 8, background: 'none', border: 'none' }}>Continue Shopping</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── QUICK VIEW MODAL ─────────────────────────────────────────────────────────
const QuickViewModal = ({ product, onClose, onAddToCart, onWishlist, wishlist }) => {
  const [size, setSize] = useState('');
  const [imgActive, setImgActive] = useState(0);
  const isWishlisted = wishlist.includes(product?.id);

  useEffect(() => {
    if (product) setSize('');
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'var(--black)', zIndex: 9000 }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(900px, 95vw)', maxHeight: '90vh', overflowY: 'auto', background: 'var(--charcoal)', border: '1px solid var(--border)', zIndex: 9001, display: 'flex', flexWrap: 'wrap' }}>

            {/* Images */}
            <div style={{ flex: '1 1 350px', position: 'relative' }}>
              <img src={imgActive === 0 ? product.img1 : product.img2} alt={product.name}
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
                {[product.img1, product.img2].map((img, i) => (
                  <button key={i} onClick={() => setImgActive(i)}
                    style={{ width: 48, height: 60, border: `2px solid ${imgActive === i ? 'var(--gold)' : 'transparent'}`, overflow: 'hidden', cursor: 'none' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ flex: '1 1 300px', padding: 40, display: 'flex', flexDirection: 'column' }}>
              <button onClick={onClose} style={{ alignSelf: 'flex-end', color: 'var(--text-muted)', marginBottom: 20 }}><X size={20} /></button>
              {product.badge && <span style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>{product.badge}</span>}
              <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 28, fontWeight: 400, color: 'var(--ivory)', marginBottom: 12, lineHeight: 1.2 }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < Math.floor(product.rating) ? 'var(--gold)' : 'none'} color="var(--gold)" />)}
                <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 4 }}>({product.reviews} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-editorial)', fontSize: 28, color: 'var(--gold)' }}>₹{product.price.toLocaleString()}</span>
                <span style={{ fontSize: 14, color: 'var(--text-dim)', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>{product.description}</p>

              {/* Colors */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>Color</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.colors.map(c => <div key={c} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid var(--border)' }} />)}
                </div>
              </div>

              {/* Sizes */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>Size</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      style={{ padding: '8px 16px', border: `1px solid ${size === s ? 'var(--gold)' : 'var(--border)'}`, color: size === s ? 'var(--gold)' : 'var(--text-muted)', background: size === s ? 'rgba(201,168,76,0.08)' : 'transparent', fontSize: 12, cursor: 'none', transition: 'all 0.2s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                <button onClick={() => { if (size) { onAddToCart({ ...product, size }); } }}
                  className="btn-gold-outline" style={{ flex: 1, opacity: size ? 1 : 0.5 }}>
                  <span>{size ? 'ADD TO BAG' : 'SELECT SIZE'}</span>
                </button>
                <button onClick={() => onWishlist(product.id)}
                  style={{ padding: '14px', border: `1px solid ${isWishlisted ? '#C0392B' : 'var(--border)'}`, color: isWishlisted ? '#C0392B' : 'var(--text-muted)', background: 'transparent', display: 'flex', alignItems: 'center', transition: 'all 0.3s', cursor: 'none' }}>
                  <Heart size={18} fill={isWishlisted ? '#C0392B' : 'none'} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: 'var(--obsidian)', borderTop: '1px solid var(--border)', padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 80px) 40px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 48, marginBottom: 60 }}>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.3em', marginBottom: 16 }} className="gold-shimmer">LUSSOVOGUE</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300, maxWidth: 220 }}>Born in India. Worn by the World. Premium fashion for those who refuse the ordinary.</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {['IG','FB','TW','YT'].map(s => (
            <button key={s} style={{ width: 36, height: 36, border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.05em', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {[
        { title: 'Shop', links: ['New Arrivals','Men','Women','Collections','Bridal','Sale'] },
        { title: 'Help', links: ['Size Guide','Shipping','Returns','Track Order','FAQ','Contact Us'] },
        { title: 'Company', links: ['About Us','Careers','Press','Sustainability','Artisans','Blog'] },
      ].map(col => (
        <div key={col.title}>
          <p style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {col.links.map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.3s', fontWeight: 300 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ivory)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{link}</a>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>© 2025 LussoVogue Pvt. Ltd. All rights reserved.</p>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy Policy','Terms of Use','Cookie Policy'].map(l => (
          <a key={l} href="#" style={{ fontSize: 11, color: 'var(--text-dim)', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>{l}</a>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Made with ♥ in India</p>
    </div>
  </footer>
);

// ─── MOBILE MENU ──────────────────────────────────────────────────────────────
const MobileMenu = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{ position: 'fixed', inset: 0, background: 'var(--obsidian)', zIndex: 9500, display: 'flex', flexDirection: 'column', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.3em' }} className="gold-shimmer">LUSSOVOGUE</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['NEW IN','MEN','WOMEN','COLLECTIONS','THE EDIT','ABOUT'].map((item, i) => (
            <motion.a key={item} href="#" onClick={onClose}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ fontFamily: 'var(--font-editorial)', fontSize: 32, fontWeight: 300, color: 'var(--text-primary)', padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'block' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
              {item}
            </motion.a>
          ))}
        </div>
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-editorial)', fontSize: 14, fontStyle: 'italic', color: 'var(--text-muted)' }}>Wear the Extraordinary</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── BESTSELLER CAROUSEL (Horizontal Scroll) ──────────────────────────────────
const BestsellerCarousel = ({ onQuickView, onAddToCart, onWishlist, wishlist }) => {
  const containerRef = useRef(null);
  const bestsellers = PRODUCTS.filter(p => p.badge === 'BESTSELLER' || p.rating >= 4.9);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const atStart = el.scrollLeft === 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (!atStart && !atEnd) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <section style={{ padding: 'clamp(60px, 8vw, 100px) 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', marginBottom: 40 }}>
        <SectionHeader eyebrow="Most Loved" title="The Bestsellers" />
      </div>
      <div ref={containerRef} style={{ display: 'flex', gap: 24, overflowX: 'auto', padding: '0 clamp(20px, 5vw, 80px) 24px', scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
        <style>{`.bestseller-scroll::-webkit-scrollbar { display: none; }`}</style>
        {bestsellers.map((p, i) => (
          <div key={p.id} style={{ flexShrink: 0, width: 300 }}>
            <ProductCard product={p} index={i} onQuickView={onQuickView} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const addToCart = useCallback((product) => {
    const size = product.size || product.sizes[0];
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size);
      if (existing) return prev.map(i => i.id === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, size, qty: 1 }];
    });
    addToast(`${product.name} added to your bag`, 'success');
    setCartOpen(true);
  }, [addToast]);

  const updateQty = useCallback((id, size, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
    else setCart(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty } : i));
  }, []);

  const removeItem = useCallback((id, size) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
    addToast('Item removed from bag', 'success');
  }, [addToast]);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => {
      const isIn = prev.includes(id);
      addToast(isIn ? 'Removed from wishlist' : 'Added to wishlist ♥', isIn ? 'success' : 'success');
      return isIn ? prev.filter(w => w !== id) : [...prev, id];
    });
  }, [addToast]);

  return (
    <>
      <GlobalStyles />
      <CustomCursor />
      <AnimatePresence>
        {!loaded && <PageLoader onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Navbar
            cartCount={cart.reduce((s, i) => s + i.qty, 0)}
            wishlistCount={wishlist.length}
            onCartOpen={() => setCartOpen(true)}
            onSearchOpen={() => setSearchOpen(true)}
            onMobileMenuOpen={() => setMobileMenuOpen(true)}
          />
          <HeroSection onQuickView={setQuickViewProduct} />
          <MarqueeBar />
          <CategoriesGrid />
          <NewArrivalsSection onQuickView={setQuickViewProduct} onAddToCart={addToCart} onWishlist={toggleWishlist} wishlist={wishlist} />
          <BrandStorySection />
          <StatsSection />
          <VirtualTryOn onAddToCart={addToCart} />
          <BestsellerCarousel onQuickView={setQuickViewProduct} onAddToCart={addToCart} onWishlist={toggleWishlist} wishlist={wishlist} />
          <TestimonialsSection />
          <InstagramStrip />
          <NewsletterSection addToast={addToast} />
          <Footer />
        </motion.div>
      )}

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} onQuickView={setQuickViewProduct} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} removeItem={removeItem} addToast={addToast} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} onWishlist={toggleWishlist} wishlist={wishlist} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
