import React, { useRef, useState } from 'react';

const UploadArea = ({ onFileSelect, accept = '.pdf,.doc,.docx', maxSizeMB = 5 }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const validate = (file) => {
    if (!file) return 'No file selected.';
    const ext = file.name.split('.').pop().toLowerCase();
    
    // Parse accept string into array of allowed extensions (without dots)
    const allowedExts = accept.split(',').map(a => a.trim().replace('.', '').toLowerCase());
    
    if (!allowedExts.includes(ext)) {
      return `Only ${allowedExts.join(', ').toUpperCase()} files are accepted.`;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) return `File size must be under ${maxSizeMB}MB.`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    onFileSelect(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-primary bg-blue-50/50' : 'border-border-default hover:border-primary hover:bg-blue-50/50'}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${isDragActive ? 'bg-primary/20 scale-110' : 'bg-surface-hover'}`}>
            📄
          </div>
          <div>
            <p className="text-lg font-semibold text-textDark">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="text-sm text-content-muted mt-1">
              {isDragActive ? 'Release to upload' : 'Drag and drop or click to browse files'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-content-muted">
            <span className="flex items-center gap-1">✓ {accept.split(',').map(a => a.replace('.', '').toUpperCase()).join(', ')}</span>
            <span className="flex items-center gap-1">✓ Max {maxSizeMB}MB</span>
          </div>
          <button
            type="button"
            className="btn-secondary text-sm py-2 px-6 pointer-events-none"
          >
            Browse Files
          </button>
        </div>
      </div>
      {error && <p className="text-error text-sm mt-2 font-medium">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = null; // reset to allow re-uploading the same file
        }}
      />
    </div>
  );
};

export default UploadArea;
