import React, { useState, useEffect } from 'react';
import { Car, Navigation, Activity, Search, Filter, ShieldAlert, RefreshCw, Layers } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const VehicleTrackingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [liveTracks, setLiveTracks] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('CAM-01');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const [allRes, liveRes] = await Promise.all([
        vehicleAPI.getAll({ cameraId: selectedCamera, limit: 30 }),
        vehicleAPI.getLive(selectedCamera)
      ]);
      if (allRes.data.success) {
        setVehicles(allRes.data.vehicles);
      }
      if (liveRes.data.success) {
        setLiveTracks(liveRes.data.vehicles);
      }
    } catch (e) {
      console.warn('Vehicle tracking fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 5000);
    return () => clearInterval(interval);
  }, [selectedCamera]);

  const filteredVehicles = vehicles.filter((v) => {
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
    if (statusFilter !== 'ALL') {
      const isHazard = v.riskScore > 60 || v.direction?.toLowerCase().includes('wrong');
      if (statusFilter === 'HAZARD' && !isHazard) return false;
      if (statusFilter === 'TRACKING' && isHazard) return false;
    }
    if (searchTerm && !v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Vehicle Detection & Tracking (SORT/DeepSORT)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kalman filter multi-object tracking associating continuous vehicle IDs, trajectory vectors, and lane positions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="CAM-01">Node: CAM-01 (Main Junction)</option>
            <option value="CAM-02">Node: CAM-02 (Highway Toll)</option>
            <option value="CAM-03">Node: CAM-03 (City Center)</option>
            <option value="CAM-04">Node: CAM-04 (School Zone)</option>
          </select>
          <button
            onClick={fetchVehicles}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visual Lane Trajectory Simulator (SORT Visual Representation) */}
      <div className="p-6 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Live Highway Lane Trajectory Radar
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Simulated 3-Lane Corridor with Kalman velocity vectors</p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            DEEPSORT ENGINE ACTIVE
          </span>
        </div>

        {/* 3-Lane Road Visualizer */}
        <div className="relative h-48 bg-[#0a0f1d] rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between py-2">
          {/* Lane 1 */}
          <div className="h-14 border-b border-dashed border-slate-700/60 relative flex items-center px-4">
            <span className="absolute left-2 text-[10px] font-mono text-slate-600">LANE 1 (FAST)</span>
            <div className="w-full relative h-full flex items-center">
              {liveTracks.filter(t => t.lane === 1).map((trk, i) => (
                <div
                  key={trk.vehicleId}
                  style={{ left: `${(i * 30 + 15) % 85}%` }}
                  className="absolute flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 shadow-lg text-xs font-mono"
                >
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-bold">{trk.vehicleId}</span>
                  <span className="text-cyan-400 text-[10px]">{trk.speed} km/h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lane 2 (Contains Hazard / Wrong Way Vehicle) */}
          <div className="h-14 border-b border-dashed border-slate-700/60 relative flex items-center px-4 bg-red-950/5">
            <span className="absolute left-2 text-[10px] font-mono text-slate-600">LANE 2 (MID)</span>
            <div className="w-full relative h-full flex items-center">
              {liveTracks.filter(t => t.lane === 2).map((trk, i) => {
                const isHazard = trk.riskScore > 60 || trk.direction?.toLowerCase().includes('wrong');
                return (
                  <div
                    key={trk.vehicleId}
                    style={{ left: `${(i * 35 + 25) % 85}%` }}
                    className={`absolute flex items-center gap-2 p-1.5 rounded-lg border shadow-lg text-xs font-mono ${
                      isHazard
                        ? 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-500/30 animate-pulse'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Car className={`w-3.5 h-3.5 ${isHazard ? 'text-red-400' : 'text-slate-400'}`} />
                    <span className="font-bold">{trk.vehicleId}</span>
                    <span className="text-[10px]">{trk.speed} km/h</span>
                    {isHazard && <span className="text-[9px] font-bold text-red-400">HAZARD</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lane 3 */}
          <div className="h-14 relative flex items-center px-4">
            <span className="absolute left-2 text-[10px] font-mono text-slate-600">LANE 3 (SLOW)</span>
            <div className="w-full relative h-full flex items-center">
              {liveTracks.filter(t => t.lane === 3).map((trk, i) => (
                <div
                  key={trk.vehicleId}
                  style={{ left: `${(i * 28 + 10) % 85}%` }}
                  className="absolute flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 shadow-lg text-xs font-mono"
                >
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-bold">{trk.vehicleId}</span>
                  <span className="text-amber-400 text-[10px]">{trk.speed} km/h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">Type:</span>
          {['ALL', 'Car', 'Bike', 'Bus', 'Truck', 'Auto-rickshaw'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                typeFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Vehicle ID..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Tracking Registry Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111726]/90 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3.5">Vehicle ID</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Speed</th>
              <th className="p-3.5">Lane</th>
              <th className="p-3.5">Heading Direction</th>
              <th className="p-3.5">Proximity Gap</th>
              <th className="p-3.5">Tracking Status</th>
              <th className="p-3.5">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {filteredVehicles.map((v) => {
              const isHazard = v.riskScore > 60 || v.direction?.toLowerCase().includes('wrong');
              return (
                <tr key={v._id || v.vehicleId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{v.vehicleId}</span>
                  </td>
                  <td className="p-3.5 text-white font-semibold">{v.type}</td>
                  <td className="p-3.5">
                    <span className={v.speed > 70 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      {v.speed} km/h
                    </span>
                  </td>
                  <td className="p-3.5">Lane {v.lane}</td>
                  <td className="p-3.5">
                    <span className={v.direction?.toLowerCase().includes('wrong') ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {v.direction}
                    </span>
                  </td>
                  <td className="p-3.5">{v.distance} m</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isHazard
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isHazard ? 'HAZARD TRACK' : 'TRACKING'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <RiskBadge level={v.riskLevel} score={v.riskScore} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleTrackingPage;
