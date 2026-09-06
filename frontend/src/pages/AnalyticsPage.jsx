import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, RefreshCw } from 'lucide-react';
import { analyticsAPI, cameraAPI } from '../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AnalyticsPage = () => {
  const [distributionData, setDistributionData] = useState([]);
  const [riskTypesData, setRiskTypesData] = useState([]);
  const [trafficDensityData, setTrafficDensityData] = useState([]);
  const [hourlyRiskData, setHourlyRiskData] = useState([]);
  const [cameraRiskData, setCameraRiskData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [distRes, typesRes, densityRes, hourlyRes, camsRes] = await Promise.all([
        analyticsAPI.getRiskDistribution(),
        analyticsAPI.getRiskTypes(),
        analyticsAPI.getTrafficDensity(),
        analyticsAPI.getHourlyRisk(),
        cameraAPI.getAll()
      ]);

      if (distRes.data.success) setDistributionData(distRes.data.data);
      if (typesRes.data.success) setRiskTypesData(typesRes.data.data);
      if (densityRes.data.success) setTrafficDensityData(densityRes.data.data);
      if (hourlyRes.data.success) setHourlyRiskData(hourlyRes.data.data);

      if (camsRes.data.success) {
        setCameraRiskData(camsRes.data.cameras.map((c) => ({
          name: c.cameraId,
          risk: c.riskLevel === 'HIGH' ? 88 : (c.riskLevel === 'MEDIUM' ? 52 : 24),
          vehicles: c.vehiclesDetected || 120
        })));
      }
    } catch (e) {
      console.warn('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Traffic Analytics & Risk Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated historical and real-time road safety trends powered by Recharts telemetry engines.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of 6 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Vehicle Count Over Time (Line Chart) */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Vehicle Count Timeline
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">LINE CHART</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficDensityData}>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="vehicles" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} name="Vehicles" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Risk Distribution (Donut / Pie Chart) */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Risk Level Distribution
            </h3>
            <span className="text-[10px] font-mono text-amber-400">DONUT CHART</span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Risk Types Breakdown (Bar Chart) */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Hazard Incident Categories
            </h3>
            <span className="text-[10px] font-mono text-red-400">BAR CHART</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskTypesData}>
                <XAxis dataKey="type" stroke="#475569" fontSize={9} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Incidents Logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Traffic Density Area Chart */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Corridor Traffic Density (%)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">AREA CHART</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficDensityData}>
                <defs>
                  <linearGradient id="areaDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="density" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#areaDensity)" name="Density %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Hourly Risk Index (Bar / Line) */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Hourly Risk Score & Prevention Index
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">HOURLY TREND</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyRiskData}>
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="riskIndex" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Risk Index" />
                <Bar dataKey="accidentsPrevented" fill="#10b981" radius={[4, 4, 0, 0]} name="Alert Interventions" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Camera-wise Risk Comparison */}
        <div className="p-5 rounded-3xl bg-[#111726]/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Node-Wise Risk Comparison (CAM-01 to CAM-10)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">NODE COMPARISON</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cameraRiskData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="risk" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Camera Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
