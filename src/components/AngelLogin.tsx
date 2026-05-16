"use client";
import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff, Zap } from "lucide-react";
import { loginAngelOne, setLoginSkipped, ANGEL_CLIENT_ID } from "@/lib/angelOne";

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function AngelLogin({ onSuccess, onSkip }: Props) {
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password) { setError("Password bharo"); return; }
    setLoading(true);
    setError("");
    const { session, error: err } = await loginAngelOne(password, totp);
    setLoading(false);
    if (session) {
      onSuccess();
    } else {
      setError(err || "Login failed. Password ya TOTP check karo.");
    }
  };

  const handleSkip = () => {
    setLoginSkipped();
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-maroon-800/50 rounded-2xl p-6 w-full max-w-sm shadow-glow-maroon">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-maroon flex items-center justify-center shadow-glow-maroon">
            <Shield className="w-6 h-6 text-ivory-100" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ivory-100 font-display">Angel One Login</h2>
            <p className="text-[11px] text-ivory-500">Real-time NSE data activate karo</p>
          </div>
        </div>

        {/* What you get */}
        <div className="mb-5 bg-signal-bull/5 border border-signal-bull/20 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3 h-3 text-signal-bull" />
            <span className="text-[10px] font-bold text-signal-bull uppercase tracking-wider">Login karne se milega</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-ivory-400">
            {["Live stock prices","Options chain","FII/DII data","Intraday charts","Portfolio holdings","Market breadth"].map(f => (
              <div key={f} className="flex items-center gap-1">
                <span className="text-signal-bull">●</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Client ID */}
        <div className="mb-3">
          <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">Client ID</label>
          <div className="mt-1 px-3 py-2.5 bg-bg-primary border border-bg-border rounded-lg text-xs text-ivory-400 font-mono">
            {ANGEL_CLIENT_ID}
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">Password</label>
          <div className="relative mt-1">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Angel One password"
              className="w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2.5 text-xs text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory-600 hover:text-ivory-300"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* TOTP */}
        <div className="mb-5">
          <label className="text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">
            TOTP <span className="text-ivory-700 normal-case">(Google Authenticator — optional)</span>
          </label>
          <input
            type="text"
            value={totp}
            onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="6-digit OTP"
            className="mt-1 w-full bg-bg-primary border border-bg-border rounded-lg px-3 py-2.5 text-xs text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors font-mono tracking-[0.3em]"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="mb-4 text-[11px] text-signal-bear bg-signal-bear/10 border border-signal-bear/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !password}
          className="w-full py-3 bg-gradient-maroon text-ivory-100 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Connecting..." : "Login — Real Data Start Karo"}
        </button>

        <button
          onClick={handleSkip}
          className="w-full mt-3 py-2 text-[11px] text-ivory-700 hover:text-ivory-400 transition-colors"
        >
          Skip karo — Simulated data se dekhna hai
        </button>
      </div>
    </div>
  );
}
