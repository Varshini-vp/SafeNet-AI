import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  X,
  Radio,
  FileText
} from 'lucide-react';
import { alertAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { useDemo } from '../context/DemoContext';

const ActiveAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const { refreshMetrics, simulationTick } = useDemo();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertAPI.getAll({
        severity: severityFilter,
        status: statusFilter,
        limit: 50
      });
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (e) {
      console.warn('Alerts fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter, simulationTick]);

  const handleAcknowledge = async (alertId) => {
    try {
      await alertAPI.acknowledge(alertId);
      fetchAlerts();
      refreshMetrics();
    } catch (e) {}
  };

  const handleResolve = async (alertId) => {
    try {
      await alertAPI.resolve(alertId);
      fetchAlerts();
      refreshMetrics();
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Active Smart Alert Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical road risk notifications requiring authority verification, intervention, and resolution.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        {/* Severity filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">Severity:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                severityFilter === s
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">Status:</span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-3xl border border-slate-800 bg-[#111726]/90 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3.5">Alert ID</th>
              <th className="p-3.5">Location & Camera</th>
              <th className="p-3.5">Hazard Type</th>
              <th className="p-3.5">Vehicle</th>
              <th className="p-3.5">Risk Score</th>
              <th className="p-3.5">Logged Time</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {alerts.map((alert) => (
              <tr key={alert.alertId || alert._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{alert.alertId}</span>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">{alert.location}</div>
                  <div className="text-[10px] text-slate-500">{alert.cameraId}</div>
                </td>
                <td className="p-3.5 font-bold text-slate-200">
                  {alert.riskType?.replace(/_/g, ' ')}
                </td>
                <td className="p-3.5 text-amber-400 font-bold">{alert.vehicleId}</td>
                <td className="p-3.5">
                  <RiskBadge level={alert.severity} score={alert.riskScore} />
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.status === 'ACTIVE'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : alert.status === 'ACKNOWLEDGED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {alert.status}
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="View Incident Snapshot"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.alertId || alert._id)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(alert.alertId || alert._id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Incident Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white font-mono">{selectedAlert.alertId}</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Risk Assessment:</span>
                <RiskBadge level={selectedAlert.severity} score={selectedAlert.riskScore} />
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Hazard Type:</span>
                <span className="text-white font-bold">{selectedAlert.riskType?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Camera / Location:</span>
                <span className="text-cyan-400">{selectedAlert.cameraId} — {selectedAlert.location}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Vehicle Identifier:</span>
                <span className="text-amber-400 font-bold">{selectedAlert.vehicleId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">AI Reasoning:</span>
                <p className="text-slate-200">{selectedAlert.explanation}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleResolve(selectedAlert.alertId || selectedAlert._id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveAlertsPage;
