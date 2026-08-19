import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { uploadWizardAPI, resumeAPI, jdAPI, jobsAPI } from '../services/api';
import { FolderUp, FileUp, X, RotateCw, CheckCircle, AlertCircle, FileText, UploadCloud, Folder } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTS = ['.pdf', '.doc', '.docx'];

const UploadWizard = ({ selectedJdId, onUploadStart, onComplete }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hidden input ref for folder selection
  const folderInputRef = useRef(null);

  // Status updaters
  const updateFileStatus = (id, progress, status, error = null) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress, status, error } : f))
    );
  };

  // Helper to validate a file manually
  const isValidFile = (file) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isAllowedExt = ALLOWED_EXTS.includes(ext);
    const isAllowedSize = file.size <= MAX_FILE_SIZE;
    return { valid: isAllowedExt && isAllowedSize, isAllowedExt, isAllowedSize };
  };

  // Common handler for both Dropzone (drag & drop / file picker) and Folder Picker
  const handleIncomingFiles = useCallback((incomingFiles) => {
    let validCount = 0;
    let skippedExt = 0;
    let skippedSize = 0;
    let skippedDup = 0;

    setFiles((prev) => {
      const newFiles = [];
      const currentNamesSizes = new Set(prev.map(p => `${p.file.name}-${p.file.size}`));

      incomingFiles.forEach((file) => {
        const { valid, isAllowedExt, isAllowedSize } = isValidFile(file);
        
        if (!isAllowedExt) {
          skippedExt++;
          return;
        }
        if (!isAllowedSize) {
          skippedSize++;
          return;
        }

        const uniqueKey = `${file.name}-${file.size}`;
        if (currentNamesSizes.has(uniqueKey)) {
          skippedDup++;
          return;
        }

        currentNamesSizes.add(uniqueKey);
        validCount++;

        // Determine source folder if applicable (webkitRelativePath contains full path)
        let sourceFolder = '';
        if (file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split('/');
          if (parts.length > 1) {
            // Drop the filename, keep the directory structure
            sourceFolder = parts.slice(0, -1).join('/');
          }
        }

        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          sourceFolder,
          progress: 0,
          status: 'pending', // pending, uploading, parsing, analyzing, success, error
          error: null
        });
      });
      return [...prev, ...newFiles];
    });

    // Notify user of results
    if (validCount > 0) {
      toast.success(`Added ${validCount} file(s) to the queue.`);
    }
    
    // Consolidate warnings
    if (skippedExt > 0 || skippedSize > 0 || skippedDup > 0) {
      const warnings = [];
      if (skippedExt > 0) warnings.push(`${skippedExt} unsupported format(s)`);
      if (skippedSize > 0) warnings.push(`${skippedSize} exceeded 10MB`);
      if (skippedDup > 0) warnings.push(`${skippedDup} duplicate(s)`);
      toast.error(`Skipped: ${warnings.join(', ')}`, { duration: 5000 });
    }
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    // react-dropzone handles deep extraction of folders if dropped
    handleIncomingFiles(acceptedFiles);
  }, [handleIncomingFiles]);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    noClick: true, // We will manually trigger clicks to have two separate buttons
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    // We don't strictly set maxSize here because we do manual validation to show aggregate toasts
  });

  const handleFolderSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFiles(Array.from(e.target.files));
    }
    // Reset input so the same folder can be picked again if needed
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const retryFile = (id) => {
    setFiles((prev) => prev.map(f => f.id === id ? { ...f, status: 'pending', error: null, progress: 0 } : f));
  };

  const handleUploadAndAnalyze = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    if (!selectedJdId) {
      toast.error('Please select a Job Description first');
      return;
    }

    setIsProcessing(true);
    if (onUploadStart) onUploadStart();

    let successCount = 0;

    // Process sequentially (could be parallelized, but sequential is safer for DB locks/resources)
    for (const fileObj of pendingFiles) {
      try {
        updateFileStatus(fileObj.id, 10, 'uploading');

        let uploadRes;
        try {
          uploadRes = await uploadWizardAPI.uploadSingle(fileObj.file, (pct) => {
            updateFileStatus(fileObj.id, 10 + Math.floor(pct * 0.4), 'uploading');
          });
        } catch (uploadErr) {
          const detail = uploadErr?.response?.data?.detail;
          const msg = typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
              : uploadErr?.message || 'Upload failed';
          throw new Error(`Upload failed: ${msg}`);
        }

        const resumeId = uploadRes.data?.id || uploadRes.data?.resume_id || uploadRes.data?.file_id;
        if (!resumeId) throw new Error('Upload succeeded but server returned no resume ID. Check backend logs.');

        updateFileStatus(fileObj.id, 55, 'analyzing');

        try {
          const analyzeRes = await resumeAPI.analyze(resumeId, { target_jd_id: selectedJdId });
          const jobId = analyzeRes.data?.job_id;

          // Poll until the background analysis task completes
          if (jobId) {
            let isDone = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 60; // 60 * 2s = 2 minutes max per file
            while (!isDone && attempts < MAX_ATTEMPTS) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
              try {
                const statusRes = await jobsAPI.getStatus(jobId);
                const currentStatus = statusRes.data?.status;
                if (currentStatus === 'Completed') {
                  isDone = true;
                } else if (currentStatus === 'Failed' || currentStatus === 'Error') {
                  throw new Error(`Analysis failed: ${statusRes.data?.result?.error || 'Analysis failed on server'}`);
                }
                // If 'Pending' or 'Processing', keep polling
              } catch (pollErr) {
                if (pollErr?.message?.includes('Analysis failed')) throw pollErr;
                // Ignore transient network errors during polling
              }
            }
            if (!isDone) {
              throw new Error('Analysis timed out. The server may be overloaded.');
            }
          }
        } catch (analyzeErr) {
          const detail = analyzeErr?.response?.data?.detail;
          const msg = typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
              : analyzeErr?.message || 'Analysis request failed';
          throw new Error(`Analysis failed: ${msg}`);
        }

        updateFileStatus(fileObj.id, 100, 'success');
        successCount++;
      } catch (err) {
        const errMsg = err?.message || 'Processing failed';
        updateFileStatus(fileObj.id, 0, 'error', errMsg);
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      // All analyses are confirmed complete (polled to Completed status).
      // NOW trigger the Ranking Engine — guaranteed to have data to rank.
      try {
        await jdAPI.rank(selectedJdId);
        toast.success(`🏆 AI Ranking Engine completed for ${successCount} candidate(s)!`);
      } catch (rankErr) {
        console.error('Ranking Engine error:', rankErr);
        // Don't block the user — ranking is a background enhancement
      }
    }

    const allSucceeded = successCount === pendingFiles.length;
    if (!allSucceeded) {
      toast.error('Some files failed to process. Check the queue for details.');
    }

    if (successCount > 0 && onComplete) {
      setTimeout(onComplete, 1500);
    }
  };

  // UI Helpers
  const getStatusColor = (status) => {
    if (status === 'error') return 'text-red-500 bg-red-50 border-red-200';
    if (status === 'success') return 'text-green-500 bg-green-50 border-green-200';
    if (status === 'pending') return 'text-content-muted bg-page border-border-default';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'error') return <AlertCircle size={16} />;
    if (status === 'success') return <CheckCircle size={16} />;
    if (status === 'pending') return <div className="w-2 h-2 rounded-full bg-border-default" />;
    return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
  };

  const getStatusText = (status, error) => {
    if (status === 'error') return `Failed`;
    if (status === 'success') return 'Queued';
    if (status === 'uploading') return 'Uploading...';
    if (status === 'analyzing') return 'AI matching...';
    return 'Pending';
  };

  // Overall progress calc
  const overallStats = useMemo(() => {
    if (files.length === 0) return { percent: 0, done: 0, total: 0 };
    const totalProgress = files.reduce((acc, f) => acc + (f.progress || 0), 0);
    const done = files.filter(f => f.status === 'success').length;
    return {
      percent: Math.round(totalProgress / files.length),
      done,
      total: files.length
    };
  }, [files]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Dropzone Area ────────────────────────────────────────────────────── */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 relative ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-inner' 
            : 'border-border-default bg-page hover:bg-surface-hover'
        }`}
      >
        <input {...getInputProps()} />
        {/* Hidden folder input */}
        <input 
          type="file" 
          ref={folderInputRef}
          webkitdirectory="true" 
          directory="true"
          multiple
          className="hidden"
          onChange={handleFolderSelect}
        />

        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-sm transition-transform bg-surface border ${isDragActive ? 'border-blue-300 text-blue-500' : 'border-border-default text-content-muted'}`}>
          <UploadCloud size={40} />
        </div>
        
        <h3 className="text-xl font-bold text-content mb-2">
          {isDragActive ? 'Drop files or folders here!' : 'Drag & Drop Resume Files or Folders'}
        </h3>
        <p className="text-sm text-content-muted mb-6">
          or click below to browse your computer
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-border-default rounded-xl font-bold text-content-secondary hover:bg-page hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
          >
            <FileUp size={18} /> Upload Files
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-border-default rounded-xl font-bold text-content-secondary hover:bg-page hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
          >
            <FolderUp size={18} /> Upload Folder
          </button>
        </div>

        <div className="flex justify-center gap-3 text-xs font-semibold text-content-muted">
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-border-default shadow-sm">PDF, DOC, DOCX</span>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-border-default shadow-sm">Max 10MB per file</span>
        </div>

        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-3xl z-10 pointer-events-none" />
        )}
      </div>

      {/* ── File Queue ───────────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="rounded-2xl border border-border-default bg-surface shadow-sm overflow-hidden flex flex-col">
          
          {/* Header & Overall Progress */}
          <div className="p-5 border-b border-border-default bg-page">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-content">Upload Queue ({files.length})</h3>
                <p className="text-sm text-content-muted font-medium mt-0.5">
                  {overallStats.done} of {overallStats.total} completely processed
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
                >
                  <X size={16} /> Remove All
                </button>
                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={isProcessing || files.every(f => f.status === 'success')}
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Start Upload & Analysis'}
                </button>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300 bg-blue-600"
                style={{ width: `${overallStats.percent}%` }}
              />
            </div>
          </div>
          
          {/* Table Area */}
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-surface border-b border-border-default z-10 shadow-sm">
                <tr className="text-content-muted font-bold">
                  <th className="px-5 py-3">File Name</th>
                  <th className="px-5 py-3">Source Folder</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((fileObj) => (
                  <tr key={fileObj.id} className="hover:bg-page transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className={fileObj.file.name.endsWith('.pdf') ? 'text-red-400' : 'text-blue-500'} />
                        <span className="font-semibold text-content-secondary max-w-[200px] truncate" title={fileObj.file.name}>
                          {fileObj.file.name}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-5 py-3">
                      {fileObj.sourceFolder ? (
                        <div className="flex items-center gap-1.5 text-content-muted" title={fileObj.sourceFolder}>
                          <Folder size={14} />
                          <span className="truncate max-w-[150px]">{fileObj.sourceFolder}</span>
                        </div>
                      ) : (
                        <span className="text-content-muted italic text-xs">Direct Upload</span>
                      )}
                    </td>
                    
                    <td className="px-5 py-3 text-content-muted font-medium">
                      {(fileObj.file.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${getStatusColor(fileObj.status)}`}>
                        {getStatusIcon(fileObj.status)}
                        {getStatusText(fileObj.status, fileObj.error)}
                      </div>
                      {fileObj.error && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={fileObj.error}>
                          {fileObj.error}
                        </p>
                      )}
                      {/* Individual Progress indicator if active */}
                      {(fileObj.status === 'uploading' || fileObj.status === 'analyzing') && (
                        <div className="w-full mt-1.5 bg-surface rounded-full h-1 border border-border-default">
                          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${fileObj.progress}%` }} />
                        </div>
                      )}
                    </td>
                    
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {fileObj.status === 'error' && (
                          <button 
                            onClick={() => retryFile(fileObj.id)} 
                            disabled={isProcessing}
                            className="p-1.5 text-content-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Retry"
                          >
                            <RotateCw size={16} />
                          </button>
                        )}
                        {(fileObj.status === 'pending' || fileObj.status === 'error') && !isProcessing && (
                          <button 
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1.5 text-content-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWizard;
