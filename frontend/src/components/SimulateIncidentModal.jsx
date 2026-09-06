import React, { useState } from 'react';
import { AlertTriangle, X, Play, ShieldAlert, Zap, Navigation, Clock } from 'lucide-react';
import { useDemo } from '../context/DemoContext';

const INCIDENTS = [
  {
    type: 'WRONG_WAY_DRIVING',
    title: 'Wrong-Way Vehicle',
    desc: 'Vehicle moving against assigned traffic lane at 74 km/h',
    severity: 'HIGH',
    score: 94,
    defaultVehicle: 'V-108'
  },
  {
    type: 'OVERSPEEDING',
    title: 'High Velocity Overspeeding',
    desc: 'Speed violation exceeding road limit by +38 km/h',
    severity: 'HIGH',
    score: 88,
    defaultVehicle: 'V-204'
  },
  {
    type: 'CLOSE_PROXIMITY',
    title: 'Critical Proximity / Tailgating',
    desc: 'Headway distance reduced below 2.8m in highway flow',
    severity: 'MEDIUM',
    score: 58,
    defaultVehicle: 'V-103'
  },
  {
    type: 'SUDDEN_STOP',
    title: 'Sudden Emergency Braking',
    desc: 'Hard deceleration in middle lane causing collision hazard',
    severity: 'HIGH',
    score: 82,
    defaultVehicle: 'V-301'
  },
  {
    type: 'ERRATIC_BEHAVIOUR',
    title: 'Erratic Lane Swerving',
    desc: 'Zig-zag steering and rapid unindicated lane change',
    severity: 'MEDIUM',
    score: 64,
    defaultVehicle: 'V-106'
  },
  {
    type: 'HIGH_TRAFFIC_DENSITY',
    title: 'Severe Bottleneck Congestion',
    desc: 'Density exceeds 88% capacity at junction intersection',
    severity: 'MEDIUM',
    score: 55,
    defaultVehicle: 'V-110'
  }
];

const SimulateIncidentModal = ({ onClose }) => {
  const { triggerIncident } = useDemo();
  const [selectedType, setSelectedType] = useState('WRONG_WAY_DRIVING');
  const [selectedCamera, setSelectedCamera] = useState('CAM-01');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectedResult, setInjectedResult] = useState(null);

  const handleSimulate = async () => {
    setIsInjecting(true);
    const res = await triggerIncident(selectedType, selectedCamera);
    setIsInjecting(false);
    if (res.success) {
      setInjectedResult(res.alert);
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simulate Live SIH Incident</h3>
              <p className="text-xs text-slate-400">Inject real-time road risk scenario into AI pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              1. Select CCTV Camera Node
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="CAM-01">Camera 01 – Main Junction (Outer Ring)</option>
              <option value="CAM-02">Camera 02 – Highway Entry (Expressway Toll)</option>
              <option value="CAM-03">Camera 03 – City Center (Metro Plaza)</option>
              <option value="CAM-04">Camera 04 – School Zone (Sector 14)</option>
              <option value="CAM-05">Camera 05 – Industrial Corridor Flyover</option>
              <option value="CAM-06">Camera 06 – Ring Road Bypass Ramp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              2. Select Hazard Scenario
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {INCIDENTS.map((inc) => {
                const isSelected = selectedType === inc.type;
                return (
                  <button
                    key={inc.type}
                    type="button"
                    onClick={() => setSelectedType(inc.type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-500/10 ring-1 ring-red-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{inc.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        inc.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {inc.score}% Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{inc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {injectedResult && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Incident injected! Alert {injectedResult.alertId} dispatched to dashboard.</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={isInjecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all border border-red-400/30 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isInjecting ? 'Processing AI Pipeline...' : 'Trigger Hazard Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulateIncidentModal;
