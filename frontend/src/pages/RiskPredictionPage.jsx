import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  Play,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { riskAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const RiskPredictionPage = () => {
  // Interactive Simulator Parameters
  const [speed, setSpeed] = useState(82);
  const [distance, setDistance] = useState(5.0);
  const [density, setDensity] = useState(78);
  const [direction, setDirection] = useState('wrong-way');
  const [suddenStop, setSuddenStop] = useState(false);
  const [erraticBehavior, setErraticBehavior] = useState(true);
  const [speedLimit, setSpeedLimit] = useState(60);

  const [calcResult, setCalcResult] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculateLiveRisk = async () => {
    try {
      const res = await riskAPI.predict({
        speed: parseFloat(speed),
        distance: parseFloat(distance),
        density: parseFloat(density),
        direction: direction,
        sudden_stop: suddenStop,
        erratic_behavior: erraticBehavior,
        speed_limit: parseFloat(speedLimit)
      });
      if (res.data.success) {
        setCalcResult(res.data);
      }
    } catch (e) {
      console.warn('Risk predict error, using formula fallback:', e);
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await riskAPI.getRecent(10);
      if (res.data.success) {
        setRecentPredictions(res.data.predictions);
      }
    } catch (e) {}
  };

  // Run calculation when parameters change
  useEffect(() => {
    calculateLiveRisk();
  }, [speed, distance, density, direction, suddenStop, erraticBehavior, speedLimit]);

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-black text-white tracking-tight">AI Risk Prediction Engine</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Multi-variable mathematical collision risk classification evaluating speed differentials, headway margins, and erratic steering anomalies.
        </p>
      </div>

      {/* Main Grid: Interactive Calculator + Large Visual Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Interactive Parameters */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Telemetry Input Variables
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">REAL-TIME INFERENCE</span>
          </div>

          <div className="space-y-4">
            {/* Speed slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Vehicle Velocity (km/h)</span>
                <span className="text-cyan-400 font-bold">{speed} km/h (Limit: {speedLimit})</span>
              </div>
              <input
                type="range"
                min="10"
                max="140"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Distance / Headway Gap slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Nearest Proximity Gap (Headway m)</span>
                <span className={distance < 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  {distance.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Traffic Density slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Zone Traffic Density (%)</span>
                <span className="text-cyan-400 font-bold">{density}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Direction toggle */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Lane Heading Alignment:</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setDirection('normal')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    direction === 'normal'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Regular Flow (North)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('wrong-way')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    direction === 'wrong-way'
                      ? 'bg-red-500/20 border-red-500 text-red-300 font-bold animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Wrong-Way Movement
                </button>
              </div>
            </div>

            {/* Behavior Switches */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 text-xs">
                <input
                  type="checkbox"
                  checked={suddenStop}
                  onChange={(e) => setSuddenStop(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-200">Sudden Braking</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 text-xs">
                <input
                  type="checkbox"
                  checked={erraticBehavior}
                  onChange={(e) => setErraticBehavior(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-200">Erratic Swerve</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Large Visual Risk Indicator Meter */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Evaluated Risk Score
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">MODEL OUTPUT</span>
            </div>

            {/* Big Risk Display */}
            {calcResult ? (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center justify-center p-6 rounded-full bg-slate-900/80 border-4 border-slate-800 relative shadow-inner">
                  {/* Glowing circular ring */}
                  <div
                    className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
                      calcResult.risk_level === 'HIGH'
                        ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] bg-red-950/20'
                        : calcResult.risk_level === 'MEDIUM'
                        ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-amber-950/20'
                        : 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-950/20'
                    }`}
                  >
                    <span className="text-4xl font-black font-mono text-white tracking-tight">
                      {calcResult.risk_score}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">OUT OF 100</span>
                  </div>
                </div>

                <div className="mt-4">
                  <RiskBadge level={calcResult.risk_level} score={calcResult.risk_score} size="lg" />
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Causal Risk Reason:
                  </span>
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    {calcResult.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 font-mono text-xs">Computing risk metrics...</div>
            )}
          </div>

          {/* Risk Classification Legend */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800 text-center font-mono text-[10px]">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="font-bold block">0 – 30</span>
              <span className="opacity-80">LOW RISK</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span className="font-bold block">31 – 60</span>
              <span className="opacity-80">MEDIUM RISK</span>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <span className="font-bold block">61 – 100</span>
              <span className="opacity-80">HIGH RISK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions Log Table */}
      <div className="p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Recent Multi-Parameter Prediction Log
          </h3>
          <span className="text-xs font-mono text-slate-400">Auto-logged telemetry</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Prediction ID</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Speed</th>
                <th className="p-3">Distance</th>
                <th className="p-3">Density</th>
                <th className="p-3">Heading</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {recentPredictions.map((pred) => (
                <tr key={pred.predictionId || pred._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-cyan-400 font-bold">#{pred.predictionId}</td>
                  <td className="p-3 text-white font-semibold">{pred.vehicleId}</td>
                  <td className="p-3">{pred.speed} km/h</td>
                  <td className="p-3">{pred.distance} m</td>
                  <td className="p-3">{pred.density}%</td>
                  <td className="p-3">
                    <span className={pred.direction?.toLowerCase().includes('wrong') ? 'text-red-400 font-bold' : ''}>
                      {pred.direction}
                    </span>
                  </td>
                  <td className="p-3">
                    <RiskBadge level={pred.riskLevel} score={pred.riskScore} />
                  </td>
                  <td className="p-3 text-[11px] text-slate-400 max-w-xs truncate">{pred.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiskPredictionPage;
