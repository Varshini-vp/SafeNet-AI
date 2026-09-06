import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter, Calendar, Camera, ShieldAlert, CheckCircle } from 'lucide-react';
import { alertAPI, vehicleAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const ReportsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [cameraFilter, setCameraFilter] = useState('ALL');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('today');

  const fetchReportData = async () => {
    try {
      const res = await alertAPI.getAll({
        cameraId: cameraFilter,
        riskType: riskTypeFilter,
        severity: severityFilter,
        limit: 100
      });
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (e) {
      console.warn('Report fetch error:', e);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [cameraFilter, riskTypeFilter, severityFilter, dateFilter]);

  // Aggregate Metrics
  const totalAlerts = alerts.length;
  const highRiskCount = alerts.filter(a => a.severity === 'HIGH').length;
  const mediumRiskCount = alerts.filter(a => a.severity === 'MEDIUM').length;
  const lowRiskCount = alerts.filter(a => a.severity === 'LOW').length;

  const exportCSV = () => {
    const headers = ['Alert ID', 'Camera ID', 'Location', 'Vehicle ID', 'Risk Type', 'Severity', 'Risk Score', 'Status', 'Timestamp', 'Explanation'];
    const rows = alerts.map(a => [
      a.alertId || '',
      a.cameraId || '',
      `"${a.location || ''}"`,
      a.vehicleId || '',
      a.riskType || '',
      a.severity || '',
      a.riskScore || '',
      a.status || '',
      a.timestamp || '',
      `"${a.explanation || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafeNet_AI_Road_Safety_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Reports & Incident Intelligence</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditable road risk analytics, incident records, and official authority export dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Vehicles</span>
          <span className="text-lg font-bold font-mono text-white mt-1 block">1,842</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Alerts</span>
          <span className="text-lg font-bold font-mono text-cyan-400 mt-1 block">{totalAlerts}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">High Risk</span>
          <span className="text-lg font-bold font-mono text-red-400 mt-1 block">{highRiskCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Medium Risk</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">{mediumRiskCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Low Risk</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">{lowRiskCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800 col-span-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Most Dangerous Location</span>
          <span className="text-xs font-bold font-mono text-white mt-1 block truncate">Outer Ring - Junction 4</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#111726]/90 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Avg Density</span>
          <span className="text-lg font-bold font-mono text-cyan-300 mt-1 block">72%</span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="p-4 rounded-2xl bg-[#111726]/90 border border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
          >
            <option value="today">Today (24 Hours)</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">Current Month</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Camera:</span>
          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
          >
            <option value="ALL">All Cameras</option>
            <option value="CAM-01">CAM-01 (Main Junction)</option>
            <option value="CAM-02">CAM-02 (Highway Toll)</option>
            <option value="CAM-05">CAM-05 (Industrial Flyover)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Hazard:</span>
          <select
            value={riskTypeFilter}
            onChange={(e) => setRiskTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
          >
            <option value="ALL">All Risk Types</option>
            <option value="WRONG_WAY_DRIVING">Wrong-Way Driving</option>
            <option value="OVERSPEEDING">Overspeeding</option>
            <option value="CLOSE_PROXIMITY">Close Proximity</option>
            <option value="SUDDEN_STOP">Sudden Stop</option>
          </select>
        </div>
      </div>

      {/* Incident Records Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111726]/90 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Alert ID</th>
              <th className="p-3">Location & Camera</th>
              <th className="p-3">Hazard Category</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Risk Assessment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {alerts.map((a) => (
              <tr key={a.alertId || a._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-bold text-red-400">{a.alertId}</td>
                <td className="p-3">
                  <div className="font-semibold text-white">{a.location}</div>
                  <div className="text-[10px] text-slate-500">{a.cameraId}</div>
                </td>
                <td className="p-3 font-bold text-slate-200">{a.riskType?.replace(/_/g, ' ')}</td>
                <td className="p-3 text-amber-400">{a.vehicleId}</td>
                <td className="p-3">
                  <RiskBadge level={a.severity} score={a.riskScore} />
                </td>
                <td className="p-3">
                  <span className="text-emerald-400 text-[10px] font-bold">{a.status}</span>
                </td>
                <td className="p-3 text-slate-400 text-[11px]">
                  {new Date(a.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
