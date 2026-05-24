'use client';
import { useState } from 'react';
import { useApp } from '@/lib/lv/context';
import { CreditCard, Wallet, ReceiptText, RotateCcw, Calculator, Check, X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const TABS = [
  { key: 'gateways', label: 'Payment Gateways', icon: Wallet },
  { key: 'transactions', label: 'Transaction History', icon: ReceiptText },
  { key: 'refunds', label: 'Refunds', icon: RotateCcw },
  { key: 'tax', label: 'Tax & GST', icon: Calculator },
];

export default function PaymentsPage() {
  const { state } = useApp();
  const [tab, setTab] = useState('gateways');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const transactions = state.orders.filter(o => o.status !== 'pending').map(o => ({
    id: 'TXN' + o.id.replace('LV-', '').replace('-', ''),
    orderId: o.id,
    customer: o.customer,
    amount: o.total,
    method: o.payment,
    status: o.status === 'returned' ? 'refunded' : 'success',
    date: o.date
  }));

  const refunds = state.orders.filter(o => o.status === 'returned').map(o => ({
    id: 'REF' + o.id.replace('LV-', '').replace('-', ''),
    orderId: o.id,
    customer: o.customer,
    amount: o.total,
    reason: 'Customer Request',
    status: 'processed',
    date: o.date
  }));

  const gateways = [
    { name: 'Razorpay', logo: '🏦', connected: true, keyId: 'rzp_live_XXXXXXXXXXXXXXXXX', secret: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', desc: 'Primary gateway — Credit/Debit cards, UPI, Netbanking', txnCount: state.orders.filter(o => o.payment === 'razorpay').length },
    { name: 'UPI (Direct)', logo: '📲', connected: true, keyId: 'lussovogue@ybl', secret: '', desc: 'Google Pay, PhonePe, Paytm', txnCount: state.orders.filter(o => o.payment === 'upi').length },
    { name: 'PayU', logo: '💳', connected: false, keyId: '', secret: '', desc: 'Credit cards, EMI, Wallets backup gateway', txnCount: 0 },
    { name: 'COD', logo: '💵', connected: true, keyId: 'Enabled', secret: '', desc: 'Cash on delivery — domestic orders only', txnCount: state.orders.filter(o => o.payment === 'cod').length },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Manage gateways, transactions & refunds</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: fmt(state.orders.reduce((a, o) => a + o.total, 0)), color: 'var(--gold)' },
          { label: 'Transactions', value: transactions.length, color: 'var(--info)' },
          { label: 'Refunds', value: refunds.length, color: 'var(--warning)' },
          { label: 'Refund Amount', value: fmt(refunds.reduce((a, r) => a + r.amount, 0)), color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="kpi-card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-admin)', whiteSpace: 'nowrap' }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'gateways' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {gateways.map(g => (
              <div key={g.name} className="lv-card">
                <div className="flex-between" style={{ marginBottom: g.connected && g.keyId ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 28 }}>{g.logo}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ fontWeight: 700 }}>{g.name}</h3>
                        <span className={`lv-badge badge-${g.connected ? 'active' : 'inactive'}`}>{g.connected ? 'Connected' : 'Not Connected'}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{g.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {g.txnCount > 0 && (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.txnCount} transactions</span>
                    )}
                    <label className="lv-toggle">
                      <input type="checkbox" defaultChecked={g.connected} />
                      <span className="lv-toggle-slider" />
                    </label>
                  </div>
                </div>
                {g.connected && g.keyId && g.keyId !== 'Enabled' && (
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                      <label className="lv-label">Key ID / API Key</label>
                      <div style={{ position: 'relative' }}>
                        <input className="lv-input" type={showKey[g.name + '_id'] ? 'text' : 'password'} defaultValue={g.keyId} readOnly style={{ paddingRight: 40, fontFamily: 'monospace', fontSize: 13 }} />
                        <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                          onClick={() => setShowKey(p => ({ ...p, [g.name + '_id']: !p[g.name + '_id'] }))}>
                          {showKey[g.name + '_id'] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    {g.secret && (
                      <div>
                        <label className="lv-label">Secret Key</label>
                        <div style={{ position: 'relative' }}>
                          <input className="lv-input" type={showKey[g.name + '_sec'] ? 'text' : 'password'} defaultValue={g.secret} readOnly style={{ paddingRight: 40, fontFamily: 'monospace', fontSize: 13 }} />
                          <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                            onClick={() => setShowKey(p => ({ ...p, [g.name + '_sec']: !p[g.name + '_sec'] }))}>
                            {showKey[g.name + '_sec'] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'transactions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="lv-table">
            <thead>
              <tr><th>Transaction ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.slice(0, 15).map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{t.id}</span></td>
                  <td><span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 13 }}>{t.orderId}</span></td>
                  <td>{t.customer}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(t.amount)}</td>
                  <td><span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.method}</span></td>
                  <td><span className={`lv-badge badge-${t.status === 'success' ? 'active' : t.status === 'refunded' ? 'returned' : 'pending'}`}>{t.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {tab === 'refunds' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="lv-table">
            <thead>
              <tr><th>Refund ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Reason</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {refunds.map(r => (
                <tr key={r.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{r.id}</span></td>
                  <td><span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 13 }}>{r.orderId}</span></td>
                  <td>{r.customer}</td>
                  <td style={{ fontWeight: 600, color: 'var(--danger)' }}>-{fmt(r.amount)}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.reason}</td>
                  <td><span className="lv-badge badge-active">{r.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.date}</td>
                </tr>
              ))}
              {refunds.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No refunds processed</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {tab === 'tax' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lv-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>GST Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div>
                  <label className="lv-label">GST Registration Number (GSTIN)</label>
                  <input className="lv-input" defaultValue="27AABCL1234A1ZX" />
                </div>
                <div>
                  <label className="lv-label">Business State</label>
                  <select className="lv-select"><option>Maharashtra</option></select>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Default GST Rates by Category</h4>
                {[
                  { category: 'Clothing (≤₹1000 MRP)', rate: '0%', hsn: '6101-6117' },
                  { category: 'Clothing (>₹1000 MRP)', rate: '12%', hsn: '6101-6117' },
                  { category: 'Sarees / Ethnic Wear', rate: '5%', hsn: '5007, 6204' },
                  { category: 'Accessories', rate: '18%', hsn: '6217, 4205' },
                ].map(t => (
                  <div key={t.category} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ flex: 1 }}>{t.category}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{t.rate}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>HSN: {t.hsn}</span>
                  </div>
                ))}
              </div>
              <button className="lv-btn lv-btn-gold" style={{ alignSelf: 'flex-start' }}>Save Tax Settings</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
