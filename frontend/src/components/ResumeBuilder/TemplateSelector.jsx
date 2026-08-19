import React from 'react';

const templates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-[35%] bg-[#1E3A8A] flex flex-col items-center pt-2 gap-1 px-1">
          <div className="w-5 h-5 bg-surface/40 rounded-full" />
          <div className="w-full h-0.5 bg-surface/20 mt-1" />
          <div className="w-3/4 h-0.5 bg-surface/15" />
          <div className="w-3/4 h-0.5 bg-surface/15" />
          <div className="w-full h-0.5 bg-surface/20 mt-1" />
          <div className="w-3/4 h-0.5 bg-surface/15" />
          <div className="w-3/4 h-0.5 bg-surface/15" />
        </div>
        <div className="flex-1 bg-page flex flex-col gap-1 p-1.5">
          <div className="w-full h-1 bg-[#1E3A8A]/70 rounded" />
          <div className="w-3/4 h-0.5 bg-border-default rounded" />
          <div className="w-full h-px bg-surface-hover mt-0.5" />
          <div className="w-full h-0.5 bg-surface-hover rounded" />
          <div className="w-5/6 h-0.5 bg-surface-hover rounded" />
          <div className="w-4/5 h-0.5 bg-surface-hover rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'ats',
    name: 'ATS Classic',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-[30%] bg-surface flex flex-col items-center pt-2 gap-1 px-1">
          <div className="w-5 h-5 bg-surface/30 rounded-full" />
          <div className="w-full h-0.5 bg-surface/15 mt-1" />
          <div className="w-3/4 h-0.5 bg-surface/10" />
          <div className="w-3/4 h-0.5 bg-surface/10" />
        </div>
        <div className="flex-1 bg-surface flex flex-col gap-1 p-1.5">
          <div className="w-full h-1 bg-gray-700/80 rounded" />
          <div className="w-3/4 h-0.5 bg-border-default rounded" />
          <div className="w-full h-px bg-surface-hover mt-0.5" />
          <div className="w-full h-0.5 bg-surface-hover rounded" />
          <div className="w-5/6 h-0.5 bg-surface-hover rounded" />
          <div className="w-4/5 h-0.5 bg-surface-hover rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'executive',
    name: 'Executive',
    preview: (
      <div className="w-full h-full flex flex-col">
        <div className="w-full bg-[#0F172A] flex flex-col items-center justify-center py-2 gap-0.5 border-b-2 border-[#D4AF37]">
          <div className="w-4 h-4 bg-surface/30 rounded-full" />
          <div className="w-2/3 h-0.5 bg-surface/40 rounded" />
          <div className="w-1/2 h-0.5 bg-[#D4AF37]/60 rounded" />
        </div>
        <div className="flex-1 bg-surface flex flex-col gap-1 p-1.5">
          <div className="w-full h-0.5 bg-border-default rounded" />
          <div className="w-5/6 h-0.5 bg-surface-hover rounded" />
          <div className="w-full h-px bg-surface-hover mt-0.5" />
          <div className="w-full h-0.5 bg-surface-hover rounded" />
          <div className="w-4/5 h-0.5 bg-surface-hover rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-[35%] bg-[#252525] flex flex-col items-center pt-2 gap-1 px-1">
          <div className="w-5 h-5 bg-surface/20 rounded-full" />
          <div className="w-full h-0.5 bg-[#b74127]/50 mt-1" />
          <div className="w-3/4 h-0.5 bg-surface/10" />
          <div className="w-3/4 h-0.5 bg-surface/10" />
          <div className="w-full h-0.5 bg-[#b74127]/50 mt-1" />
          <div className="w-3/4 h-0.5 bg-surface/10" />
        </div>
        <div className="flex-1 bg-[#F8F9FA] flex flex-col gap-1 p-1.5">
          <div className="w-full h-1 bg-gray-700/80 rounded" />
          <div className="w-3/4 h-0.5 bg-border-default rounded" />
          <div className="w-full h-px bg-border-default mt-0.5" />
          <div className="w-full h-0.5 bg-surface-hover rounded" />
          <div className="w-5/6 h-0.5 bg-surface-hover rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'creative',
    name: 'Creative',
    preview: (
      <div className="w-full h-full flex flex-col">
        <div className="w-full bg-[#b88d6d] flex flex-col items-end justify-center py-1.5 px-1.5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[35%] bg-[#d5c4b3]" />
          <div className="relative z-10 text-right">
            <div className="w-8 h-0.5 bg-surface/80 rounded ml-auto" />
            <div className="w-6 h-0.5 bg-surface/60 rounded ml-auto mt-0.5" />
          </div>
        </div>
        <div className="flex-1 flex bg-[#fffaf7]">
          <div className="w-[32%] bg-[#d5c4b3]/30 flex flex-col gap-1 p-1 pt-2">
            <div className="w-4 h-4 bg-[#b88d6d]/30 rounded-full mx-auto" />
            <div className="w-full h-0.5 bg-[#b88d6d]/40" />
            <div className="w-3/4 h-0.5 bg-border-default" />
          </div>
          <div className="flex-1 flex flex-col gap-1 p-1.5 pt-2">
            <div className="w-full h-0.5 bg-border-default" />
            <div className="w-5/6 h-0.5 bg-surface-hover" />
            <div className="w-full h-0.5 bg-surface-hover" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'student',
    name: 'Student / Fresher',
    preview: (
      <div className="w-full h-full flex flex-col border-t-2 border-[#10B981]">
        <div className="p-1.5 flex flex-col gap-0.5">
          <div className="w-2/3 h-1 bg-gray-700/80 rounded" />
          <div className="w-1/2 h-0.5 bg-[#10B981]/60 rounded" />
          <div className="w-full h-0.5 bg-surface-hover border border-border-default rounded mt-0.5" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1 px-1.5 pb-1">
          <div className="flex flex-col gap-0.5">
            <div className="w-full h-0.5 bg-surface-hover" />
            <div className="w-3/4 h-0.5 bg-surface-hover" />
            <div className="w-full h-0.5 bg-[#10B981]/30 rounded" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="w-full h-0.5 bg-surface-hover" />
            <div className="w-5/6 h-0.5 bg-surface-hover" />
            <div className="w-4/5 h-0.5 bg-surface-hover" />
          </div>
        </div>
      </div>
    ),
  },
];

const TemplateSelector = ({ selected, onSelect }) => {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-end gap-3 overflow-x-auto pb-1 custom-scrollbar">
        {templates.map((tpl) => {
          const isSelected = selected === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className={`
                relative flex flex-col items-center gap-1.5 flex-shrink-0
                transition-all duration-200 outline-none group
              `}
            >
              {/* Card Thumbnail */}
              <div
                className={`
                  w-[70px] h-[90px] rounded-md overflow-hidden
                  transition-all duration-200
                  ${isSelected
                    ? 'ring-2 ring-[#6C63FF] shadow-[0_0_14px_rgba(108,99,255,0.6)] scale-105'
                    : 'ring-1 ring-white/10 opacity-60 hover:opacity-90 hover:ring-white/25 hover:scale-102'
                  }
                `}
              >
                {tpl.preview}
              </div>

              {/* Label */}
              <span className={`
                text-[9px] font-semibold text-center leading-tight max-w-[74px] transition-colors
                ${isSelected ? 'text-[#6C63FF]' : 'text-white/50 group-hover:text-white/80'}
              `}>
                {tpl.name}
              </span>

              {/* Selected dot */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#6C63FF] rounded-full border-2 border-[#0F1423] flex items-center justify-center">
                  <div className="w-1 h-1 bg-surface rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
