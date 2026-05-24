'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/lv/context';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { login, verify2FA, state, pendingUser } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('admin@lussovogue.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [code2FA, setCode2FA] = useState('');
  const [code2FAError, setCode2FAError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      router.replace('/dashboard');
      return;
    }
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('lv_session_expired')) {
        setSessionExpired(true);
        localStorage.removeItem('lv_session_expired');
      }
      try {
        const saved = JSON.parse(localStorage.getItem('lv_login_attempts') || '{}');
        if (saved.lockedUntil && Date.now() < saved.lockedUntil) {
          setLockedUntil(saved.lockedUntil);
        }
      } catch {}
    }
  }, [state.isAuthenticated, router]);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setLockCountdown('');
        clearInterval(interval);
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setLockCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requires2FA) {
        setShow2FA(true);
      } else {
        router.replace('/dashboard');
      }
    } else {
      if (result.error === 'locked' && result.lockedUntil) {
        setLockedUntil(result.lockedUntil);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setCode2FAError('');
    if (!verify2FA(code2FA)) {
      setCode2FAError('Invalid verification code. Use 123456 for demo.');
      return;
    }
    router.replace('/dashboard');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  if (lockedUntil && Date.now() < lockedUntil) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="lv-modal lockout-card" style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-bg)', border: '2px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={28} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>Account Temporarily Locked</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Too many failed login attempts. Your account has been locked for security.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '16px 24px' }}>
            <Clock size={20} color="var(--danger)" />
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{lockCountdown}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>Try again after the lockout period ends</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <AnimatePresence mode="wait">
        {show2FA ? (
          <motion.div key="2fa" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="lv-modal" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gold-dim)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={24} color="var(--gold)" />
              </div>
              <h2 className="brand-cinzel" style={{ fontSize: 20, marginBottom: 8 }}>Two-Factor Authentication</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Enter the 6-digit code from your authenticator app.<br />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Demo: use <strong style={{ color: 'var(--gold)' }}>123456</strong></span>
              </p>
            </div>
            <form onSubmit={handle2FA}>
              <div style={{ marginBottom: 20 }}>
                <input
                  className="lv-input"
                  style={{ textAlign: 'center', fontSize: 28, letterSpacing: '0.3em', fontWeight: 700 }}
                  value={code2FA}
                  onChange={e => setCode2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                />
                {code2FAError && (
                  <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> {code2FAError}
                  </p>
                )}
              </div>
              <button type="submit" className="lv-btn lv-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15 }}>
                Verify & Sign In
              </button>
              <button type="button" className="lv-btn lv-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                onClick={() => setShow2FA(false)}>Back to Login</button>
            </form>
          </motion.div>
        ) : showForgot ? (
          <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="lv-modal" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="brand-cinzel" style={{ fontSize: 22, marginBottom: 4 }}>LUSSOVOGUE</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em' }}>ADMIN PORTAL</p>
            </div>
            {forgotSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={24} color="var(--success)" />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Email Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                  Password reset instructions sent to<br /><strong style={{ color: 'var(--text-primary)' }}>{forgotEmail}</strong>
                </p>
                <button className="lv-btn lv-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowForgot(false); setForgotSent(false); }}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Reset Password</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Enter your email to receive reset instructions.</p>
                <div style={{ marginBottom: 20 }}>
                  <label className="lv-label">Email Address</label>
                  <input className="lv-input" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="admin@lussovogue.com" required />
                </div>
                <button type="submit" className="lv-btn lv-btn-gold" style={{ width: '100%', justifyContent: 'center' }}>Send Reset Link</button>
                <button type="button" className="lv-btn lv-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => setShowForgot(false)}>Cancel</button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="lv-modal" style={{ width: '100%', maxWidth: 480 }}>

            {sessionExpired && (
              <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--warning)' }}>
                <Clock size={16} /> Session expired due to inactivity. Please sign in again.
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="brand-cinzel" style={{ fontSize: 28, marginBottom: 6 }}>LUSSOVOGUE</div>
              <p style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500 }}>Admin Portal</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label className="lv-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="lv-input" style={{ paddingLeft: 40 }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@lussovogue.com" required />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="lv-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="lv-input" style={{ paddingLeft: 40, paddingRight: 40 }} type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required />
                  <button type="button" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16, fontSize: 14, color: 'var(--danger)' }}>
                  <AlertCircle size={15} /> {error}
                </motion.div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
                  Remember this device for 30 days
                </label>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="lv-btn lv-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(10,10,10,0.3)', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                    Signing in...
                  </span>
                ) : 'SIGN IN'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
              <Lock size={12} />
              Secured by 256-bit SSL encryption
            </div>

            <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Demo credentials:</strong><br />
              Super Admin: admin@lussovogue.com / Admin@123456<br />
              Manager: manager@lussovogue.com / Manager@123456
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
