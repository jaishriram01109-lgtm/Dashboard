'use client';
import { useState } from 'react';
import { useApp } from '@/lib/lv/context';
import { Store, Users, Bell, Shield, Puzzle, Database, Key, Eye, EyeOff, Plus, Trash2, Copy, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'store', label: 'Store Details', icon: Store },
  { key: 'team', label: 'Team & Permissions', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security & Sessions', icon: Shield },
  { key: 'integrations', label: 'Integrations', icon: Puzzle },
  { key: 'data', label: 'Data & Backups', icon: Database },
  { key: 'api', label: 'API Keys', icon: Key },
];

const TEAM_MEMBERS = [
  { name: 'Ankit Singh', email: 'admin@lussovogue.com', role: 'super_admin', status: 'active', lastLogin: '2025-01-18 14:32' },
  { name: 'Store Manager', email: 'manager@lussovogue.com', role: 'store_manager', status: 'active', lastLogin: '2025-01-17 09:15' },
  { name: 'Inventory Staff', email: 'inventory@lussovogue.com', role: 'inventory_manager', status: 'inactive', lastLogin: '2025-01-10 11:00' },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'var(--gold)',
  store_manager: 'var(--info)',
  inventory_manager: 'var(--success)',
  support_agent: '#8B5CF6',
  analyst: 'var(--warning)',
};

