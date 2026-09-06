import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'cyan', isLive = false }) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5',
      glow: 'group-hover:border-cyan-500/40',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-400'
    },
    emerald: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      glow: 'group-hover:border-emerald-500/40',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400'
    },
    amber: {
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      glow: 'group-hover:border-amber-500/40',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400'
    },
    red: {
      border: 'border-red-500/20',
      bg: 'bg-red-500/5',
      glow: 'group-hover:border-red-500/40',
      text: 'text-red-400',
      badge: 'bg-red-500/10 text-red-400'
    },
    blue: {
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5',
      glow: 'group-hover:border-blue-500/40',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400'
    }
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative p-5 rounded-2xl bg-[#111726]/80 backdrop-blur border ${scheme.border} ${scheme.glow} transition-all duration-200 group shadow-lg shadow-black/20 overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{title}</span>
            {isLive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
            <span>{value}</span>
            {trend && (
              <span className={`text-[11px] font-medium ${scheme.text}`}>{trend}</span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-500 font-mono">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${scheme.bg} border ${scheme.border} flex items-center justify-center shrink-0 ${scheme.text} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Subtle corner light accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />
    </div>
  );
};

export default StatCard;
