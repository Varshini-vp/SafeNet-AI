import React from 'react';

const RiskBadge = ({ level, score, showScore = true, size = 'sm' }) => {
  const norm = (level || 'LOW').toUpperCase();

  const styles = {
    LOW: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'LOW RISK'
    },
    MEDIUM: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'MED RISK'
    },
    HIGH: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/40',
      dot: 'bg-red-500 animate-ping',
      label: 'HIGH RISK'
    }
  };

  const current = styles[norm] || styles.LOW;
  const isSm = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded-lg border ${current.bg} ${current.text} ${current.border} ${
      isSm ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-xs'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-bold ml-0.5">({score}%)</span>
      )}
    </span>
  );
};

export default RiskBadge;
