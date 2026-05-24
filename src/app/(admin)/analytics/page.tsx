'use client';
import { useState } from 'react';
import { useApp } from '@/lib/lv/context';
import { REVENUE_DATA, CATEGORY_REVENUE, WEEKLY_REVENUE } from '@/lib/lv/data';
import { Download, TrendingUp, TrendingDown, Users, ShoppingBag } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');
const COLORS = ['#C9A84C', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? fmt(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState('sales');

  const totalRevenue = REVENUE_DATA.reduce((a, d) => a + d.revenue, 0);
  const totalOrders = REVENUE_DATA.reduce((a, d) => a + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);
  const conversionRate = 3.8;

  const funnelData = [
    { stage: 'Site Visits', count: 18420, color: '#C9A84C' },
    { stage: 'Product Views', count: 9210, color: '#3B82F6' },
    { stage: 'Add to Cart', count: 3684, color: '#22C55E' },
    { stage: 'Checkout', count: 1842, color: '#F59E0B' },
    { stage: 'Purchase', count: 699, color: '#8B5CF6' },
  ];

  const deviceData = [
    { name: 'Mobile', value: 62, color: '#C9A84C' },
    { name: 'Desktop', value: 28, color: '#3B82F6' },
    { name: 'Tablet', value: 10, color: '#22C55E' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">January 2025 · 30 day overview</p>
        </div>
        <button className="lv-btn lv-btn-ghost"><Download size={15} /> Export Report</button>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), change: '+23.4%', up: true, icon: TrendingUp },
          { label: 'Total Orders', value: totalOrders, change: '+18.2%', up: true, icon: ShoppingBag },
          { label: 'Avg. Order Value', value: fmt(avgOrderValue), change: '+4.7%', up: true, icon: TrendingUp },
          { label: 'Conversion Rate', value: conversionRate + '%', change: '+0.3%', up: true, icon: Users },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="kpi-card">
            <div className="flex-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k.label}</span>
              <div style={{ background: 'var(--gold-dim)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
                <k.icon size={16} color="var(--gold)" />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: k.up ? 'var(--success)' : 'var(--danger)' }}>
              {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {k.change} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'sales', label: 'Sales Overview' },
          { key: 'traffic', label: 'Traffic & Behavior' },
          { key: 'funnel', label: 'Conversion Funnel' },
          { key: 'customers', label: 'Customer Insights' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-admin)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Revenue Trend — January 2025</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'K'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#C9A84C" strokeWidth={2.5} fill="url(#rv)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Revenue by Category</h3>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={CATEGORY_REVENUE} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                      {CATEGORY_REVENUE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => v + '%'} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {CATEGORY_REVENUE.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{c.name}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Weekly Orders</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={WEEKLY_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v / 1000) + 'K'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      )}

      {tab === 'traffic' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Sessions', value: '18,420', change: '+14.2%' },
              { label: 'Unique Visitors', value: '12,847', change: '+11.8%' },
              { label: 'Bounce Rate', value: '42.3%', change: '-3.1%' },
            ].map(s => (
              <div key={s.label} className="lv-card-sm">
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>{s.change} vs last month</div>
              </div>
            ))}
          </div>
          <div className="grid-2">
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Device Breakdown</h3>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                      {deviceData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  {deviceData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: 14, flex: 1 }}>{d.name}</span>
                      <span style={{ fontWeight: 700 }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Top Traffic Sources</h3>
              {[
                { source: 'Organic Search', sessions: 5420, pct: 29 },
                { source: 'Direct', sessions: 4190, pct: 23 },
                { source: 'Instagram', sessions: 3680, pct: 20 },
                { source: 'Facebook Ads', sessions: 2760, pct: 15 },
                { source: 'Email', sessions: 1840, pct: 10 },
                { source: 'Other', sessions: 530, pct: 3 },
              ].map(s => (
                <div key={s.source} style={{ marginBottom: 14 }}>
                  <div className="flex-between" style={{ marginBottom: 4, fontSize: 13 }}>
                    <span>{s.source}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.sessions.toLocaleString()} ({s.pct}%)</span>
                  </div>
                  <div className="lv-progress">
                    <div className="lv-progress-fill" style={{ width: s.pct + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'funnel' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
          <h3 style={{ fontWeight: 600, marginBottom: 24 }}>Conversion Funnel</h3>
          {funnelData.map((stage, i) => (
            <div key={stage.stage} style={{ marginBottom: 20 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: stage.color + '20', border: '2px solid ' + stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: stage.color }}>
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: 500 }}>{stage.stage}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{stage.count.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {i > 0 ? Math.round(stage.count / funnelData[i-1].count * 100) + '% from prev' : '100%'}
                  </div>
                </div>
              </div>
              <div className="lv-progress" style={{ height: 10 }}>
                <div className="lv-progress-fill" style={{ width: (stage.count / funnelData[0].count * 100) + '%', background: stage.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Overall Conversion: </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{Math.round(funnelData[4].count / funnelData[0].count * 100 * 10) / 10}%</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>({funnelData[4].count.toLocaleString()} orders from {funnelData[0].count.toLocaleString()} visits)</span>
          </div>
        </motion.div>
      )}

      {tab === 'customers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid-2">
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Customer Acquisition</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={REVENUE_DATA.slice(-14).map((d, i) => ({ ...d, newCustomers: Math.floor(Math.random() * 20) + 5 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="#C9A84C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="lv-card">
              <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Customer Segments</h3>
              {[
                { label: 'VIP (₹50K+ spent)', count: state.customers.filter(c => c.totalSpent >= 50000).length, color: 'var(--gold)' },
                { label: 'Regular (₹10K–50K)', count: state.customers.filter(c => c.totalSpent >= 10000 && c.totalSpent < 50000).length, color: 'var(--info)' },
                { label: 'New (<₹10K)', count: state.customers.filter(c => c.totalSpent < 10000).length, color: 'var(--success)' },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div className="flex-between" style={{ marginBottom: 6, fontSize: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                      {s.label}
                    </span>
                    <span style={{ fontWeight: 600, color: s.color }}>{s.count}</span>
                  </div>
                  <div className="lv-progress">
                    <div className="lv-progress-fill" style={{ width: (s.count / state.customers.length * 100) + '%', background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
