import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Square,
  Maximize2,
  Camera as CameraIcon,
  Filter,
  RefreshCw,
  AlertTriangle,
  X,
  Radio
} from 'lucide-react';
import VideoCanvas from '../components/VideoCanvas';
import RiskBadge from '../components/RiskBadge';
import { cameraAPI } from '../services/api';

const LiveMonitoringPage = () => {
  const [cameras, setCameras] = useState([]);
  const [isMonitoringAll, setIsMonitoringAll] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [fullScreenCamera, setFullScreenCamera] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const res = await cameraAPI.getAll();
      if (res.data.success) {
        setCameras(res.data.cameras);
      }
    } catch (e) {
      console.warn('Failed to load cameras, using defaults:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const filteredCameras = cameras.filter((cam) => {
    if (filter === 'HIGH') return cam.riskLevel === 'HIGH';
    if (filter === 'MEDIUM') return cam.riskLevel === 'MEDIUM';
    if (filter === 'ONLINE') return cam.status === 'ONLINE';
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Live Traffic Monitoring</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold animate-pulse">
              LIVE NETWORK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time edge video streams with bounding box vehicle detection, Kalman tracking, and incident detection.
          </p>
        </div>

        {/* Global Monitoring Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMonitoringAll(!isMonitoringAll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMonitoringAll
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isMonitoringAll ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>

          <button
            onClick={fetchCameras}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['ALL', 'HIGH', 'MEDIUM', 'ONLINE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Cameras (10)' : `${tab} RISK`}
          </button>
        ))}
      </div>

      {/* CCTV Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((cam) => (
          <div
            key={cam.cameraId}
            className="rounded-2xl bg-[#111726]/90 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="p-3 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white font-mono">{cam.cameraId}</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{cam.name}</span>
              </div>
              <RiskBadge level={cam.riskLevel} showScore={false} size="sm" />
            </div>

            {/* Video Canvas Component */}
            <div className="relative">
              <VideoCanvas
                cameraId={cam.cameraId}
                cameraName={cam.name}
                riskLevel={cam.riskLevel}
                vehicleCount={cam.vehiclesDetected || 18}
                isMonitored={isMonitoringAll}
              />
            </div>

            {/* Camera Details Footer */}
            <div className="p-3 bg-[#0f172a] border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-slate-300 truncate">{cam.location}</p>
                <p className="text-[10px] text-slate-500">Limit: {cam.speedLimit || 60} km/h • RTSP 1080p</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setFullScreenCamera(cam)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Fullscreen Stream"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Camera Modal */}
      {fullScreenCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-4xl bg-[#111726] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#0d131f] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-mono">
                  {fullScreenCamera.cameraId} — {fullScreenCamera.name} ({fullScreenCamera.location})
                </h3>
              </div>
              <button
                onClick={() => setFullScreenCamera(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black">
              <VideoCanvas
                cameraId={fullScreenCamera.cameraId}
                cameraName={fullScreenCamera.name}
                riskLevel={fullScreenCamera.riskLevel}
                vehicleCount={32}
                isMonitored={true}
              />
            </div>

            <div className="p-4 bg-[#0d131f] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Stream Protocol: RTSP / H.264 High Profile</span>
              <span className="text-cyan-400 font-bold">Detection Model: SafeNet YOLOv8-SORT Hybrid</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoringPage;
