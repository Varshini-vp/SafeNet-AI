import React from 'react';
import {
  LayoutDashboard,
  Video,
  Cpu,
  Car,
  TrendingUp,
  BellRing,
  MapPin,
  BarChart3,
  FileText,
  Camera,
  Activity,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';

const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { role } = useAuth();
  const { activeAlertsCount } = useDemo();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, badge: 'LIVE' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Cpu },
    { id: 'vehicles', label: 'Vehicles & Tracking', icon: Car },
    { id: 'risk-predictions', label: 'Risk Predictions', icon: TrendingUp },
    { id: 'alerts', label: 'Active Alerts', icon: AlertCircle, count: activeAlertsCount },
    { id: 'hotspots', label: 'Risk Hotspots', icon: MapPin },
    { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'cameras', label: 'Camera Network', icon: Camera },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Thresholds & Config', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3">
        <div className="px-3 pb-3 mb-2 border-b border-slate-800/60">
          <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
            Command Modules
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role and SIH Badge footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-slate-200 truncate">SafeNet Engine v2.4</p>
            <p className="text-[10px] text-slate-500 font-mono">Edge + YOLOv8 + ML</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
