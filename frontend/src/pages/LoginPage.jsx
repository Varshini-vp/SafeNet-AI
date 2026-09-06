import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    const res = await demoLogin(role);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070a10] relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Smart City Background Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber radar circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-blue-500/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Hackathon Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>SMART INDIA HACKATHON 2026 • SIH26202</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="p-8 rounded-3xl bg-[#0f1626]/90 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80">
          {/* Brand header */}
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/30 mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white font-sans">SafeNet AI</h2>
            <p className="text-xs text-cyan-400 font-mono font-medium mt-1">
              Intelligent Road Risk Prediction System
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Real-time accident prediction & behavior analysis for smart city traffic command centers.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mt-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="authority@safenet.ai"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[10px] font-mono text-center text-slate-500 uppercase tracking-wider mb-3">
              One-Click Hackathon Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('authority')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/70 hover:bg-cyan-500/10 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">Traffic Authority</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">authority@safenet.ai</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/70 hover:bg-purple-500/10 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400">Administrator</span>
                  <Cpu className="w-3.5 h-3.5 text-purple-400 opacity-70 group-hover:opacity-100" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">admin@safenet.ai</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-4 font-mono">
          SafeNet AI Prototype • Video → Detection → Tracking → Prediction → Alert
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
