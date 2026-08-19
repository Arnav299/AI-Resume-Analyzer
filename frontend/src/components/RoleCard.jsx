import React from 'react';
import Button from './Button';

const RoleCard = ({ role, description, skills, icon, onSelect, selected }) => (
  <div className={`card cursor-pointer transition-all duration-200 animate-slide-up ${selected ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20' : 'hover:border-primary/40'}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-textDark text-lg leading-tight">{role}</h3>
          {selected && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Selected ✓</span>}
        </div>
      </div>
    </div>

    <p className="text-sm text-content-muted mb-4 leading-relaxed">{description}</p>

    <div className="mb-5">
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Required Skills</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="badge-primary text-xs">{skill}</span>
        ))}
      </div>
    </div>

    <Button
      variant={selected ? 'success' : 'primary'}
      className="w-full text-sm"
      onClick={() => onSelect(role)}
    >
      {selected ? '✓ Selected' : 'Select Role'}
    </Button>
  </div>
);

export default RoleCard;
