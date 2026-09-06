import React, { useState } from 'react';
import { Shield, Radio, Activity, AlertTriangle, Play, Sparkles, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import SimulateIncidentModal from './SimulateIncidentModal';

const Header = () => {
  const { user, logout, role } = useAuth();
  const { demoMode, setDemoMode, metrics, activeAlertsCount } = useDemo();
  const [showSimModal, setShowSimModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Brand and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  SafeNet AI <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">SIH 2026</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide">COMMAND CENTER • ID: SIH26202</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* System status pills */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              STATUS: ONLINE
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              AI ENGINE: ACTIVE
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              CAMERAS: {metrics.camerasConnected}
            </div>
          </div>
        </div>

        {/* Right: Actions and User */}
        <div className="flex items-center gap-3">
          {/* Quick Trigger Incident Button (SIH Star Feature) */}
          <button
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-500/20 transition-all border border-red-400/30 active:scale-95"
            title="Inject simulated road hazard event for live demo"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate SIH Incident</span>
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              demoMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 ring-1 ring-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-400 animate-spin-slow' : ''}`} />
            <span>Demo Mode: {demoMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* User Profile info */}
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-200">{user?.name || 'Operator'}</span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {role === 'admin' ? 'Administrator' : 'Traffic Authority'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Incident trigger modal */}
      {showSimModal && <SimulateIncidentModal onClose={() => setShowSimModal(false)} />}
    </>
  );
};

export default Header;
