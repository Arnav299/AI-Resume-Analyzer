import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 minutes (OCR can be slow)
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rocas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 – redirect to the correct login page based on current path
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 502 || status === 503 || status === 504) {
      error.isGatewayError = true;
    }
    if (status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('rocas_token');
      localStorage.removeItem('rocas_user');
      // Org/recruiter pages should redirect to org login, not student login
      const isOrgPath = window.location.pathname.startsWith('/recruiter') ||
                        window.location.pathname.startsWith('/org') ||
                        window.location.pathname.startsWith('/jd-studio') ||
                        window.location.pathname.startsWith('/upload-wizard') ||
                        window.location.pathname.startsWith('/executive') ||
                        window.location.pathname.startsWith('/kanban') ||
                        window.location.pathname.startsWith('/candidate');
      window.location.href = isOrgPath ? '/org-login' : '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  /**
   * Login with email + password.
   * IMPORTANT: Never issue a fake/mock token here.
   * A fake token poisons every subsequent authenticated request with a 401,
   * causing an infinite redirect loop between the dashboard and /org-login.
   * The login page has its own offline UI — it does not need a mock token.
   */
  login: async (data) => {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    // Always propagate errors — let the login page handle them.
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },

  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch (err) {
      const status = err.response?.status;
      if (status && status !== 502 && status !== 503 && status !== 504) {
        throw err; // real server error (e.g. 400 email already exists)
      }
      const networkErr = new Error('Cannot connect to the server. Please make sure the backend is running on port 8000.');
      networkErr.isNetworkError = true;
      networkErr.isGatewayError = true;
      throw networkErr;
    }
  },

  /**
   * Fetch the current user profile.
   * Always throws on 401/403 so that stale/invalid tokens are cleared.
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Check backend health status.
   */
  checkHealth: () => api.get('/health'),
};

// ── Student ──────────────────────────────────────────
export const studentAPI = {
  getProfile: () => api.get('/auth/me'),
  getDashboard: () => api.get('/dashboard/student'),
};

// ── Resume ───────────────────────────────────────────
export const resumeAPI = {
  upload: (formData, onProgress) =>
    api.post('/resumes/upload', formData, {
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  getAll: () => api.get('/resumes/'),
  analyze: (resumeId, data) => api.post(`/resumes/${resumeId}/analyze`, data),
  bulkAnalyze: (formData) => api.post('/resumes/bulk-analyze', formData),

  /**
   * Extract raw text from an uploaded PDF (no auth required).
   * @param {File} file
   * @returns {Promise<{ filename: string, text: string }>}
   */
  parsePdf: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resumes/parse-pdf-text', fd);
  },

  /**
   * Extract fully structured JSON from an uploaded PDF/DOC/DOCX (no auth required).
   * @param {File} file
   * @returns {Promise<{ filename: string, data: object }>}
   */
  parseStructured: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resumes/parse-structured', fd);
  },

  /**
   * OCR-extract text from an uploaded image (no auth required).
   * @param {File} file
   * @returns {Promise<{ filename: string, text: string }>}
   */
  parseImage: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resumes/parse-image', fd);
  },

  /**
   * Re-parse raw text (from the Text Editor) into structured resume data.
   * Used for live updates as the user edits the extracted text.
   * @param {string} text - Raw resume text
   * @returns {Promise<{ data: object }>}
   */
  reparseText: (text) =>
    api.post('/resumes/reparse-text', { text }, { headers: { 'Content-Type': 'application/json' } }),
};

// ── Analysis ─────────────────────────────────────────
export const analysisAPI = {
  getResult: (id) => api.get(`/analysis/${id}`),
  getLatest: (resumeId) => api.get(`/analysis/latest/${resumeId}`),
  getHistory: (resumeId) => api.get(`/analysis/history/${resumeId}`),
};

// ── Jobs ─────────────────────────────────────────────
export const jobsAPI = {
  getStatus: (jobId) => api.get(`/jobs/${jobId}`),
};

// ── Career Roles ──────────────────────────────────────
export const careerAPI = {
  getRoles: () => api.get('/career-roles/'),
};

