'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/lv/context';
import { Search, Download, Filter, Shield, Clock, User, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: 'var(--success)',
  USER_LOGOUT: 'var(--text-muted)',
  PRODUCT_CREATED: 'var(--info)',
  PRODUCT_UPDATED: 'var(--info)',
  PRODUCT_DELETED: 'var(--danger)',
  ORDER_STATUS_UPDATED: 'var(--gold)',
  ORDER_TRACKING_UPDATED: 'var(--gold)',
  REFUND_INITIATED: 'var(--warning)',
  THEME_PUBLISHED: '#8B5CF6',
  BULK_ACTION: 'var(--warning)',
};

const SAMPLE_LOGS = [
  { id: 1, timestamp: '2025-01-18T14:32:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'USER_LOGIN', details: 'Login from Chrome 120', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 2, timestamp: '2025-01-18T14:35:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'ORDER_STATUS_UPDATED', details: 'Order LV-2025-0890 → processing', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 3, timestamp: '2025-01-18T14:38:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'PRODUCT_UPDATED', details: 'Updated: Obsidian Slim Blazer', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 4, timestamp: '2025-01-18T14:40:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'ORDER_TRACKING_UPDATED', details: 'Order LV-2025-0892: DTDC DTDC123456789', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 5, timestamp: '2025-01-17T09:15:00Z', user: 'Store Manager', userId: 2, role: 'store_manager', action: 'USER_LOGIN', details: 'Login from Safari/iOS 17', ip: '103.22.XX.XX', device: 'Safari/17', success: true },
  { id: 6, timestamp: '2025-01-17T09:20:00Z', user: 'Store Manager', userId: 2, role: 'store_manager', action: 'ORDER_STATUS_UPDATED', details: 'Order LV-2025-0886 → shipped', ip: '103.22.XX.XX', device: 'Safari/17', success: true },
  { id: 7, timestamp: '2025-01-17T10:00:00Z', user: 'Store Manager', userId: 2, role: 'store_manager', action: 'PRODUCT_CREATED', details: 'Created: Velvet Kurta Set', ip: '103.22.XX.XX', device: 'Safari/17', success: true },
  { id: 8, timestamp: '2025-01-16T16:45:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'REFUND_INITIATED', details: 'Order LV-2025-0887: ₹8,399 — Customer Request', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 9, timestamp: '2025-01-16T17:00:00Z', user: 'Ankit Singh', userId: 1, role: 'super_admin', action: 'THEME_PUBLISHED', details: 'Theme v2.0 published to live store', ip: '103.21.XX.XX', device: 'Chrome/120', success: true },
  { id: 10, timestamp: '2025-01-15T08:00:00Z', user: 'System', userId: 0, role: 'super_admin' as any, action: 'BACKUP_COMPLETED', details: 'Daily backup completed — 1.2 GB', ip: 'localhost', device: 'Server/2.0', success: true },
];

export default function AuditPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const allLogs = [...state.auditLogs, ...SAMPLE_LOGS].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filtered = useMemo(() => {
    return allLogs.filter(log => {
      if (search && !log.action.toLowerCase().includes(search.toLowerCase()) && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.details.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterUser !== 'all' && log.userId.toString() !== filterUser) return false;
      if (filterAction !== 'all' && !log.action.startsWith(filterAction)) return false;
      return true;
    });
  }, [allLogs, search, filterUser, filterAction]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const uniqueActions = Array.from(new Set(allLogs.map(l => l.action.split('_')[0])));

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{allLogs.length} total events · Complete action trail</p>
        </div>
        <button className="lv-btn lv-btn-ghost"><Download size={15} /> Export Log</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: allLogs.length, icon: Shield },
          { label: 'Today\'s Events', value: allLogs.filter(l => l.timestamp.startsWith('2025-01-18')).length, icon: Clock },
          { label: 'Active Users', value: new Set(allLogs.map(l => l.userId)).size, icon: User },
          { label: 'Unique Actions', value: new Set(allLogs.map(l => l.action)).size, icon: Monitor },
        ].map(s => (
          <div key={s.label} className="lv-card-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <s.icon size={16} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="lv-input" style={{ paddingLeft: 36 }} placeholder="Search actions, users, details…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="lv-select" style={{ width: 160 }} value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }}>
          <option value="all">All Users</option>
          <option value="1">Ankit Singh</option>
          <option value="2">Store Manager</option>
        </select>
        <select className="lv-select" style={{ width: 180 }} value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
          <option value="all">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="lv-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Device</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log, i) => (
              <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatTime(log.timestamp)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>
                      {log.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{log.user}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{log.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{
                    background: (ACTION_COLORS[log.action] || 'var(--text-muted)') + '18',
                    color: ACTION_COLORS[log.action] || 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em',
                    fontFamily: 'monospace', whiteSpace: 'nowrap'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.details}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ip}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.device}</td>
                <td>
                  <span className={`lv-badge badge-${log.success ? 'active' : 'returned'}`} style={{ fontSize: 11 }}>
                    {log.success ? 'success' : 'failed'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="empty-state">
            <Shield size={40} color="var(--text-muted)" />
            <p>No audit logs match your filters</p>
          </div>
        )}

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`lv-btn lv-btn-sm ${page === p ? 'lv-btn-gold' : 'lv-btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="lv-btn lv-btn-ghost lv-btn-sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
