'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, Sun, Moon, ChevronDown, User, KeyRound, Store, LogOut, X, ShoppingBag, Users, Package } from 'lucide-react';
import { useApp } from '@/lib/lv/context';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  breadcrumb?: string[];
}

export default function Header({ breadcrumb }: HeaderProps) {
  const { state, dispatch, logout } = useApp();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_GLOBAL_SEARCH', payload: e.target.value });
  };

  const notifIcon: Record<string, typeof Bell> = { order: ShoppingBag, stock: Package, customer: Users, payment: ShoppingBag, system: Bell };

  return (
    <header className="lv-header" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} title="Toggle sidebar">
          <Menu size={18} />
        </button>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{crumb}</span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input ref={searchRef} className="global-search" style={{ paddingLeft: 36 }}
            placeholder="Search orders, products, customers… (⌘K)"
            value={state.globalSearch}
            onChange={handleSearch}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          {state.globalSearch && (
            <button style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              onClick={() => dispatch({ type: 'SET_GLOBAL_SEARCH', payload: '' })}>
              <X size={14} />
            </button>
          )}
        </div>

        <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} title="Toggle theme">
          {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="lv-btn lv-btn-ghost lv-btn-icon" style={{ position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 360, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-modal)', zIndex: 999 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>Notifications</span>
                  {unreadCount > 0 && <span style={{ fontSize: 12, color: 'var(--gold)', cursor: 'pointer' }} onClick={() => state.notifications.forEach(n => dispatch({ type: 'MARK_NOTIF_READ', payload: n.id }))}>Mark all read</span>}
                </div>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {state.notifications.map(n => (
                    <div key={n.id} onClick={() => dispatch({ type: 'MARK_NOTIF_READ', payload: n.id })}
                      style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, cursor: 'pointer', background: n.read ? 'transparent' : 'var(--bg-surface-2)', transition: 'background var(--t)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bell size={16} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontWeight: n.read ? 400 : 600, fontSize: 13 }}>{n.title}</span>
                          {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 4 }} />}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0' }}>{n.message}</p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 12px 6px 6px', cursor: 'pointer' }}>
            <div className="lv-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{state.user?.avatar}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{state.user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{state.user?.role?.replace('_', ' ')}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-modal)', zIndex: 999, padding: 8 }}>
                {[
                  { icon: User, label: 'My Profile', action: () => { router.push('/settings'); setShowUserMenu(false); } },
                  { icon: KeyRound, label: 'Change Password', action: () => { router.push('/settings'); setShowUserMenu(false); } },
                  { icon: Store, label: 'View Store', action: () => window.open('#', '_blank') },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, textAlign: 'left', transition: 'all var(--t)', fontFamily: 'var(--font-admin)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <item.icon size={15} /> {item.label}
                  </button>
                ))}
                <div className="lv-divider" />
                <button onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, textAlign: 'left', fontFamily: 'var(--font-admin)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
