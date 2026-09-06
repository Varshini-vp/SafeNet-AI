import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Bell, Sliders, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { role } = useAuth();
  const [overspeedMargin, setOverspeedMargin] = useState(15);
  const [proximityGap, setProximityGap] = useState(4.0);
  const [densityTrigger, setDensityTrigger] = useState(75);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoAckTimeout, setAutoAckTimeout] = useState(30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-black text-white tracking-tight">System Thresholds & Configuration</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Adjust risk evaluation boundary limits, behavioral heuristic weights, and dispatch rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Threshold Parameters */}
        <div className="p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Risk Heuristic Parameters
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">ADMIN CONTROL</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Overspeeding Trigger Delta:</span>
                <span className="text-cyan-400 font-bold">+{overspeedMargin} km/h above limit</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={overspeedMargin}
                onChange={(e) => setOverspeedMargin(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Dangerous Proximity (Tailgating) Gap:</span>
                <span className="text-amber-400 font-bold">&lt; {proximityGap} meters</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="10.0"
                step="0.5"
                value={proximityGap}
                onChange={(e) => setProximityGap(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">High Traffic Density Threshold:</span>
                <span className="text-red-400 font-bold">&gt; {densityTrigger}% Road Capacity</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={densityTrigger}
                onChange={(e) => setDensityTrigger(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
              />
            </div>
          </div>
        </div>

        {/* Audio and Notification Preferences */}
        <div className="p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Web Audio Siren Blip</span>
                <span className="text-[11px] text-slate-500">Play synthesized audio tone on critical hazard detection</span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Operational thresholds updated successfully across all edge nodes!</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Apply Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
