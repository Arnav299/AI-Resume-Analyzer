import React, { useState, useRef, useCallback } from 'react';

const SplitPDFViewer = ({ pdfUrl, extractedText, highlights = [], candidateName = 'Candidate' }) => {
  const [zoom, setZoom] = useState(100);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const zoomIn  = () => setZoom(z => Math.min(z + 20, 200));
  const zoomOut = () => setZoom(z => Math.max(z - 20, 50));
  const zoomReset = () => setZoom(100);

  const onMouseDown = useCallback(() => { isDragging.current = true; }, []);
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct  = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.max(30, Math.min(70, pct)));
  }, []);
  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const renderHighlightedText = (text) => {
    if (!text) return <span className="text-content-muted italic">No text extracted from this resume.</span>;
    if (!highlights || highlights.length === 0) return <span className="whitespace-pre-wrap">{text}</span>;

    const pattern = highlights.filter(Boolean).map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!pattern) return <span className="whitespace-pre-wrap">{text}</span>;

    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts  = text.split(regex);

    return parts.map((part, idx) => {
      const isMatch = regex.test(part);
      regex.lastIndex = 0;
      if (isMatch) {
        return (
          <mark
            key={idx}
            onClick={() => setActiveHighlight(part)}
            className="cursor-pointer rounded px-1 py-0.5 transition-all duration-200 font-medium"
            style={{
              background: activeHighlight?.toLowerCase() === part.toLowerCase()
                ? '#bfdbfe' // blue-200
                : '#bbf7d0', // green-200
              color: '#0f172a', // slate-900
              borderBottom: activeHighlight?.toLowerCase() === part.toLowerCase() ? '2px solid #3b82f6' : '2px solid #22c55e',
            }}
          >
            {part}
          </mark>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex w-full h-[600px] overflow-hidden rounded-xl border border-border-default bg-surface shadow-sm select-none"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Left Panel: PDF Viewer ──────────────────── */}
      <div
        className="flex flex-col h-full bg-page"
        style={{ width: `${leftWidth}%`, borderRight: '1px solid #e2e8f0' }}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-default flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <span className="text-sm font-bold text-content truncate max-w-[140px]">
              {candidateName}'s Resume
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-hover rounded-lg p-1">
            <button
              onClick={zoomOut}
              className="w-7 h-7 rounded hover:bg-surface hover:shadow-sm flex items-center justify-center text-content-secondary font-bold"
            >
              −
            </button>
            <button
              onClick={zoomReset}
              className="px-2 h-7 rounded hover:bg-surface hover:shadow-sm text-xs font-bold text-content"
            >
              {zoom}%
            </button>
            <button
              onClick={zoomIn}
              className="w-7 h-7 rounded hover:bg-surface hover:shadow-sm flex items-center justify-center text-content-secondary font-bold"
            >
              +
            </button>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded hover:bg-surface hover:shadow-sm flex items-center justify-center text-content-secondary font-bold ml-1"
                title="Open in new tab"
              >
                ↗
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-surface-hover p-4 flex justify-center custom-scrollbar">
          {pdfUrl ? (
            <div style={{ width: `${zoom}%`, transformOrigin: 'top center', transition: 'width 0.2s ease-out' }}>
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                title="Resume PDF"
                className="w-full h-[800px] shadow-md border border-border-default bg-white"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-content-muted">
              <span className="text-4xl mb-4">📄</span>
              <p className="text-sm font-medium">No PDF available</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Draggable Divider ───────────────────────── */}
      <div
        onMouseDown={onMouseDown}
        className="relative z-10 flex items-center justify-center flex-shrink-0 cursor-col-resize w-1.5 hover:bg-blue-100 transition-colors group"
      >
        <div className="w-1 h-12 rounded-full bg-border-default group-hover:bg-primary transition-colors" />
      </div>

      {/* ── Right Panel: Extracted Text ─────────────── */}
      <div className="flex flex-col h-full flex-1 bg-surface">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <span className="text-sm font-bold text-content">Extracted Text</span>
          </div>
          <div className="flex items-center gap-2">
            {highlights.length > 0 && (
              <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                {highlights.length} matches
              </span>
            )}
            {activeHighlight && (
              <button
                onClick={() => setActiveHighlight(null)}
                className="text-xs font-semibold px-2 py-1 rounded-md bg-surface-hover text-content-secondary hover:bg-border-default"
              >
                Clear Focus
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-surface custom-scrollbar">
          <p className="text-sm leading-relaxed text-content font-mono whitespace-pre-wrap">
            {renderHighlightedText(extractedText)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplitPDFViewer;
