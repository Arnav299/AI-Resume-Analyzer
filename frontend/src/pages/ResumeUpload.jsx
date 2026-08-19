import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadArea from '../components/UploadArea';
import Button from '../components/Button';
import { resumeAPI } from '../services/api';
import { useResume } from '../context/ResumeContext';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { setCurrentResume } = useResume();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (f) => {
    setFile(f);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    try {
      const formData = new FormData();
      // Backend UploadFile param is named 'file'
      formData.append('file', file);
      const response = await resumeAPI.upload(formData, (pct) => setProgress(pct));
      const resumeId = response.data?.id;
      setCurrentResume(resumeId, file.name);

      setStatus('success');
      // Pass resumeId forward so RoleSelection can trigger real analysis
      setTimeout(() => navigate('/roles', { state: { resumeId } }), 1500);
    } catch (err) {
      setStatus('error');
      const raw = err.response?.data?.detail;
      const msg = Array.isArray(raw)
        ? raw.map(e => e.msg || JSON.stringify(e)).join('; ')
        : (typeof raw === 'string' ? raw : 'Upload failed. Please try again.');
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-textDark">Upload Resume</h1>
              <p className="text-content-muted mt-1">Upload your resume in PDF, DOC, or DOCX format (max 5MB)</p>
            </div>

            <div className="card p-8 shadow-sm">
              <UploadArea onFileSelect={handleFileSelect} accept=".pdf,.doc,.docx" maxSizeMB={5} />

              {/* File Preview */}
              {file && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center gap-4 animate-fade-in">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">📄</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-textDark text-sm truncate">{file.name}</p>
                    <p className="text-xs text-content-muted mt-0.5">{(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop().toUpperCase()}</p>
                  </div>
                  <button onClick={() => { setFile(null); setStatus('idle'); setProgress(0); }}
                    className="text-content-muted hover:text-error transition-colors text-lg">✕</button>
                </div>
              )}

              {/* Progress Bar */}
              {status === 'uploading' && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex justify-between text-sm text-content-muted mb-2">
                    <span className="font-medium">Uploading...</span>
                    <span className="font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-hover rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full progress-bar transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success */}
              {status === 'success' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-success">Resume uploaded successfully!</p>
                    <p className="text-sm text-content-muted mt-0.5">Redirecting to career role selection...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <span className="text-2xl">❌</span>
                  <p className="font-semibold text-error">{errorMsg}</p>
                </div>
              )}

              {/* Upload button */}
              {file && status !== 'success' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    isLoading={status === 'uploading'}
                    onClick={handleUpload}
                    className="w-full py-3 text-base"
                    disabled={status === 'uploading'}
                  >
                    {status === 'uploading' ? 'Uploading...' : '🚀 Upload Resume'}
                  </Button>
                </div>
              )}

              {/* Tips */}
              <div className="mt-8 pt-6 border-t border-border-subtle">
                <p className="text-sm font-semibold text-content-muted mb-3 uppercase tracking-wider">Tips for best results</p>
                <ul className="space-y-2">
                  {['Use a clean, ATS-friendly resume format', 'Include all relevant skills and experience', 'Ensure contact information is clearly visible', 'Use standard section headings (Education, Skills, Experience)'].map((tip) => (
                    <li key={tip} className="text-sm text-content-muted flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeUpload;
