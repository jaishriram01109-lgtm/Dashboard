'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/lv/context';
import type { Order, OrderStatus } from '@/lib/lv/types';
import { Search, Filter, Download, Plus, ChevronUp, ChevronDown, Eye, Edit2, Printer, X, Check, Truck, RotateCcw, Package, IndianRupee, User, MapPin, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'returned', label: 'Returns' },
];

const STEPS = ['Order Placed', 'Payment Confirmed', 'Packed', 'Shipped', 'Delivered'];
const stepForStatus: Record<OrderStatus, number> = {
  pending: 1, processing: 2, shipped: 3, delivered: 4, returned: 0, cancelled: 0
};

export default function OrdersPage() {
  const { state, dispatch, logAction } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [trackingInput, setTrackingInput] = useState({ courier: '', id: '' });
  const [showRefund, setShowRefund] = useState(false);
  const [refundData, setRefundData] = useState({ reason: '', amount: 0, notes: '', password: '' });
  const [filterPayment, setFilterPayment] = useState('all');

  const orders = useMemo(() => {
    let o = [...state.orders];
    if (tab !== 'all') o = o.filter(x => x.status === tab);
    if (search) {
      const q = search.toLowerCase();
      o = o.filter(x => x.id.toLowerCase().includes(q) || x.customer.toLowerCase().includes(q) || x.email.toLowerCase().includes(q));
    }
    if (filterPayment !== 'all') o = o.filter(x => x.payment === filterPayment);
    o.sort((a, b) => {
      let av: any, bv: any;
      if (sort.key === 'date') { av = a.date; bv = b.date; }
      else if (sort.key === 'total') { av = a.total; bv = b.total; }
      else if (sort.key === 'customer') { av = a.customer; bv = b.customer; }
      else { av = a.id; bv = b.id; }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return o;
  }, [state.orders, tab, search, sort, filterPayment]);

  const paginated = orders.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(orders.length / perPage);

  const tabCount = (key: string) => key === 'all' ? state.orders.length : state.orders.filter(o => o.status === key).length;

  const handleSort = (key: string) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const SortIcon = ({ key: k }: { key: string }) => (
    <span style={{ marginLeft: 4 }}>
      {sort.key === k ? (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} color="var(--text-muted)" />}
    </span>
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { ...order, status } });
    logAction('ORDER_STATUS_UPDATED', `Order ${id} → ${status}`);
    setSelectedOrder(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const updateTracking = () => {
    if (!selectedOrder) return;
    dispatch({ type: 'UPDATE_ORDER', payload: { ...selectedOrder, tracking: trackingInput.id, courier: trackingInput.courier } });
    logAction('ORDER_TRACKING_UPDATED', `Order ${selectedOrder.id}: ${trackingInput.courier} ${trackingInput.id}`);
    setSelectedOrder(prev => prev ? { ...prev, tracking: trackingInput.id, courier: trackingInput.courier } : prev);
  };

  const handleBulkAction = (action: string) => {
    if (action === 'shipped') selected.forEach(id => updateOrderStatus(id, 'shipped'));
    else if (action === 'delivered') selected.forEach(id => updateOrderStatus(id, 'delivered'));
    setSelected([]);
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput({ courier: order.courier || '', id: order.tracking || '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{state.orders.length} total orders</p>
        </div>
        <button className="lv-btn lv-btn-gold"><Plus size={16} /> Create Manual Order</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t.key ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap', fontFamily: 'var(--font-admin)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all var(--t)' }}>
            {t.label}
            <span style={{ background: tab === t.key ? 'var(--gold)' : 'var(--bg-surface-3)', color: tab === t.key ? '#0A0A0A' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 99 }}>
              {tabCount(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="lv-input" style={{ paddingLeft: 36 }} placeholder="Search by order ID or customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="lv-select" style={{ width: 160 }} value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
          <option value="all">All Payments</option>
          {['razorpay', 'upi', 'cod', 'card', 'netbanking', 'emi'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
        <select className="lv-select" style={{ width: 120 }} value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
          {[25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="lv-btn lv-btn-ghost"><Download size={15} /> Export CSV</button>
      </div>

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="bulk-action-bar">
          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{selected.length} selected</span>
          <button className="lv-btn lv-btn-ghost lv-btn-sm" onClick={() => handleBulkAction('shipped')}><Truck size={14} /> Mark Shipped</button>
          <button className="lv-btn lv-btn-ghost lv-btn-sm" onClick={() => handleBulkAction('delivered')}><CheckCircle2 size={14} /> Mark Delivered</button>
          <button className="lv-btn lv-btn-ghost lv-btn-sm"><Download size={14} /> Export Selected</button>
          <button className="lv-btn lv-btn-danger lv-btn-sm"><X size={14} /> Cancel Orders</button>
          <button className="lv-btn lv-btn-ghost lv-btn-sm lv-btn-icon" style={{ marginLeft: 'auto' }} onClick={() => setSelected([])}><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="lv-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" style={{ accentColor: 'var(--gold)' }}
                    checked={selected.length === paginated.length && paginated.length > 0}
                    onChange={e => setSelected(e.target.checked ? paginated.map(o => o.id) : [])} />
                </th>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Order ID <SortIcon key="id" /></th>
                <th onClick={() => handleSort('customer')}>Customer <SortIcon key="customer" /></th>
                <th>Items</th>
                <th onClick={() => handleSort('total')}>Amount <SortIcon key="total" /></th>
                <th>Payment</th>
                <th>Status</th>
                <th onClick={() => handleSort('date')}>Date <SortIcon key="date" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(order => (
                <tr key={order.id}>
                  <td><input type="checkbox" style={{ accentColor: 'var(--gold)' }} checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} /></td>
                  <td><span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 13 }}>{order.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.customer}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.city}, {order.state}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(order.total)}</td>
                  <td><span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{order.payment}</span></td>
                  <td><span className={`lv-badge badge-${order.status}`}>{order.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{order.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm" title="View" onClick={() => openOrder(order)}><Eye size={14} /></button>
                      <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm" title="Edit" onClick={() => openOrder(order)}><Edit2 size={14} /></button>
                      <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm" title="Print"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * perPage + 1, orders.length)}–{Math.min(page * perPage, orders.length)} of {orders.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`lv-btn lv-btn-sm ${page === p ? 'lv-btn-gold' : 'lv-btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div className="lv-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)} />
            <motion.div className="lv-drawer animate-slide-right" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
              {/* Drawer Header */}
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--gold)' }}>{selectedOrder.id}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{selectedOrder.date} · via {selectedOrder.payment.toUpperCase()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`lv-badge badge-${selectedOrder.status}`} style={{ fontSize: 13 }}>{selectedOrder.status}</span>
                  <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {/* Timeline */}
                <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Timeline</h4>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
                  {STEPS.map((step, i) => {
                    const activeStep = stepForStatus[selectedOrder.status] || 0;
                    const isDone = i < activeStep;
                    const isCurrent = i === activeStep - 1;
                    const isPending = i >= activeStep;
                    return (
                      <div key={step} style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                        {i > 0 && <div style={{ height: 2, background: isDone ? 'var(--success)' : 'var(--border)', flex: 1, alignSelf: 'flex-start', marginTop: 15, width: '100%', position: 'absolute' }} />}
                        <div className={`timeline-dot ${isDone || isCurrent ? 'done' : 'pending'} ${isCurrent ? 'current' : ''}`}>
                          {isDone || isCurrent ? <Check size={14} /> : <span>{i + 1}</span>}
                        </div>
                        <span style={{ fontSize: 11, color: isDone || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', fontWeight: isDone || isCurrent ? 500 : 400 }}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Customer */}
                <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</h4>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="lv-avatar lv-avatar-lg">{selectedOrder.customer.split(' ').map(n => n[0]).join('')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedOrder.customer}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}><Mail size={13} />{selectedOrder.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}><Phone size={13} />{selectedOrder.phone}</span>
                      </div>
                      {selectedOrder.address && (
                        <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                          <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{selectedOrder.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items Ordered</h4>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Size: {item.size} · Qty: {item.qty}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(item.price)} each</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Breakdown</h4>
                  {[
                    { label: 'Subtotal', value: selectedOrder.items.reduce((a, i) => a + i.price * i.qty, 0) },
                    { label: 'Shipping', value: selectedOrder.shipping || 0 },
                    { label: 'GST', value: selectedOrder.gst || 0 },
                  ].map(r => (
                    <div key={r.label} className="flex-between" style={{ marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                      <span>{r.value === 0 ? 'FREE' : fmt(r.value)}</span>
                    </div>
                  ))}
                  <div className="lv-divider" />
                  <div className="flex-between" style={{ fontWeight: 700, fontSize: 16 }}>
                    <span>Total</span><span style={{ color: 'var(--gold)' }}>{fmt(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Fulfillment */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fulfillment</h4>
                  <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="lv-label">Courier Partner</label>
                      <select className="lv-select" value={trackingInput.courier} onChange={e => setTrackingInput(p => ({ ...p, courier: e.target.value }))}>
                        <option value="">Select courier</option>
                        {['DTDC', 'Bluedart', 'Delhivery', 'FedEx', 'Amazon Shipping', 'India Post'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="lv-label">Tracking ID</label>
                      <input className="lv-input" placeholder="e.g. DTDC123456789" value={trackingInput.id} onChange={e => setTrackingInput(p => ({ ...p, id: e.target.value }))} />
                    </div>
                  </div>
                  <button className="lv-btn lv-btn-ghost lv-btn-sm" onClick={updateTracking}><Truck size={14} /> Update Tracking</button>
                  {selectedOrder.tracking && (
                    <p style={{ fontSize: 13, color: 'var(--success)', marginTop: 8 }}>
                      ✓ Tracking: {selectedOrder.courier} · {selectedOrder.tracking}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {selectedOrder.status === 'processing' && (
                    <button className="lv-btn lv-btn-info lv-btn-sm" onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}><Truck size={14} /> Mark as Shipped</button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button className="lv-btn lv-btn-success lv-btn-sm" onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}><CheckCircle2 size={14} /> Mark Delivered</button>
                  )}
                  {selectedOrder.status === 'pending' && (
                    <button className="lv-btn lv-btn-info lv-btn-sm" onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}><Package size={14} /> Confirm Processing</button>
                  )}
                  <button className="lv-btn lv-btn-ghost lv-btn-sm" onClick={() => { setShowRefund(true); setRefundData(p => ({ ...p, amount: selectedOrder.total })); }}>
                    <RotateCcw size={14} /> Initiate Refund
                  </button>
                  <button className="lv-btn lv-btn-ghost lv-btn-sm"><Printer size={14} /> Print Invoice</button>
                  <button className="lv-btn lv-btn-danger lv-btn-sm" onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}><X size={14} /> Cancel Order</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefund && selectedOrder && (
          <motion.div className="lv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="lv-modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Initiate Refund</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Order {selectedOrder.id} · {fmt(selectedOrder.total)}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="lv-label">Reason</label>
                  <select className="lv-select" value={refundData.reason} onChange={e => setRefundData(p => ({ ...p, reason: e.target.value }))}>
                    <option value="">Select reason…</option>
                    {['Customer Request', 'Defective Item', 'Wrong Item Sent', 'Courier Lost', 'Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lv-label">Refund Amount (₹)</label>
                  <input className="lv-input" type="number" value={refundData.amount} onChange={e => setRefundData(p => ({ ...p, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="lv-label">Notes</label>
                  <textarea className="lv-textarea" rows={3} placeholder="Internal notes…" value={refundData.notes} onChange={e => setRefundData(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div>
                  <label className="lv-label">Confirm Password (Security Check)</label>
                  <input className="lv-input" type="password" placeholder="Enter your password to confirm" value={refundData.password} onChange={e => setRefundData(p => ({ ...p, password: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowRefund(false)}>Cancel</button>
                <button className="lv-btn lv-btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { logAction('REFUND_INITIATED', `Order ${selectedOrder.id}: ${fmt(refundData.amount)} — ${refundData.reason}`); setShowRefund(false); }}>
                  CONFIRM REFUND
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
