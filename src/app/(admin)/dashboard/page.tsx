'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/lv/context';
import { REVENUE_DATA, TOP_PRODUCTS_WEEK } from '@/lib/lv/data';
import { TrendingUp, TrendingDown, ShoppingBag, Users, BarChart3, IndianRupee, Package, Plus, Percent, UserPlus, FileDown, Mail, AlertTriangle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</p>
      <p style={{ color: 'var(--gold)', fontSize: 14 }}>Revenue: {fmt(payload[0]?.value)}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Orders: {payload[1]?.value}</p>
    </div>
  );
};

export default function DashboardPage() {
  const { state } = useApp();
  const [chartRange, setChartRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [liveVisitors, setLiveVisitors] = useState(47);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveVisitors(prev => Math.max(20, prev + Math.floor(Math.random() * 7) - 3));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const today = REVENUE_DATA[REVENUE_DATA.length - 1];
  const yesterday = REVENUE_DATA[REVENUE_DATA.length - 2];
  const revChange = (((today.revenue - yesterday.revenue) / yesterday.revenue) * 100).toFixed(1);
  const ordChange = today.orders - yesterday.orders;

  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  const processingOrders = state.orders.filter(o => o.status === 'processing').length;
  const lowStock = state.products.filter(p => p.stock <= (p.lowStockThreshold || 5));
  const recentOrders = [...state.orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const chartData = chartRange === 'daily'
    ? REVENUE_DATA.slice(-14)
    : chartRange === 'weekly'
    ? REVENUE_DATA.filter((_, i) => i % 7 === 6).slice(-8)
    : REVENUE_DATA.slice(-30);

  const kpis = [
    {
      label: "Today's Revenue", value: fmt(today.revenue), icon: IndianRupee,
      change: `${revChange}% vs yesterday`, up: Number(revChange) >= 0,
      sub: `${today.orders} orders`
    },
    {
      label: "Orders Today", value: today.orders.toString(), icon: ShoppingBag,
      change: `${ordChange >= 0 ? '+' : ''}${ordChange} vs yesterday`, up: ordChange >= 0,
      sub: `${pendingOrders} pending, ${processingOrders} processing`
    },
    {
      label: "Active Customers", value: "2,847", icon: Users,
      change: "+127 this week", up: true,
      sub: "Total: " + state.customers.length
    },
    {
      label: "Conversion Rate", value: "3.8%", icon: BarChart3,
      change: "Same as last week", up: null,
      sub: "Avg order: " + fmt(Math.round(state.orders.reduce((a, o) => a + o.total, 0) / state.orders.length))
    }
  ];

  const statusColor: Record<string, string> = {
    delivered: 'var(--success)', shipped: 'var(--info)',
    processing: '#fb923c', pending: 'var(--warning)',
    returned: 'var(--danger)', cancelled: 'var(--text-muted)'
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {state.user?.name}. Here's what's happening today.
            <span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              <span style={{ color: 'var(--success)', fontSize: 13 }}>{liveVisitors} visitors right now</span>
            </span>
          </p>
        </div>
        <Link href="/orders">
          <button className="lv-btn lv-btn-gold">
            <ShoppingBag size={16} /> View Orders
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="kpi-card">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{kpi.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} color="var(--gold)" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {kpi.up === true && <TrendingUp size={14} color="var(--success)" />}
              {kpi.up === false && <TrendingDown size={14} color="var(--danger)" />}
              <span style={{ fontSize: 12, color: kpi.up === true ? 'var(--success)' : kpi.up === false ? 'var(--danger)' : 'var(--text-muted)' }}>
                {kpi.change}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="lv-card" style={{ marginBottom: 28 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 style={{ fontWeight: 600 }}>Revenue Overview</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Daily target: ₹2,00,000</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['daily', 'weekly', 'monthly'] as const).map(r => (
              <button key={r} onClick={() => setChartRange(r)}
                className={`lv-btn lv-btn-sm ${chartRange === r ? 'lv-btn-gold' : 'lv-btn-ghost'}`}
                style={{ textTransform: 'capitalize' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : (v / 1000).toFixed(0) + 'K')} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={200000} stroke="var(--gold)" strokeDasharray="6 3" strokeOpacity={0.5} label={{ value: 'Target', fill: 'var(--gold)', fontSize: 11 }} />
            <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} fill="url(#goldGrad)" />
            <Area type="monotone" dataKey="orders" stroke="var(--info)" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="lv-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600 }}>Recent Orders</h3>
            <Link href="/orders"><span style={{ color: 'var(--gold)', fontSize: 13, cursor: 'pointer' }}>View All →</span></Link>
          </div>
          <table className="lv-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontWeight: 500, color: 'var(--gold)', fontSize: 13 }}>{o.id}</span></td>
                  <td>{o.customer}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(o.total)}</td>
                  <td><span className={`lv-badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lv-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600 }}>Top Products This Week</h3>
            <Link href="/products"><span style={{ color: 'var(--gold)', fontSize: 13, cursor: 'pointer' }}>View All →</span></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_PRODUCTS_WEEK.map((p, i) => (
              <div key={p.name}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-dim)', color: 'var(--gold)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(p.revenue)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.units} units</div>
                  </div>
                </div>
                <div className="lv-progress">
                  <div className="lv-progress-fill" style={{ width: p.pct + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Low Stock Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="lv-card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="var(--warning)" />
              Low Stock Alerts
            </h3>
            <span className="lv-badge badge-pending">{lowStock.length} items</span>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <Package size={32} color="var(--text-muted)" />
              <p>All products are well stocked</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.sku}</div>
                  </div>
                  <span className="lv-badge badge-pending" style={{ fontSize: 12 }}>{p.stock} left</span>
                  <Link href={`/products?edit=${p.id}`}>
                    <button className="lv-btn lv-btn-ghost lv-btn-sm">Restock</button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="lv-card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: Plus, label: 'Add Product', href: '/products/new', color: 'var(--gold)' },
              { icon: Percent, label: 'Create Discount', href: '/marketing', color: 'var(--info)' },
              { icon: UserPlus, label: 'Add Customer', href: '/customers', color: 'var(--success)' },
              { icon: BarChart3, label: 'View Reports', href: '/analytics', color: '#8B5CF6' },
              { icon: FileDown, label: 'Export Orders', href: '/orders', color: 'var(--warning)' },
              { icon: Mail, label: 'Broadcast Email', href: '/marketing?tab=email', color: '#ec4899' },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--t)', fontFamily: 'var(--font-admin)', color: 'var(--text-primary)', fontSize: 14 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = 'var(--bg-surface-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface-2)'; }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: a.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon size={16} color={a.color} />
                  </div>
                  {a.label}
                </button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
