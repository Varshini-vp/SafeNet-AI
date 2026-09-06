import React from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { alertAPI } from '../services/api';

const AlertBanner = ({ onNavigateToAlerts }) => {
  const { liveBannerAlert, dismissBannerAlert, refreshMetrics } = useDemo();

  if (!liveBannerAlert) return null;

  const handleAcknowledge = async () => {
    try {
      if (liveBannerAlert.alertId) {
        await alertAPI.acknowledge(liveBannerAlert.alertId);
      }
    } catch (e) {}
    refreshMetrics();
    dismissBannerAlert();
  };

  const handleView = () => {
    dismissBannerAlert();
    if (onNavigateToAlerts) {
      onNavigateToAlerts();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full animate-bounce-short">
      <div className="p-4 rounded-2xl bg-[#1a1118]/95 border-2 border-red-500/80 shadow-2xl shadow-red-950/60 backdrop-blur-xl ring-4 ring-red-500/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
                  CRITICAL INCIDENT DETECTED
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                  {liveBannerAlert.alertId || '#A1024'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                {liveBannerAlert.riskType?.replace(/_/g, ' ') || 'High Risk Traffic Anomaly'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {liveBannerAlert.explanation || 'Dangerous vehicular movement identified.'}
              </p>
              
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400">Location: {liveBannerAlert.location || 'Main Junction'}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Vehicle: {liveBannerAlert.vehicleId || 'V-108'}</span>
                <span>•</span>
                <span className="text-red-400 font-bold">Risk: {liveBannerAlert.riskScore || 91}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={dismissBannerAlert}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 pt-3 border-t border-red-500/20 flex items-center justify-end gap-2">
          <button
            onClick={handleView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Alert</span>
          </button>
          <button
            onClick={handleAcknowledge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Acknowledge</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
