'use client';
import { useState } from 'react';
import { Sliders, Type, Layout, Layers, Code, Monitor, Smartphone, Tablet, Save, Eye, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'customizer', label: 'Live Customizer', icon: Sliders },
  { key: 'colors', label: 'Colors & Fonts', icon: Type },
  { key: 'layout', label: 'Layout & Sections', icon: Layout },
  { key: 'header', label: 'Header & Footer', icon: Layers },
  { key: 'code', label: 'Custom Code', icon: Code },
];

const PRESETS = [
  { name: 'Royal Gold', primary: '#C9A84C', secondary: '#0A0A0A', accent: '#E8C96A' },
  { name: 'Pearl White', primary: '#F0F0F0', secondary: '#1A1A1A', accent: '#C9A84C' },
  { name: 'Deep Crimson', primary: '#DC143C', secondary: '#0A0A0A', accent: '#C9A84C' },
  { name: 'Emerald Green', primary: '#10B981', secondary: '#0A0A0A', accent: '#C9A84C' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#0A0A0A', accent: '#C9A84C' },
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#0A0A0A', accent: '#C9A84C' },
];

export default function ThemePage() {
  const [tab, setTab] = useState('customizer');
  const [preview, setPreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [colors, setColors] = useState({ primary: '#C9A84C', bg: '#0A0A0A', text: '#F0F0F0', accent: '#E8C96A' });
  const [fonts, setFonts] = useState({ heading: 'Cinzel', body: 'Inter' });
  const [customCSS, setCustomCSS] = useState('/* Add your custom CSS here */\n\n.storefront-banner {\n  background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);\n}\n\n.product-card:hover {\n  transform: translateY(-4px);\n}');
  const [customJS, setCustomJS] = useState('// Custom JavaScript\n// Runs on every page of the storefront\n\nconsole.log("LussoVogue loaded");');
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [published, setPublished] = useState(false);

  const previewWidth = preview === 'desktop' ? '100%' : preview === 'tablet' ? 768 : 375;

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">Theme Editor</h1>
            <span style={{ background: 'var(--gold)', color: '#0A0A0A', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.08em' }}>PREMIUM</span>
          </div>
          <p className="page-subtitle">Customize your storefront's look and feel</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="lv-btn lv-btn-ghost"><Eye size={15} /> Preview Store</button>
          <button className="lv-btn lv-btn-gold" onClick={() => setShowPublishConfirm(true)}><Save size={15} /> Publish Theme</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-admin)', whiteSpace: 'nowrap' }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'customizer' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Device Toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center' }}>
            {[
              { key: 'desktop', icon: Monitor },
              { key: 'tablet', icon: Tablet },
              { key: 'mobile', icon: Smartphone },
            ].map(d => (
              <button key={d.key} onClick={() => setPreview(d.key as any)}
                className={`lv-btn lv-btn-sm ${preview === d.key ? 'lv-btn-gold' : 'lv-btn-ghost'}`}>
                <d.icon size={15} /> {d.key.charAt(0).toUpperCase() + d.key.slice(1)}
              </button>
            ))}
          </div>

          {/* Preview Frame */}
          <div style={{ overflow: 'auto', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
            <div style={{ maxWidth: typeof previewWidth === 'number' ? previewWidth : '100%', margin: '0 auto', background: colors.bg, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {/* Mock Storefront Header */}
              <div style={{ background: colors.bg, padding: '16px 24px', borderBottom: `1px solid ${colors.primary}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cinzel, serif', color: colors.primary, fontSize: 18, letterSpacing: '0.12em' }}>LUSSOVOGUE</span>
                <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                  {['Home', 'Collections', 'About', 'Contact'].map(l => (
                    <span key={l} style={{ color: colors.text, cursor: 'pointer' }}>{l}</span>
                  ))}
                </div>
              </div>
              {/* Hero */}
              <div style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.primary}20 100%)`, padding: '60px 40px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Cinzel, serif', color: colors.primary, fontSize: 32, marginBottom: 16, letterSpacing: '0.1em' }}>
                  LUXURY REDEFINED
                </h2>
                <p style={{ color: colors.text, opacity: 0.7, maxWidth: 400, margin: '0 auto 24px', fontSize: 15 }}>
                  Exquisite Indian fashion for the modern connoisseur
                </p>
                <button style={{ background: colors.primary, color: colors.bg, padding: '12px 32px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  EXPLORE COLLECTION
                </button>
              </div>
              {/* Products Grid */}
              <div style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {['Obsidian Blazer', 'Gold Lehenga', 'Silk Saree'].map(p => (
                  <div key={p} style={{ background: `${colors.primary}10`, borderRadius: 8, padding: 16, textAlign: 'center' }}>
                    <div style={{ height: 80, background: `${colors.primary}20`, borderRadius: 6, marginBottom: 12 }} />
                    <div style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>{p}</div>
                    <div style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>₹12,999</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'colors' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid-2" style={{ gap: 24 }}>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Color Palette</h3>
              {[
                { label: 'Primary / Brand Color', key: 'primary', desc: 'Used for buttons, accents, links' },
                { label: 'Background', key: 'bg', desc: 'Page and section backgrounds' },
                { label: 'Text Color', key: 'text', desc: 'Body text color' },
                { label: 'Accent', key: 'accent', desc: 'Hover states and highlights' },
              ].map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="color" value={(colors as any)[c.key]} onChange={e => setColors(p => ({ ...p, [c.key]: e.target.value }))}
                      style={{ width: 44, height: 44, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: 2 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{(colors as any)[c.key]}</div>
                </div>
              ))}
            </div>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Color Presets</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {PRESETS.map(p => (
                  <button key={p.name} onClick={() => setColors(prev => ({ ...prev, primary: p.primary, bg: p.secondary, accent: p.accent }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface-2)', border: `1px solid ${colors.primary === p.primary ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--t)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.primary, border: `2px solid ${p.secondary}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Typography</h4>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Heading Font</label>
                    <select className="lv-select" value={fonts.heading} onChange={e => setFonts(p => ({ ...p, heading: e.target.value }))}>
                      {['Cinzel', 'Playfair Display', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lv-label">Body Font</label>
                    <select className="lv-select" value={fonts.body} onChange={e => setFonts(p => ({ ...p, body: e.target.value }))}>
                      {['Inter', 'Lato', 'Montserrat', 'Open Sans', 'Poppins'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'layout' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Page Sections</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Drag to reorder, toggle to show/hide sections on your storefront.</p>
          {[
            { name: 'Hero Banner', active: true, type: 'fullwidth' },
            { name: 'Featured Collection', active: true, type: 'grid' },
            { name: 'Bestsellers', active: true, type: 'carousel' },
            { name: 'Brand Story', active: false, type: 'split' },
            { name: 'Customer Reviews', active: true, type: 'carousel' },
            { name: 'Instagram Feed', active: false, type: 'grid' },
            { name: 'Newsletter Signup', active: true, type: 'banner' },
          ].map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'move' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 16, cursor: 'grab' }}>⠿</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{s.type} layout</div>
              </div>
              <label className="lv-toggle">
                <input type="checkbox" defaultChecked={s.active} />
                <span className="lv-toggle-slider" />
              </label>
              <button className="lv-btn lv-btn-ghost lv-btn-sm"><Sliders size={13} /> Settings</button>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'header' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Header Settings</h3>
              {[
                { label: 'Show Search Bar', enabled: true },
                { label: 'Show Wishlist Icon', enabled: true },
                { label: 'Show Cart Icon', enabled: true },
                { label: 'Sticky Header', enabled: true },
                { label: 'Show Announcement Bar', enabled: false },
              ].map(s => (
                <div key={s.label} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14 }}>{s.label}</span>
                  <label className="lv-toggle"><input type="checkbox" defaultChecked={s.enabled} /><span className="lv-toggle-slider" /></label>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <label className="lv-label">Announcement Bar Text</label>
                <input className="lv-input" defaultValue="🎉 Free shipping on orders above ₹999 | Use code WELCOME500" />
              </div>
            </div>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Footer Settings</h3>
              {[
                { label: 'Show Social Links', enabled: true },
                { label: 'Show Payment Icons', enabled: true },
                { label: 'Show Newsletter Form', enabled: true },
              ].map(s => (
                <div key={s.label} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14 }}>{s.label}</span>
                  <label className="lv-toggle"><input type="checkbox" defaultChecked={s.enabled} /><span className="lv-toggle-slider" /></label>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <label className="lv-label">Footer Copyright Text</label>
                <input className="lv-input" defaultValue="© 2025 LussoVogue. All rights reserved." />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="lv-label">Social Links</label>
                {['Instagram', 'Facebook', 'Pinterest', 'WhatsApp'].map(s => (
                  <input key={s} className="lv-input" placeholder={`${s} URL`} style={{ marginBottom: 8 }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'code' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: 'var(--warning)', flex: 1 }}>
              ⚠️ Custom code is injected directly into your storefront. Test in staging before publishing.
            </div>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Custom CSS</h3>
              <textarea
                value={customCSS}
                onChange={e => setCustomCSS(e.target.value)}
                style={{ width: '100%', height: 300, background: '#0D1117', color: '#C9A84C', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              />
            </div>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Custom JavaScript</h3>
              <textarea
                value={customJS}
                onChange={e => setCustomJS(e.target.value)}
                style={{ width: '100%', height: 300, background: '#0D1117', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Publish Confirm Modal */}
      {showPublishConfirm && (
        <motion.div className="lv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="lv-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 440 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Publish Theme?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>This will update your live storefront. Confirm your password to proceed.</p>
            <input className="lv-input" type="password" placeholder="Enter your password" style={{ marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowPublishConfirm(false)}>Cancel</button>
              <button className="lv-btn lv-btn-gold" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setPublished(true); setShowPublishConfirm(false); }}>
                Publish Live
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {published && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 999 }}>
          <Check size={16} color="var(--success)" />
          <span style={{ color: 'var(--success)', fontWeight: 500 }}>Theme published successfully!</span>
        </motion.div>
      )}
    </div>
  );
}
