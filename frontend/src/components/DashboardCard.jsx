import React from 'react';
import classNames from 'classnames';

const DashboardCard = ({ title, value, icon, bgColor = 'bg-blue-50', textColor = 'text-primary', change, changeType }) => (
  <div className="stat-card animate-fade-in">
    <div className={classNames('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl', bgColor)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-content-muted font-medium truncate">{title}</p>
      <p className={classNames('text-2xl font-bold mt-0.5', textColor)}>{value}</p>
      {change !== undefined && (
        <p className={classNames('text-xs font-medium mt-1', changeType === 'up' ? 'text-success' : 'text-error')}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  </div>
);

export default DashboardCard;
