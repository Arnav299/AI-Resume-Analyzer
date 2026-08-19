import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const StudentProfile = React.lazy(() => import('../pages/StudentProfile'));
const ResumeUpload = React.lazy(() => import('../pages/ResumeUpload'));
const RoleSelection = React.lazy(() => import('../pages/RoleSelection'));
const ResumeBuilder = React.lazy(() => import('../pages/ResumeBuilder'));
const AnalysisResult = React.lazy(() => import('../pages/AnalysisResult'));
const StudentDashboard = React.lazy(() => import('../pages/StudentDashboard'));
const MentorDashboard = React.lazy(() => import('../pages/MentorDashboard'));
const FeedbackPage = React.lazy(() => import('../pages/FeedbackPage'));
const AnalyzePage = React.lazy(() => import('../pages/AnalyzePage'));
const OrgDashboard = React.lazy(() => import('../pages/OrgDashboard'));
const OrgLoginPage = React.lazy(() => import('../pages/OrgLoginPage'));
const OrgRegisterPage = React.lazy(() => import('../pages/OrgRegisterPage'));

// New Dashboard Pages
const SkillsAnalysis = React.lazy(() => import('../pages/SkillsAnalysis'));
const AIRecommendations = React.lazy(() => import('../pages/AIRecommendations'));
const LearningPath = React.lazy(() => import('../pages/LearningPath'));
const HistoryPage = React.lazy(() => import('../pages/HistoryPage'));
const ReportPage = React.lazy(() => import('../pages/ReportPage'));

// New Week 1 & 2 Pages
const RecruiterDashboard = React.lazy(() => import('../pages/RecruiterDashboard'));
const ExecutiveDashboard = React.lazy(() => import('../pages/ExecutiveDashboard'));
const JDStudio = React.lazy(() => import('../pages/JDStudio'));
const UploadWizardPage = React.lazy(() => import('../pages/UploadWizardPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const StudentUserManualPage = React.lazy(() => import('../pages/StudentUserManualPage'));
const StudentAboutProductPage = React.lazy(() => import('../pages/StudentAboutProductPage'));
const CandidateDossier = React.lazy(() => import('../pages/CandidateDossier'));
const KanbanBoard = React.lazy(() => import('../pages/KanbanBoard'));
const UserManualPage = React.lazy(() => import('../pages/UserManualPage'));
const AboutProductPage = React.lazy(() => import('../pages/AboutProductPage'));
const ResumeBuilderUserManualPage = React.lazy(() => import('../pages/ResumeBuilderUserManualPage'));
const ResumeBuilderAboutPage = React.lazy(() => import('../pages/ResumeBuilderAboutPage'));
const ComingSoonPage = React.lazy(() => import('../pages/ComingSoonPage'));
import ErrorBoundary from '../components/ErrorBoundary';

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background text-primary">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => (
  <ErrorBoundary>
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ✨ Public AI Analysis Page — no login required */}
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/builder" element={<ResumeBuilder />} />
        <Route path="/builder-manual" element={<ResumeBuilderUserManualPage />} />
        <Route path="/builder-about" element={<ResumeBuilderAboutPage />} />

        {/* Student Flow */}
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute allowedRoles={['student']}><ResumeUpload /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute allowedRoles={['student']}><RoleSelection /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute allowedRoles={['student']}><AnalysisResult /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        
        {/* New dashboard flows */}
        <Route path="/skills" element={<ProtectedRoute allowedRoles={['student']}><SkillsAnalysis /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute allowedRoles={['student']}><AIRecommendations /></ProtectedRoute>} />
        <Route path="/learning-path" element={<ProtectedRoute allowedRoles={['student']}><LearningPath /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute allowedRoles={['student']}><HistoryPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['student']}><ReportPage /></ProtectedRoute>} />
        <Route path="/student-manual" element={<ProtectedRoute allowedRoles={['student']}><StudentUserManualPage /></ProtectedRoute>} />
        <Route path="/student-about" element={<ProtectedRoute allowedRoles={['student']}><StudentAboutProductPage /></ProtectedRoute>} />

        {/* Organization / Recruiter / Executive */}
        <Route path="/org-login" element={<OrgLoginPage />} />
        <Route path="/org-register" element={<OrgRegisterPage />} />
        <Route path="/org-dashboard" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><OrgDashboard /></ProtectedRoute>} />
        <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/executive" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><ExecutiveDashboard /></ProtectedRoute>} />
        <Route path="/jd-studio" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><JDStudio /></ProtectedRoute>} />
        <Route path="/upload-wizard" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><UploadWizardPage /></ProtectedRoute>} />

        {/* ── Candidate 360 Dossier (Task 3.1 + 3.4) */}
        <Route path="/candidate/:id" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><CandidateDossier /></ProtectedRoute>} />

        {/* ── Kanban Pipeline Board (Task 4.1) */}
        <Route path="/kanban" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><KanbanBoard /></ProtectedRoute>} />

        {/* ── Help & Information */}
        <Route path="/user-manual" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><UserManualPage /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'executive', 'organization']}><AboutProductPage /></ProtectedRoute>} />

        {/* Mentor */}
        <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute allowedRoles={['mentor', 'student']}><FeedbackPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppRoutes;
