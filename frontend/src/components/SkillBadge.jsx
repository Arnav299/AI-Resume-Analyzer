import React from 'react';
import classNames from 'classnames';

const SkillBadge = ({ skill, matched }) => (
  <span className={classNames(
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
    matched
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200'
  )}>
    <span className="text-xs">{matched ? '✓' : '✗'}</span>
    {skill}
  </span>
);

export default SkillBadge;
