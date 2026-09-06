import React, { useState, useEffect } from 'react';
import {
  Video,
  Car,
  AlertTriangle,
  Activity,
  Gauge,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Eye,
  Layers,
  Clock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VideoCanvas from '../components/VideoCanvas';
import RiskBadge from '../components/RiskBadge';
import { useDemo } from '../context/DemoContext';
import { alertAPI, analyticsAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = ({ onNavigate }) => {
  const { metrics, demoMode, setDemoMode, triggerIncident } = useDemo();
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [densityChartData, setDensityChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [alertsRes, chartRes] = await Promise.all([
        alertAPI.getAll({ limit: 5 }),
        analyticsAPI.getTrafficDensity()
      ]);
      if (alertsRes.data.success) {
        setRecentAlerts(alertsRes.data.alerts);
      }
      if (chartRes.data.success) {
        setDensityChartData(chartRes.data.data);
      }
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      await alertAPI.acknowledge(alertId);
      fetchDashboardData();
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: SIH Command Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#111c33] via-[#0f172a] to-[#161226] border border-cyan-500/20 p-6 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                SafeNet AI • Central Road Risk Command Center
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-mono text-slate-400">Node: ORR-Hub-Delhi-NCR</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Intelligent Traffic Safety & Accident Prevention System
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-camera detection, DeepSORT trajectory tracking, behavioral anomaly classification, and preemptive collision risk alerts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('live-monitoring')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-2 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Open CCTV Wall</span>
            </button>
            <button
              onClick={() => triggerIncident('WRONG_WAY_DRIVING', 'CAM-01')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 border border-red-400/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Wrong-Way Event</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 Live Command Center Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Cameras Connected"
          value={metrics.camerasConnected}
          subtitle="10 High-Def Nodes Active"
          icon={Video}
          color="cyan"
          isLive={true}
        />
        <StatCard
          title="Vehicles Detected"
          value={metrics.vehiclesDetected}
          subtitle="Real-Time YOLOv8 Ingestion"
          icon={Car}
          color="blue"
          trend="+12/min"
          isLive={true}
        />
        <StatCard
          title="High Risk Alerts"
          value={metrics.activeHighRiskAlerts}
          subtitle="Action Required by Authority"
          icon={AlertTriangle}
          color="red"
          isLive={true}
        />
        <StatCard
          title="Traffic Density"
          value={`${metrics.currentTrafficDensity}%`}
          subtitle="Moderate-High Volume"
          icon={Gauge}
          color="amber"
          trend="Peak Flow"
        />
        <StatCard
          title="AI Inference Engine"
          value={metrics.aiEngineStatus}
          subtitle="Avg Latency: 142ms"
          icon={Activity}
          color="emerald"
          isLive={true}
        />
      </div>

      {/* Main Grid: Live Camera Stream Previews + Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Live Cameras Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Priority Camera Streams
              </h2>
            </div>
            <button
              onClick={() => onNavigate('live-monitoring')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>View All 10 Cameras</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <VideoCanvas
              cameraId="CAM-01"
              cameraName="Camera 01 – Main Junction"
              riskLevel="HIGH"
              vehicleCount={22}
              isMonitored={true}
            />
            <VideoCanvas
              cameraId="CAM-02"
              cameraName="Camera 02 – Highway Entry"
              riskLevel="MEDIUM"
              vehicleCount={34}
              isMonitored={true}
            />
          </div>

          {/* Traffic Density Trend Chart */}
          <div className="p-5 rounded-2xl bg-[#111726]/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  24-Hour Traffic Density & Velocity Flow
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Dynamic congestion analysis across key arterial corridors</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                LIVE TELEMETRY
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={densityChartData}>
                  <defs>
                    <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: '#06b6d4' }}
                  />
                  <Area type="monotone" dataKey="density" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDensity)" name="Density %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Active Critical Alerts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Active Incident Alerts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1"
            >
              <span>Manage All ({recentAlerts.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.alertId || alert._id}
                className="p-4 rounded-2xl bg-[#111726]/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {alert.riskType?.replace(/_/g, ' ')}
                        </span>
                        <RiskBadge level={alert.severity} score={alert.riskScore} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {alert.explanation || 'Anomalous movement detected by AI.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">{alert.cameraId}</span>
                    <span>•</span>
                    <span className="text-amber-400">{alert.vehicleId}</span>
                  </div>

                  {alert.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleAcknowledge(alert.alertId || alert._id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-[10px] font-semibold border border-slate-700 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[10px] font-bold">ACKNOWLEDGED</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Pipeline Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                AI Detection Pipeline Status
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              YOLOv8 vehicle detection and DeepSORT tracking running at 30 FPS. Evaluates speed, distance, lane heading, and braking deceleration in real-time.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>YOLOv8 Detection: Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SORT Tracking: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
