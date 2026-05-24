'use client';
import { useApp } from '@/lib/lv/context';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionTimeout() {
  const { state, resetActivity, logout } = useApp();
  const router = useRouter();

  const handleStayLoggedIn = () => {
    resetActivity();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AnimatePresence>
      {state.sessionWarning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="lv-overlay" style={{ zIndex: 200 }}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="lv-modal" style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--warning-bg)', border: '2px solid var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Clock size={26} color="var(--warning)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Session Expiring Soon</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              You will be automatically logged out in <strong style={{ color: 'var(--warning)' }}>5 minutes</strong> due to inactivity.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={handleLogout}>
                Log Out Now
              </button>
              <button className="lv-btn lv-btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={handleStayLoggedIn}>
                Stay Logged In
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useRouter } from 'next/navigation';
