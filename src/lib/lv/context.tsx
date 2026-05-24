'use client';
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { AdminUser, AuditLog, LoginAttemptData } from './types';
import { ADMIN_USERS, DEMO_PASSWORDS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS, NOTIFICATIONS } from './data';
import type { Order, Customer, Product, Notification } from './types';

const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
  sessionTimeout: 30 * 60 * 1000,
  warningBeforeTimeout: 5 * 60 * 1000,
  tokenExpiry: 15 * 60 * 1000,
};

interface AppState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  orders: Order[];
  customers: Customer[];
  products: Product[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  sessionWarning: boolean;
  globalSearch: string;
}

type AppAction =
  | { type: 'LOGIN'; payload: AdminUser }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'MARK_NOTIF_READ'; payload: number }
  | { type: 'SET_SESSION_WARNING'; payload: boolean }
  | { type: 'SET_GLOBAL_SEARCH'; payload: string }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  theme: 'dark',
  sidebarCollapsed: false,
  orders: MOCK_ORDERS,
  customers: MOCK_CUSTOMERS,
  products: MOCK_PRODUCTS,
  notifications: NOTIFICATIONS,
  auditLogs: [],
  sessionWarning: false,
  globalSearch: '',
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState, theme: state.theme, orders: state.orders, customers: state.customers, products: state.products };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 500) };
    case 'MARK_NOTIF_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'SET_SESSION_WARNING':
      return { ...state, sessionWarning: action.payload };
    case 'SET_GLOBAL_SEARCH':
      return { ...state, globalSearch: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => { success: boolean; requires2FA?: boolean; error?: string; lockedUntil?: number };
  verify2FA: (code: string) => boolean;
  logout: () => void;
  logAction: (action: string, details: string) => void;
  resetActivity: () => void;
  pendingUser: AdminUser | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pendingUser, setPendingUser] = React.useState<AdminUser | null>(null);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lv_session');
    const theme = localStorage.getItem('lv_theme') as 'dark' | 'light' | null;
    const sidebarCollapsed = localStorage.getItem('lv_sidebar') === 'true';
    if (saved) {
      try {
        const { user, expiry } = JSON.parse(saved);
        if (Date.now() < expiry) {
          dispatch({ type: 'HYDRATE', payload: { user, isAuthenticated: true, theme: theme || 'dark', sidebarCollapsed } });
        } else {
          localStorage.removeItem('lv_session');
          dispatch({ type: 'HYDRATE', payload: { theme: theme || 'dark', sidebarCollapsed } });
        }
      } catch { localStorage.removeItem('lv_session'); }
    } else {
      dispatch({ type: 'HYDRATE', payload: { theme: theme || 'dark', sidebarCollapsed } });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('lv_theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lv_sidebar', String(state.sidebarCollapsed));
  }, [state.sidebarCollapsed]);

  const resetActivity = useCallback(() => {
    if (!state.isAuthenticated) return;
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    dispatch({ type: 'SET_SESSION_WARNING', payload: false });

    warningTimer.current = setTimeout(() => {
      dispatch({ type: 'SET_SESSION_WARNING', payload: true });
    }, SECURITY_CONFIG.sessionTimeout - SECURITY_CONFIG.warningBeforeTimeout);

    activityTimer.current = setTimeout(() => {
      logout();
      if (typeof window !== 'undefined') {
        localStorage.setItem('lv_session_expired', '1');
        window.location.href = '/login';
      }
    }, SECURITY_CONFIG.sessionTimeout);
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (!state.isAuthenticated) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    let debounce: NodeJS.Timeout;
    const handler = () => {
      clearTimeout(debounce);
      debounce = setTimeout(resetActivity, 500);
    };
    events.forEach(e => window.addEventListener(e, handler));
    resetActivity();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [state.isAuthenticated, resetActivity]);

  const getLoginAttempts = (): LoginAttemptData => {
    if (typeof window === 'undefined') return { attempts: 0, lastAttempt: 0, lockedUntil: null };
    try { return JSON.parse(localStorage.getItem('lv_login_attempts') || '{}'); }
    catch { return { attempts: 0, lastAttempt: 0, lockedUntil: null }; }
  };

  const saveLoginAttempts = (data: LoginAttemptData) => {
    localStorage.setItem('lv_login_attempts', JSON.stringify(data));
  };

  const login = (email: string, password: string) => {
    const attempts = getLoginAttempts();

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return { success: false, error: 'locked', lockedUntil: attempts.lockedUntil };
    }

    const user = ADMIN_USERS.find(u => u.email === email);
    const expectedPassword = DEMO_PASSWORDS[email];

    if (!user || password !== expectedPassword) {
      const newAttempts = { attempts: (attempts.attempts || 0) + 1, lastAttempt: Date.now(), lockedUntil: null as number | null };
      if (newAttempts.attempts >= SECURITY_CONFIG.maxLoginAttempts) {
        newAttempts.lockedUntil = Date.now() + SECURITY_CONFIG.lockoutDuration;
      }
      saveLoginAttempts(newAttempts);
      return { success: false, error: newAttempts.lockedUntil ? 'locked' : 'invalid', lockedUntil: newAttempts.lockedUntil ?? undefined };
    }

    saveLoginAttempts({ attempts: 0, lastAttempt: Date.now(), lockedUntil: null });

    if (user.twoFAEnabled) {
      setPendingUser(user);
      return { success: true, requires2FA: true };
    }

    completeLogin(user);
    return { success: true };
  };

  const verify2FA = (code: string): boolean => {
    if (code === '123456' && pendingUser) {
      completeLogin(pendingUser);
      setPendingUser(null);
      return true;
    }
    return false;
  };

  const completeLogin = (user: AdminUser) => {
    dispatch({ type: 'LOGIN', payload: user });
    localStorage.setItem('lv_session', JSON.stringify({
      user,
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000
    }));
    logActionDirect(user, 'USER_LOGIN', `Login from ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('lv_session');
    setPendingUser(null);
  };

  const logActionDirect = (user: AdminUser, action: string, details: string) => {
    const log: AuditLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user.name,
      userId: user.id,
      role: user.role,
      action,
      details,
      ip: '103.21.XX.XX',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : 'Unknown',
      success: true,
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log });
  };

  const logAction = (action: string, details: string) => {
    if (!state.user) return;
    logActionDirect(state.user, action, details);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, login, verify2FA, logout, logAction, resetActivity, pendingUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
