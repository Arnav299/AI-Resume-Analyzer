import React from 'react';

const colorConfig = {
  blue:   { gradient: 'from-blue-500 to-blue-600',   ring: 'ring-blue-500/20',   text: 'text-blue-600',   bg: 'bg-blue-50',   bar: 'bg-blue-500',   glow: 'shadow-blue-500/25' },
  green:  { gradient: 'from-emerald-500 to-green-600', ring: 'ring-green-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/25' },
  purple: { gradient: 'from-purple-500 to-violet-600', ring: 'ring-purple-500/20', text: 'text-purple-600', bg: 'bg-purple-50',  bar: 'bg-purple-500',  glow: 'shadow-purple-500/25' },
  orange: { gradient: 'from-orange-400 to-amber-500', ring: 'ring-orange-500/20',  text: 'text-orange-600', bg: 'bg-orange-50',  bar: 'bg-orange-500',  glow: 'shadow-orange-500/25' },
  red:    { gradient: 'from-red-500 to-rose-600',     ring: 'ring-red-500/20',    text: 'text-red-600',   bg: 'bg-red-50',    bar: 'bg-red-500',    glow: 'shadow-red-500/25' },
  gray:   { gradient: 'from-slate-400 to-slate-500',  ring: 'ring-slate-500/20',  text: 'text-content-secondary', bg: 'bg-page',  bar: 'bg-border-default',  glow: 'shadow-slate-500/25' },
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', subtitle, progress }) => {
  const c = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`relative bg-surface rounded-2xl border border-border-subtle p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg ${c.glow} hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group`}>
      {/* Subtle background glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-content-muted uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-md ${c.glow}`}>
            <Icon size={18} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-content leading-none tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-content-muted mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div>
          <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${c.bar} transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-xs text-content-muted mt-1">{progress}% of target</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;
