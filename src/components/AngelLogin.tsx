"use client";
import { useState, useEffect } from "react";
import { Shield, Loader2, Zap } from "lucide-react";
import { loginAngelOne, setLoginSkipped, ANGEL_CLIENT_ID } from "@/lib/angelOne";

const PWD_KEY = "angel_pwd";

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function AngelLogin({ onSuccess, onSkip }: Props) {
  const [savedPwd, setSavedPwd] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if password already saved
  useEffect(() => {
    const p = localStorage.getItem(PWD_KEY);
    setSavedPwd(p);
  }, []);

  const handleLogin = async () => {
    const pwd = savedPwd ?? password;
    if (!pwd) { setError("Pehli baar password bharo"); return; }
    setLoading(true);
    setError("");

    const { session, error: err } = await loginAngelOne(pwd, totp);
    setLoading(false);

    if (session) {
      // Save password for future logins
      if (!savedPwd && password) localStorage.setItem(PWD_KEY, password);
      onSuccess();
    } else {
      // If saved password failed, clear it and ask again
      if (savedPwd) {
        localStorage.removeItem(PWD_KEY);
        setSavedPwd(null);
        setError("Password galat ho gaya hai. Dobara enter karo.");
      } else {
        setError(err || "Login failed. Check karo password aur TOTP.");
      }
    }
  };

  const handleSkip = () => { setLoginSkipped(); onSkip(); };

  // Show simplified (TOTP only) when password is saved
  const totpOnly = savedPwd !== null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-maroon-800/50 rounded-2xl p-6 w-full max-w-xs shadow-glow-maroon">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-maroon flex items-center justify-center shadow-glow-maroon">
            <Shield className="w-5 h-5 text-ivory-100" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ivory-100 font-display">Angel One</h2>
            <p className="text-[10px] text-ivory-500">
              {totpOnly ? "Google Authenticator OTP bharo" : "Ek baar password bharo — phir sirf OTP"}
            </p>
          </div>
        </div>

        {/* Benefits — only when first time */}
        {!totpOnly && (
          <div className="mb-4 bg-signal-bull/5 border border-signal-bull/20 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-signal-bull" />
              <span className="text-[9px] font-bold text-signal-bull uppercase tracking-wider">Kya milega</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 text-[9px] text-ivory-400">
              {["Live NSE prices","Options chain","FII/DII data","Intraday charts","Portfolio","Market breadth"].map(f => (
                <div key={f} className="flex items-center gap-1">
                  <span className="text-signal-bull text-[8px]">●</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password — only first time */}
        {!totpOnly && (
          <div className="mb-3">
            <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
              Password <span className="text-ivory-700 normal-case">(sirf ek baar)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Angel One password"
              className="mt-1 w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2.5 text-xs text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors"
            />
          </div>
        )}

        {/* TOTP */}
        <div className="mb-5">
          <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
            {totpOnly ? "Google Authenticator OTP" : "TOTP (optional)"}
          </label>
          <input
            type="text"
            value={totp}
            onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="6-digit OTP"
            className="mt-1 w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-3 text-sm text-ivory-100 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors font-mono tracking-[0.4em] text-center"
            maxLength={6}
            autoFocus={totpOnly}
          />
          {totpOnly && (
            <p className="mt-1.5 text-[9px] text-ivory-700 text-center">
              Google Authenticator app → Angel One
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 text-[11px] text-signal-bear bg-signal-bear/10 border border-signal-bear/20 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || (!totpOnly && !password)}
          className="w-full py-3 bg-gradient-maroon text-ivory-100 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Connecting..." : "Login"}
        </button>

        <button
          onClick={handleSkip}
          className="w-full mt-2.5 py-2 text-[10px] text-ivory-700 hover:text-ivory-500 transition-colors"
        >
          Skip — simulated data se continue karo
        </button>
      </div>
    </div>
  );
}
