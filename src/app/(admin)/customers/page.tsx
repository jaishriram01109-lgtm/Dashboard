'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/lv/context';
import type { Customer } from '@/lib/lv/types';
import { Search, Download, UserPlus, Mail, Phone, MapPin, Star, Gift, ChevronUp, ChevronDown, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const TABS = [
  { key: 'all', label: 'All Customers' },
  { key: 'vip', label: 'VIP' },
  { key: 'regular', label: 'Regular' },
];

export default function CustomersPage() {
  const { state, logAction } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'totalSpent', dir: 'desc' });
  const [selected, setSelected] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const customers = useMemo(() => {
    let c = [...state.customers];
    if (tab !== 'all') c = c.filter(x => x.status === tab);
    if (search) {
      const q = search.toLowerCase();
      c = c.filter(x => x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q) || x.city.toLowerCase().includes(q));
    }
    c.sort((a, b) => {
      const av = (a as any)[sort.key];
      const bv = (b as any)[sort.key];
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return c;
  }, [state.customers, tab, search, sort]);

  const paginated = customers.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(customers.length / perPage);

  const SortIcon = ({ k }: { k: string }) => (
    sort.key === k ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} color="var(--text-muted)" />
  );

  const totalRevenue = state.customers.reduce((a, c) => a + c.totalSpent, 0);
  const vipCount = state.customers.filter(c => c.status === 'vip').length;
  const avgOrderValue = Math.round(totalRevenue / state.customers.reduce((a, c) => a + c.totalOrders, 0));

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{state.customers.length} total customers</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="lv-btn lv-btn-ghost"><Download size={15} /> Export Data</button>
          <button className="lv-btn lv-btn-gold"><UserPlus size={15} /> Add Customer</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'All time' },
          { label: 'VIP Customers', value: vipCount, sub: `${Math.round(vipCount / state.customers.length * 100)}% of total` },
          { label: 'Avg. Order Value', value: fmt(avgOrderValue), sub: 'Per order' },
          { label: 'Total Loyalty Points', value: state.customers.reduce((a, c) => a + c.loyaltyPoints, 0).toLocaleString(), sub: 'Points issued' }
        ].map(s => (
          <div key={s.label} className="lv-card-sm">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-admin)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="lv-input" style={{ paddingLeft: 36 }} placeholder="Search by name, email, city…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {/* Table */}
      <div className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="lv-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSort(s => ({ key: 'totalOrders', dir: s.key === 'totalOrders' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Orders <SortIcon k="totalOrders" /></th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSort(s => ({ key: 'totalSpent', dir: s.key === 'totalSpent' && s.dir === 'asc' ? 'desc' : 'asc' }))}>Total Spent <SortIcon k="totalSpent" /></th>
              <th>Status</th>
              <th>Loyalty Pts</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="lv-avatar">{c.name.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{c.totalOrders}</td>
                <td style={{ fontWeight: 600 }}>{fmt(c.totalSpent)}</td>
                <td><span className={`lv-badge badge-${c.status}`}>{c.status}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Gift size={13} color="var(--gold)" />
                    <span style={{ fontSize: 13 }}>{c.loyaltyPoints.toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.lastOrder}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm" title="Email"><Mail size={14} /></button>
                    <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing {Math.min((page - 1) * perPage + 1, customers.length)}–{Math.min(page * perPage, customers.length)} of {customers.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`lv-btn lv-btn-sm ${page === p ? 'lv-btn-gold' : 'lv-btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="lv-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <motion.div className="lv-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>Customer Profile</h2>
                <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '20px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="lv-avatar lv-avatar-lg" style={{ width: 64, height: 64, fontSize: 22 }}>{selected.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selected.name}</h3>
                    <span className={`lv-badge badge-${selected.status}`}>{selected.status}</span>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{selected.id} · Member since {selected.joinDate}</div>
                  </div>
                </div>
                <div className="grid-2" style={{ marginBottom: 24 }}>
                  {[
                    { label: 'Total Orders', value: selected.totalOrders, icon: '📦' },
                    { label: 'Total Spent', value: fmt(selected.totalSpent), icon: '💰' },
                    { label: 'Avg Order', value: fmt(Math.round(selected.totalSpent / selected.totalOrders)), icon: '📊' },
                    { label: 'Loyalty Points', value: selected.loyaltyPoints.toLocaleString(), icon: '⭐' },
                  ].map(s => (
                    <div key={s.label} className="lv-card-sm" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Info</h4>
                  {[
                    { icon: Mail, text: selected.email },
                    { icon: Phone, text: selected.phone },
                    { icon: MapPin, text: `${selected.city}, ${selected.state}` },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <item.icon size={16} color="var(--text-muted)" />
                      <span style={{ fontSize: 14 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order History</h4>
                  {state.orders.filter(o => o.email === selected.email).map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
                      <div>
                        <span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 13 }}>{o.id}</span>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{o.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{fmt(o.total)}</div>
                        <span className={`lv-badge badge-${o.status}`} style={{ fontSize: 11 }}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                  {state.orders.filter(o => o.email === selected.email).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No orders in this session</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