// ── Dashboard ────────────────────────────────────────
export const dashboardAPI = {
  getStudent: () => api.get('/dashboard/student'),
  getMentor: () => api.get('/dashboard/mentor'),
  getAdmin: () => api.get('/dashboard/admin'),
  getRecruiter: () => api.get('/dashboard/recruiter'),
  getExecutive: () => api.get('/dashboard/recruiter'),
};

// ── Feedback ─────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedback/', data),
};

// ── Job Description Studio ───────────────────────────
export const jdAPI = {
  /** Create a new JD */
  create: (data) => api.post('/jd/', data),
  /** List all JDs for the current user */
  getAll: () => api.get('/jd/'),
  /** Get a single JD by id */
  getById: (id) => api.get(`/jd/${id}`),
  /** Update a JD */
  update: (id, data) => api.put(`/jd/${id}`, data),
  /** Delete a JD */
  remove: (id) => api.delete(`/jd/${id}`),
  /** Run Ranking Engine for a JD */
  rank: (id) => api.post(`/jd/${id}/rank`),
};

// ── Recruiter ─────────────────────────────────────────
export const recruiterAPI = {
  /** Get all resumes uploaded (for recruiter view) */
  getResumes: () => api.get('/resumes/'),
  /** Bulk analyze endpoint */
  bulkAnalyze: (formData) => api.post('/resumes/bulk-analyze', formData),
  /** Get recruiter-specific stats — falls back to admin dashboard */
  getStats: () => api.get('/dashboard/admin'),
};

// ── Upload Wizard ─────────────────────────────────────
export const uploadWizardAPI = {
  /**
   * Upload a single file with progress callback.
   * @param {File} file
   * @param {(pct: number) => void} onProgress
   */
  uploadSingle: (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resumes/upload', fd, {
      onUploadProgress: (e) =>
        onProgress && onProgress(Math.round((e.loaded * 100) / (e.total || 1))),
    });
  },
  /**
   * Batch upload multiple files.
   * @param {File[]} files
   */
  batchUpload: (files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/resumes/bulk-analyze', fd);
  },
};

// ── Candidate Dossier (Task 3.1) ───────────────────────────────────────────────
export const candidateAPI = {
  /** Get all candidates */
  getAll: () => api.get('/candidates/'),
  /** Get a single candidate by ID */
  getById: (id) => api.get(`/candidates/${id}`),
  /** Get full 360 dossier including parsed resume data */
  getDossier: (id) => api.get(`/candidates/${id}/dossier`),
  /** Update candidate stage/status */
  updateStatus: (id, status) => api.patch(`/candidates/${id}/status`, { status }),
};

// ── XAI Rationale (Task 3.4) ──────────────────────────────────────────────────
export const xaiAPI = {
  /**
   * Get XAI rationale for a candidate against a JD.
   * Returns { totalScore, recommendation, scoreBreakdown, positiveCards, gapCards }
   */
  getRationale: (candidateId, jdId = null) => {
    const params = jdId ? `?jd_id=${jdId}` : '';
    return api.get(`/xai/rationale/${candidateId}${params}`);
  },
  /** Get score breakdown only */
  getScoreBreakdown: (candidateId) => api.get(`/xai/score/${candidateId}`),
};

// ── Recruitment Pipeline / Kanban ─────────────────────────────────────────────
// NOTE: All methods propagate errors to callers.
// KanbanBoard.jsx handles the error centrally — showing ONE banner, not repeated toasts.
export const pipelineAPI = {
  /** Get all pipeline candidates with their current stage.
   *  Returns the axios response; throws on HTTP or network error so the caller
   *  can display a single, informative connection-failure banner. */
  getCandidates: () => api.get('/pipeline/candidates'),

  /** Move a candidate to a new pipeline stage. */
  moveCandidate: (candidateId, stage) =>
    api.patch(`/pipeline/candidates/${candidateId}/stage`, { stage }),

  /** Pipeline summary stats per stage. */
  getStats: () => api.get('/pipeline/stats'),

  /** Save an interview scorecard. */
  saveScorecard: (data) => api.post('/pipeline/scorecards', data),

  /** Get saved scorecard for a candidate. */
  getScorecard: (candidateId) => api.get(`/pipeline/scorecards/${candidateId}`),
};

export default api;

