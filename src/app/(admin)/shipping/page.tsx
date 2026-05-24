'use client';
import { useState } from 'react';
import { SHIPPING_ZONES } from '@/lib/lv/data';
import { MapPin, Truck, DollarSign, Calculator, Plus, Edit2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'zones', label: 'Shipping Zones', icon: MapPin },
  { key: 'partners', label: 'Delivery Partners', icon: Truck },
  { key: 'cod', label: 'COD Settings', icon: DollarSign },
  { key: 'rates', label: 'Rate Calculator', icon: Calculator },
];

const PARTNERS = [
  { name: 'DTDC', logo: '🔵', active: true, price: 'From ₹45', days: '3-5 days', coverage: 'Pan India' },
  { name: 'Bluedart', logo: '🟡', active: true, price: 'From ₹65', days: '1-3 days', coverage: 'Metro + Tier-2' },
  { name: 'Delhivery', logo: '🟢', active: true, price: 'From ₹40', days: '2-4 days', coverage: 'Pan India' },
  { name: 'FedEx India', logo: '🟣', active: false, price: 'From ₹120', days: '1-2 days', coverage: 'Major cities' },
  { name: 'Amazon Shipping', logo: '🟠', active: false, price: 'From ₹35', days: '1-3 days', coverage: 'Pan India' },
  { name: 'India Post', logo: '🔴', active: true, price: 'From ₹25', days: '5-8 days', coverage: 'Pan India + Remote' },
];

export default function ShippingPage() {
  const [tab, setTab] = useState('zones');
  const [zones, setZones] = useState(SHIPPING_ZONES);
  const [calcWeight, setCalcWeight] = useState(500);
  const [calcZone, setCalcZone] = useState('Z001');

  const calcRate = () => {
    const zone = zones.find(z => z.id === calcZone);
    if (!zone) return 0;
    return calcWeight > 500 ? zone.rate + Math.ceil((calcWeight - 500) / 500) * 20 : zone.rate;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Shipping</h1>
        <p className="page-subtitle">Zones, carriers & delivery settings</p>
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

      {tab === 'zones' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Define shipping rates for different regions of India.</p>
            <button className="lv-btn lv-btn-gold lv-btn-sm"><Plus size={14} /> Add Zone</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {zones.map(zone => (
              <div key={zone.id} className="lv-card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontWeight: 700 }}>{zone.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{zone.states.join(' · ')}</p>
                  </div>
                  <button className="lv-btn lv-btn-ghost lv-btn-sm"><Edit2 size={13} /> Edit</button>
                </div>
                <div className="grid-3">
                  <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>BASE RATE</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: zone.rate === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                      {zone.rate === 0 ? 'FREE' : '₹' + zone.rate}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>FREE ABOVE</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>₹{zone.freeAbove}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>COVERAGE</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{zone.states.length} states</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'partners' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {PARTNERS.map(p => (
              <div key={p.name} className="lv-card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32 }}>{p.logo}</div>
                    <div>
                      <h3 style={{ fontWeight: 700 }}>{p.name}</h3>
                      <span className={`lv-badge badge-${p.active ? 'active' : 'inactive'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <label className="lv-toggle">
                    <input type="checkbox" defaultChecked={p.active} />
                    <span className="lv-toggle-slider" />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  {[
                    { label: 'Rate', value: p.price },
                    { label: 'Delivery', value: p.days },
                    { label: 'Coverage', value: p.coverage },
                  ].map(d => (
                    <div key={d.label} className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                      <span style={{ fontWeight: 500 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'cod' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>COD (Cash on Delivery) Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Enable COD', desc: 'Allow customers to pay cash on delivery', enabled: true },
              { label: 'COD for all zones', desc: 'Uncheck to restrict COD to specific zones only', enabled: true },
              { label: 'COD above ₹500 only', desc: 'Minimum order value to qualify for COD', enabled: false },
              { label: 'COD charge', desc: 'Add extra charge for COD orders', enabled: false },
            ].map(s => (
              <div key={s.label} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.desc}</div>
                </div>
                <label className="lv-toggle">
                  <input type="checkbox" defaultChecked={s.enabled} />
                  <span className="lv-toggle-slider" />
                </label>
              </div>
            ))}
            <div>
              <label className="lv-label">COD Charge Amount (₹)</label>
              <input className="lv-input" type="number" defaultValue={0} style={{ maxWidth: 200 }} />
            </div>
            <div>
              <label className="lv-label">Maximum COD Order Value (₹)</label>
              <input className="lv-input" type="number" defaultValue={50000} style={{ maxWidth: 200 }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Orders above this value will not qualify for COD.</p>
            </div>
            <button className="lv-btn lv-btn-gold" style={{ alignSelf: 'flex-start' }}>Save COD Settings</button>
          </div>
        </motion.div>
      )}

      {tab === 'rates' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lv-card" style={{ maxWidth: 480 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Shipping Rate Calculator</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Estimate shipping cost for an order.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div>
              <label className="lv-label">Shipping Zone</label>
              <select className="lv-select" value={calcZone} onChange={e => setCalcZone(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lv-label">Package Weight (grams)</label>
              <input className="lv-input" type="number" value={calcWeight} onChange={e => setCalcWeight(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Estimated Shipping Cost</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: calcRate() === 0 ? 'var(--success)' : 'var(--gold)' }}>
              {calcRate() === 0 ? 'FREE' : '₹' + calcRate()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {calcWeight}g · {zones.find(z => z.id === calcZone)?.name}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
