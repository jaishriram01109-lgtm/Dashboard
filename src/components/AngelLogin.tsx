"use client";
import { useState, useEffect } from "react";
import { Shield, Loader2, Zap, Eye, EyeOff, X } from "lucide-react";
import { loginAngelOne, setLoginSkipped, ANGEL_CLIENT_ID, ANGEL_API_KEY } from "@/lib/angelOne";

const CLIENT_KEY = "angel_client";
const PWD_KEY    = "angel_pwd";

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function AngelLogin({ onSuccess, onSkip }: Props) {
  const [clientCode, setClientCode] = useState("");
  const [password,   setPassword]   = useState("");
  const [totp,       setTotp]       = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [savedClient, setSavedClient] = useState<string | null>(null);
  const [savedPwd,    setSavedPwd]    = useState<string | null>(null);

  useEffect(() => {
    const sc = localStorage.getItem(CLIENT_KEY) || ANGEL_CLIENT_ID;
    const sp = localStorage.getItem(PWD_KEY);
    setSavedClient(sc);
    setSavedPwd(sp);
    setClientCode(sc);
  }, []);

  // True when both client and pwd are already saved → only TOTP needed
  const totpOnly = !!(savedClient && savedPwd);

  const handleLogin = async () => {
    const code = clientCode.trim() || ANGEL_CLIENT_ID;
    const pwd  = totpOnly ? (savedPwd ?? "") : password;
    if (!code)        { setError("Client Code bharo (jaise A329549)"); return; }
    if (!pwd)         { setError("PIN bharo"); return; }
    setLoading(true);
    setError("");

    const { session, error: err } = await loginAngelOne(pwd, totp, code);
    setLoading(false);

    if (session) {
      localStorage.setItem(CLIENT_KEY, code);
      if (!totpOnly && password) localStorage.setItem(PWD_KEY, password);
      onSuccess();
    } else {
      if (totpOnly) {
        // Saved credentials might be stale — reset to full form
        localStorage.removeItem(PWD_KEY);
        setSavedPwd(null);
        setError(err || "TOTP galat ya expired. PIN bhi dobara bharo.");
      } else {
        setError(err || "Login fail. Client Code, PIN aur TOTP check karo.");
      }
    }
  };

  const handleReset = () => {
    localStorage.removeItem(CLIENT_KEY);
    localStorage.removeItem(PWD_KEY);
    setSavedClient(null);
    setSavedPwd(null);
    setClientCode(ANGEL_CLIENT_ID);
    setPassword("");
    setTotp("");
    setError("");
  };

  const handleSkip = () => { setLoginSkipped(); onSkip(); };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-maroon-800/50 rounded-2xl p-6 w-full max-w-sm shadow-glow-maroon">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-maroon flex items-center justify-center shadow-glow-maroon">
              <Shield className="w-5 h-5 text-ivory-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ivory-100 font-display">Angel One Login</h2>
              <p className="text-[10px] text-ivory-500">
                {totpOnly ? `${savedClient} — sirf OTP bharo` : "Live NSE data ke liye login karo"}
              </p>
            </div>
          </div>
          {totpOnly && (
            <button onClick={handleReset} title="Change credentials"
              className="text-ivory-700 hover:text-ivory-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* What you get */}
        {!totpOnly && (
          <div className="mb-4 bg-signal-bull/5 border border-signal-bull/20 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-signal-bull" />
              <span className="text-[9px] font-bold text-signal-bull uppercase tracking-wider">Kya milega — live data</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 text-[9px] text-ivory-400">
              {["Live NSE prices","Options chain","52W Scanner","Intraday charts","Portfolio","Market breadth","FnO data","Smart Money"].map(f => (
                <div key={f} className="flex items-center gap-1">
                  <span className="text-signal-bull text-[8px]">●</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Client Code — always show when not in totpOnly mode */}
          {!totpOnly && (
            <div>
              <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
                Client Code <span className="text-ivory-700 normal-case">(Angel One User ID)</span>
              </label>
              <input
                type="text"
                value={clientCode}
                onChange={e => setClientCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder={ANGEL_CLIENT_ID}
                className="mt-1 w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2.5 text-sm text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors font-mono"
              />
            </div>
          )}

          {/* PIN — only first time */}
          {!totpOnly && (
            <div>
              <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
                PIN <span className="text-ivory-700 normal-case">(4-digit MPIN)</span>
              </label>
              <div className="relative mt-1">
                <input
                  type={showPwd ? "text" : "password"}
                  inputMode="numeric"
                  value={password}
                  onChange={e => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="● ● ● ●"
                  maxLength={6}
                  className="w-full bg-bg-primary border border-bg-border rounded-lg pl-3 pr-9 py-2.5 text-sm text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors font-mono tracking-[0.4em] text-center"
                />
                <button onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory-600 hover:text-ivory-300">
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* TOTP */}
          <div>
            <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
              {totpOnly ? "Google Authenticator OTP" : "TOTP (Google Authenticator — optional)"}
            </label>
            <input
              type="text"
              value={totp}
              onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="6-digit OTP"
              className="mt-1 w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2.5 text-sm text-ivory-100 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors font-mono tracking-[0.4em] text-center"
              maxLength={6}
              autoFocus={totpOnly}
            />
            {totpOnly && (
              <p className="mt-1 text-[9px] text-ivory-700 text-center">
                Google Authenticator → Angel One account: <span className="text-ivory-500">{savedClient}</span>
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 text-[11px] text-signal-bear bg-signal-bear/10 border border-signal-bear/20 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || (!totpOnly && (!clientCode.trim() || password.length < 4))}
          className="mt-4 w-full py-3 bg-gradient-maroon text-ivory-100 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Connecting..." : totpOnly ? "Connect" : "Login & Connect"}
        </button>

        <button
          onClick={handleSkip}
          className="w-full mt-2 py-2 text-[10px] text-ivory-700 hover:text-ivory-500 transition-colors"
        >
          Skip — demo data se continue karo
        </button>
      </div>
    </div>
  );
}
