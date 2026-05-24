'use client';
import { useState } from 'react';
import { DISCOUNT_CODES } from '@/lib/lv/data';
import type { DiscountCode } from '@/lib/lv/types';
import { Plus, Tag, Mail, Search, Link2, Megaphone, Edit2, Trash2, Copy, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { key: 'discounts', label: 'Discount Codes', icon: Tag },
  { key: 'email', label: 'Email Campaigns', icon: Mail },
  { key: 'seo', label: 'SEO Manager', icon: Search },
  { key: 'referral', label: 'Referral Program', icon: Link2 },
  { key: 'popups', label: 'Pop-up Manager', icon: Megaphone },
];

export default function MarketingPage() {
  const [tab, setTab] = useState('discounts');
  const [codes, setCodes] = useState<DiscountCode[]>(DISCOUNT_CODES);
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({ code: '', type: 'percentage', value: 0, minOrder: 0, usageLimit: 100, expiry: '' });

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreate = () => {
    const c: DiscountCode = { id: 'D' + Date.now(), ...newCode, type: newCode.type as any, usageCount: 0, status: 'active' };
    setCodes(p => [c, ...p]);
    setShowNew(false);
    setNewCode({ code: '', type: 'percentage', value: 0, minOrder: 0, usageLimit: 100, expiry: '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Marketing</h1>
          <p className="page-subtitle">Campaigns, discounts & promotions</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-admin)', whiteSpace: 'nowrap' }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'discounts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Active Codes', value: codes.filter(c => c.status === 'active').length, color: 'var(--success)' },
                { label: 'Total Uses', value: codes.reduce((a, c) => a + c.usageCount, 0), color: 'var(--gold)' },
                { label: 'Expired', value: codes.filter(c => c.status === 'expired').length, color: 'var(--text-muted)' },
              ].map(s => (
                <div key={s.label} className="lv-card-sm" style={{ minWidth: 120, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button className="lv-btn lv-btn-gold" onClick={() => setShowNew(true)}><Plus size={15} /> Create Code</button>
          </div>

          <div className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="lv-table">
              <thead>
                <tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace', fontSize: 14 }}>{c.code}</span>
                        <button className="lv-btn lv-btn-ghost lv-btn-icon" style={{ padding: 4 }} onClick={() => handleCopy(c.code)}>
                          {copied === c.code ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td><span className="lv-badge badge-regular">{c.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.type === 'percentage' ? c.value + '%' : '₹' + c.value}</td>
                    <td>₹{c.minOrder.toLocaleString()}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{c.usageCount}/{c.usageLimit}</div>
                      <div className="lv-progress" style={{ marginTop: 4 }}>
                        <div className="lv-progress-fill" style={{ width: Math.min(c.usageCount / c.usageLimit * 100, 100) + '%' }} />
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.expiry}</td>
                    <td><span className={`lv-badge badge-${c.status === 'active' ? 'active' : 'inactive'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm"><Edit2 size={13} /></button>
                        <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm" onClick={() => setCodes(p => p.filter(x => x.id !== c.id))}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'email' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Campaigns Sent', value: '12', sub: 'This month' },
              { label: 'Avg Open Rate', value: '34.2%', sub: 'Industry avg: 21%' },
              { label: 'Avg CTR', value: '6.8%', sub: 'Industry avg: 3.4%' },
            ].map(s => (
              <div key={s.label} className="lv-card-sm">
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="lv-card">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Recent Campaigns</h3>
            {[
              { name: 'January Sale Announcement', sent: 2847, opens: 982, clicks: 234, date: '2025-01-15', status: 'sent' },
              { name: 'New Collection Launch — Winter', sent: 2847, opens: 1134, clicks: 312, date: '2025-01-08', status: 'sent' },
              { name: 'VIP Early Access — Lehenga', sent: 892, opens: 487, clicks: 189, date: '2025-01-03', status: 'sent' },
              { name: 'Republic Day Sale — 26 Jan', sent: 2847, opens: 0, clicks: 0, date: '2025-01-24', status: 'scheduled' },
            ].map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.date} · {c.sent.toLocaleString()} recipients</div>
                </div>
                {c.status === 'sent' ? (
                  <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                    <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Opens</div><div style={{ fontWeight: 600 }}>{Math.round(c.opens/c.sent*100)}%</div></div>
                    <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Clicks</div><div style={{ fontWeight: 600 }}>{Math.round(c.clicks/c.sent*100)}%</div></div>
                  </div>
                ) : null}
                <span className={`lv-badge badge-${c.status === 'sent' ? 'delivered' : 'processing'}`}>{c.status}</span>
              </div>
            ))}
            <button className="lv-btn lv-btn-gold" style={{ marginTop: 16 }}><Plus size={15} /> Create Campaign</button>
          </div>
        </motion.div>
      )}

      {tab === 'seo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lv-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Store SEO Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="lv-label">Store Title (60 chars)</label>
                <input className="lv-input" defaultValue="LussoVogue — Luxury Indian Clothing | Designer Wear Online" />
              </div>
              <div>
                <label className="lv-label">Meta Description (160 chars)</label>
                <textarea className="lv-textarea" rows={3} defaultValue="Discover premium luxury Indian clothing at LussoVogue. Shop designer lehengas, sarees, sherwanis and more. Free shipping above ₹999." />
              </div>
              <div>
                <label className="lv-label">Target Keywords</label>
                <input className="lv-input" defaultValue="luxury indian clothing, designer lehenga, premium saree, sherwani, indian fashion" />
              </div>
              <div>
                <label className="lv-label">Google Analytics ID</label>
                <input className="lv-input" defaultValue="G-XXXXXXXXXX" placeholder="G-XXXXXXXXXX" />
              </div>
              <button className="lv-btn lv-btn-gold" style={{ alignSelf: 'flex-start' }}>Save SEO Settings</button>
            </div>
          </div>
          <div className="lv-card">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>SEO Health Check</h3>
            {[
              { item: 'Meta title set', status: true },
              { item: 'Meta description set', status: true },
              { item: 'Sitemap generated', status: true },
              { item: 'Schema markup active', status: true },
              { item: 'Canonical URLs configured', status: false },
              { item: 'Image alt texts complete', status: false },
            ].map(s => (
              <div key={s.item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: s.status ? 'var(--success-bg)' : 'var(--danger-bg)', border: `2px solid ${s.status ? 'var(--success)' : 'var(--danger)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.status ? <Check size={11} color="var(--success)" /> : <X size={11} color="var(--danger)" />}
                </div>
                <span style={{ fontSize: 14 }}>{s.item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'referral' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lv-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Referral Program Settings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Reward customers for referring new buyers to LussoVogue.</p>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div>
                <label className="lv-label">Referrer Reward</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="lv-input" type="number" defaultValue={500} />
                  <select className="lv-select" style={{ width: 120 }}><option>₹ Fixed</option><option>% Discount</option></select>
                </div>
              </div>
              <div>
                <label className="lv-label">New Customer Discount</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="lv-input" type="number" defaultValue={10} />
                  <select className="lv-select" style={{ width: 120 }}><option>% Discount</option><option>₹ Fixed</option></select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="lv-toggle"><input type="checkbox" defaultChecked /><span className="lv-toggle-slider"></span></label>
              <span style={{ fontSize: 14 }}>Program active</span>
            </div>
          </div>
          <div className="grid-3">
            {[
              { label: 'Total Referrals', value: '234' },
              { label: 'Rewards Issued', value: '₹1,17,000' },
              { label: 'Revenue from Referrals', value: '₹8,34,200' },
            ].map(s => (
              <div key={s.label} className="kpi-card">
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'popups' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lv-card">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600 }}>Pop-up Manager</h3>
              <button className="lv-btn lv-btn-gold lv-btn-sm"><Plus size={14} /> New Pop-up</button>
            </div>
            {[
              { name: 'Welcome Discount Pop-up', trigger: 'On entry', discount: '10% off', status: true },
              { name: 'Exit Intent Offer', trigger: 'Exit intent', discount: '₹500 off', status: true },
              { name: 'Cart Abandonment', trigger: '5 min idle', discount: 'Free shipping', status: false },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Trigger: {p.trigger} · Offer: {p.discount}</div>
                </div>
                <label className="lv-toggle">
                  <input type="checkbox" defaultChecked={p.status} />
                  <span className="lv-toggle-slider" />
                </label>
                <button className="lv-btn lv-btn-ghost lv-btn-sm"><Edit2 size={13} /> Edit</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Discount Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div className="lv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="lv-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <div className="flex-between" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Create Discount Code</h3>
                <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => setShowNew(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="lv-label">Discount Code</label>
                  <input className="lv-input" placeholder="e.g. SAVE20" value={newCode.code} onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Type</label>
                    <select className="lv-select" value={newCode.type} onChange={e => setNewCode(p => ({ ...p, type: e.target.value }))}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="lv-label">Value</label>
                    <input className="lv-input" type="number" value={newCode.value} onChange={e => setNewCode(p => ({ ...p, value: Number(e.target.value) }))} placeholder={newCode.type === 'percentage' ? '20 (%)' : '500 (₹)'} />
                  </div>
                </div>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Min Order (₹)</label>
                    <input className="lv-input" type="number" value={newCode.minOrder} onChange={e => setNewCode(p => ({ ...p, minOrder: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="lv-label">Usage Limit</label>
                    <input className="lv-input" type="number" value={newCode.usageLimit} onChange={e => setNewCode(p => ({ ...p, usageLimit: Number(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className="lv-label">Expiry Date</label>
                  <input className="lv-input" type="date" value={newCode.expiry} onChange={e => setNewCode(p => ({ ...p, expiry: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowNew(false)}>Cancel</button>
                <button className="lv-btn lv-btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handleCreate}>Create Code</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