export default function SettingsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState('store');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const API_KEY = 'lv_live_sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(API_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your store and admin panel</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left Nav */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`nav-item ${tab === t.key ? 'active' : ''}`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === 'store' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 24 }}>Store Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Store Name</label>
                    <input className="lv-input" defaultValue="LussoVogue" />
                  </div>
                  <div>
                    <label className="lv-label">Store Domain</label>
                    <input className="lv-input" defaultValue="lussovogue.com" />
                  </div>
                </div>
                <div>
                  <label className="lv-label">Store Description</label>
                  <textarea className="lv-textarea" rows={3} defaultValue="Luxury Indian clothing brand offering premium fashion for the modern connoisseur." />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Business Email</label>
                    <input className="lv-input" defaultValue="hello@lussovogue.com" type="email" />
                  </div>
                  <div>
                    <label className="lv-label">Support Phone</label>
                    <input className="lv-input" defaultValue="+91 80000 80000" />
                  </div>
                </div>
                <div>
                  <label className="lv-label">Registered Address</label>
                  <textarea className="lv-textarea" rows={2} defaultValue="LussoVogue Pvt Ltd, 42 Fashion Street, Bandra West, Mumbai - 400050, Maharashtra" />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="lv-label">Currency</label>
                    <select className="lv-select"><option>INR (₹)</option></select>
                  </div>
                  <div>
                    <label className="lv-label">Timezone</label>
                    <select className="lv-select"><option>Asia/Kolkata (IST)</option></select>
                  </div>
                </div>
                <button className="lv-btn lv-btn-gold" style={{ alignSelf: 'flex-start' }}>Save Store Details</button>
              </div>
            </motion.div>
          )}

          {tab === 'team' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600 }}>Team Members</h3>
                <button className="lv-btn lv-btn-gold lv-btn-sm"><Plus size={14} /> Invite Member</button>
              </div>
              <div className="lv-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                <table className="lv-table">
                  <thead>
                    <tr><th>Member</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map(m => (
                      <tr key={m.email}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="lv-avatar" style={{ background: ROLE_COLORS[m.role], fontSize: 12 }}>
                              {m.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: ROLE_COLORS[m.role], background: ROLE_COLORS[m.role] + '20', padding: '3px 10px', borderRadius: 99, textTransform: 'capitalize' }}>
                            {m.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td><span className={`lv-badge badge-${m.status}`}>{m.status}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.lastLogin}</td>
                        <td>
                          <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm" disabled={m.role === 'super_admin'}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lv-card">
                <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Role Permissions Matrix</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="lv-table">
                    <thead>
                      <tr>
                        <th>Module</th>
                        {['Super Admin', 'Store Manager', 'Inventory', 'Support', 'Analyst'].map(r => <th key={r}>{r}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { mod: 'Dashboard', perms: [true, true, true, true, true] },
                        { mod: 'Orders', perms: [true, true, false, true, false] },
                        { mod: 'Products', perms: [true, true, true, false, false] },
                        { mod: 'Customers', perms: [true, true, false, true, false] },
                        { mod: 'Theme Editor', perms: [true, false, false, false, false] },
                        { mod: 'Payments', perms: [true, false, false, false, false] },
                        { mod: 'Analytics', perms: [true, true, false, false, true] },
                        { mod: 'Settings', perms: [true, false, false, false, false] },
                      ].map(row => (
                        <tr key={row.mod}>
                          <td>{row.mod}</td>
                          {row.perms.map((p, i) => (
                            <td key={i}>
                              {p ? <Check size={14} color="var(--success)" /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 24 }}>Notification Preferences</h3>
              {[
                { category: 'Orders', items: [
                  { label: 'New order placed', email: true, push: true, sms: false },
                  { label: 'Order delivered', email: true, push: false, sms: false },
                  { label: 'Order cancelled', email: true, push: true, sms: true },
                ]},
                { category: 'Inventory', items: [
                  { label: 'Low stock alert', email: true, push: true, sms: false },
                  { label: 'Out of stock', email: true, push: true, sms: true },
                ]},
                { category: 'Payments', items: [
                  { label: 'Payment failed', email: true, push: true, sms: false },
                  { label: 'Refund processed', email: true, push: false, sms: false },
                ]},
                { category: 'Security', items: [
                  { label: 'New login detected', email: true, push: true, sms: true },
                  { label: 'Failed login attempts', email: true, push: false, sms: false },
                ]},
              ].map(cat => (
                <div key={cat.category} style={{ marginBottom: 24 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{cat.category}</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>Event</th>
                          {['Email', 'Push', 'SMS'].map(c => (
                            <th key={c} style={{ textAlign: 'center', padding: '8px 16px', color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.map(item => (
                          <tr key={item.label} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 0' }}>{item.label}</td>
                            {[item.email, item.push, item.sms].map((v, i) => (
                              <td key={i} style={{ textAlign: 'center', padding: '10px 16px' }}>
                                <label className="lv-toggle" style={{ display: 'inline-flex' }}>
                                  <input type="checkbox" defaultChecked={v} />
                                  <span className="lv-toggle-slider" />
                                </label>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="lv-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Session Configuration</h3>
                {[
                  { label: 'Session Timeout', value: '30 minutes', desc: 'Auto-logout after inactivity' },
                  { label: 'Warning Before Logout', value: '5 minutes', desc: 'Show warning popup' },
                  { label: 'Max Login Attempts', value: '5', desc: 'Before account lockout' },
                  { label: 'Lockout Duration', value: '15 minutes', desc: 'After failed attempts' },
                ].map(s => (
                  <div key={s.label} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="lv-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Two-Factor Authentication</h3>
                <div className="flex-between" style={{ marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>2FA Status</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Using Google Authenticator or compatible TOTP app</p>
                  </div>
                  <span className={`lv-badge badge-${state.user?.twoFAEnabled ? 'active' : 'inactive'}`}>
                    {state.user?.twoFAEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {/* Mock QR Code */}
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '20px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 120, height: 120, background: '#fff', padding: 8, borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1 }}>
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} style={{ background: Math.random() > 0.5 ? '#000' : '#fff', borderRadius: 1 }} />
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>Scan with your authenticator app</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Secret key: <code style={{ background: 'var(--bg-surface-3)', padding: '2px 6px', borderRadius: 4 }}>LUSSOVOGUE2FA</code></p>
                    <p style={{ fontSize: 12, color: 'var(--warning)' }}>Demo: use code 123456</p>
                  </div>
                </div>
              </div>
              <div className="lv-card">
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Active Sessions</h3>
                {[
                  { device: 'Chrome on Windows', ip: '103.21.XX.XX', location: 'Mumbai, IN', current: true, time: 'Now' },
                  { device: 'Safari on iPhone', ip: '103.22.XX.XX', location: 'Mumbai, IN', current: false, time: '2 hrs ago' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, marginBottom: 4 }}>
                        {s.device}
                        {s.current && <span className="lv-badge badge-active" style={{ fontSize: 10 }}>Current</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.ip} · {s.location} · {s.time}</div>
                    </div>
                    {!s.current && <button className="lv-btn lv-btn-danger lv-btn-sm">Revoke</button>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'integrations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {[
                  { name: 'Google Analytics 4', logo: '📊', connected: true, desc: 'Track store traffic and conversions' },
                  { name: 'Meta Pixel', logo: '📘', connected: true, desc: 'Facebook & Instagram ads tracking' },
                  { name: 'WhatsApp Business', logo: '💬', connected: false, desc: 'Order notifications via WhatsApp' },
                  { name: 'Mailchimp', logo: '🐒', connected: false, desc: 'Email marketing automation' },
                  { name: 'Shiprocket', logo: '🚀', connected: true, desc: 'Multi-courier shipping aggregator' },
                  { name: 'Gupshup SMS', logo: '📱', connected: false, desc: 'SMS order notifications' },
                ].map(int => (
                  <div key={int.name} className="lv-card">
                    <div className="flex-between" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{int.logo}</span>
                        <div>
                          <h4 style={{ fontWeight: 600, fontSize: 14 }}>{int.name}</h4>
                          <span className={`lv-badge badge-${int.connected ? 'active' : 'inactive'}`} style={{ fontSize: 10 }}>{int.connected ? 'Connected' : 'Not Connected'}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{int.desc}</p>
                    <button className={`lv-btn lv-btn-sm ${int.connected ? 'lv-btn-ghost' : 'lv-btn-gold'}`} style={{ width: '100%', justifyContent: 'center' }}>
                      {int.connected ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'data' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="lv-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Backup & Restore</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Last Backup</div>
                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>Today, 03:00 AM</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automatic daily backup</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--info-bg)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Storage Used</div>
                    <div style={{ fontWeight: 600, color: 'var(--info)' }}>1.2 GB / 10 GB</div>
                    <div className="lv-progress" style={{ marginTop: 8 }}><div className="lv-progress-fill" style={{ width: '12%', background: 'var(--info)' }} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="lv-btn lv-btn-gold"><Database size={15} /> Backup Now</button>
                  <button className="lv-btn lv-btn-ghost"><RefreshCw size={15} /> Restore Backup</button>
                </div>
              </div>
              <div className="lv-card">
                <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Data Export</h3>
                {[
                  { label: 'Export All Orders', desc: 'CSV with all order details', size: '~2.4 MB' },
                  { label: 'Export Customer Data', desc: 'CSV with customer details and purchase history', size: '~890 KB' },
                  { label: 'Export Product Catalog', desc: 'CSV with all product data', size: '~340 KB' },
                  { label: 'Full Data Export', desc: 'ZIP with all store data', size: '~8.2 MB' },
                ].map(e => (
                  <div key={e.label} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{e.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{e.desc} · {e.size}</div>
                    </div>
                    <button className="lv-btn lv-btn-ghost lv-btn-sm">Export</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'api' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>API Keys</h3>
              <p style={{ color: 'var(--warning)', fontSize: 13, marginBottom: 24 }}>⚠️ Keep your API keys secret. Never share them publicly or commit to version control.</p>

              <div style={{ marginBottom: 24 }}>
                <label className="lv-label">Live API Key</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input className="lv-input" type={showKey ? 'text' : 'password'} value={API_KEY} readOnly style={{ fontFamily: 'monospace', fontSize: 13, paddingRight: 44 }} />
                    <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <button className="lv-btn lv-btn-ghost" onClick={handleCopyKey}>
                    {copiedKey ? <><Check size={14} color="var(--success)" /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button className="lv-btn lv-btn-ghost"><RefreshCw size={14} /> Rotate</button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Webhook Endpoints</h4>
                {[
                  { event: 'order.created', url: 'https://your-app.com/webhook/orders', status: 'active' },
                  { event: 'payment.success', url: 'https://your-app.com/webhook/payments', status: 'active' },
                ].map(w => (
                  <div key={w.event} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <code style={{ background: 'var(--bg-surface-3)', padding: '3px 8px', borderRadius: 4, fontSize: 12 }}>{w.event}</code>
                    <span style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</span>
                    <span className="lv-badge badge-active" style={{ fontSize: 10 }}>{w.status}</span>
                    <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button className="lv-btn lv-btn-ghost lv-btn-sm" style={{ marginTop: 12 }}><Plus size={13} /> Add Webhook</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
