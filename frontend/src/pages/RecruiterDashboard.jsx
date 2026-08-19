import ThemeToggle from '../components/ThemeToggle';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrgSidebar from '../components/OrgSidebar';
import NotificationBell from '../components/NotificationBell';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  FileText, Briefcase, Users, UploadCloud, Clock, CheckCircle,
  UserCheck, UserX, Plus, FileSearch, RefreshCw, TrendingUp,
  ArrowUpRight, Activity, Sparkles
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getRecruiter();
      const d = res.data;
      setStats({
        totalJds:              d.total_jds ?? d.total_jobs ?? 0,
        activeJobs:            d.active_jds ?? d.active_jobs ?? 0,
        totalCandidates:       d.total_candidates ?? d.total_resumes ?? 0,
        uploadedResumes:       d.total_resumes ?? d.resumes_uploaded ?? 0,
        pendingAnalysis:       d.pending_analysis ?? d.pending_candidates ?? 0,
        completedAnalysis:     d.completed_analyses ?? d.candidates_analyzed ?? 0,
        selectedCandidates:    d.selected ?? d.selected_candidates ?? 0,
        shortlistedCandidates: d.shortlisted ?? d.shortlisted_candidates ?? 0,
        rejectedCandidates:    d.rejected ?? d.rejected_candidates ?? 0,
        avgScore:              d.avg_readiness_score || 0,
        recentResumes:         d.recent_resumes || [],
        recentActivities:      d.recent_activities || [],
        isFallback:            Boolean(d.is_fallback),
      });
    } catch (err) {
      console.error('Error fetching recruiter dashboard stats:', err);
      setError('Unable to connect to live backend API. Click Refresh below to retry.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Auto-refresh when bulk analysis completes in OrgDashboard (any tab)
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'rocas_analysis_done') fetchStats();
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const handleRefresh = () => { setIsRefreshing(true); fetchStats(); };

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6'];

  const activitiesToDisplay = stats?.recentActivities || [];

  return (
    <div className="flex min-h-screen font-sans" >
      <div className="hidden md:block">
        <OrgSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Recruiter Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">Recruiter Dashboard</h1>
            <p className="text-sm text-content-muted mt-0.5">Welcome back, <span className="font-semibold text-content-secondary">{user?.full_name || 'Recruiter'}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-content-secondary bg-surface-hover hover:bg-surface-hover rounded-xl transition-all disabled:opacity-60"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <NotificationBell notifications={[]} />
            <Link
              to="/upload-wizard"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/25 text-sm"
            >
              <UploadCloud size={16} />
              Upload Resumes
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-content-muted font-medium">Loading live statistics…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm text-center max-w-md">
                {error}
              </div>
              <button onClick={handleRefresh} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Fallback banner */}
              {stats?.isFallback && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium flex items-center justify-between">
                  <span>⚡ Showing demo statistics — backend connecting…</span>
                  <button onClick={handleRefresh} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all">
                    Retry Live →
                  </button>
                </div>
              )}

              {/* KPI Cards Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Total JDs"         value={stats.totalJds}            icon={FileText}   color="blue"   />
                <StatCard title="Active Jobs"        value={stats.activeJobs}          icon={Briefcase}  color="blue"   progress={stats.activeJobs > 0 ? Math.round((stats.activeJobs / Math.max(stats.totalJds, 1)) * 100) : 0} />
                <StatCard title="Candidates"         value={stats.totalCandidates}     icon={Users}      color="purple" trend="up" trendValue="12%" />
                <StatCard title="Shortlisted"        value={stats.shortlistedCandidates} icon={UserCheck} color="green" />
                <StatCard title="Selected"           value={stats.selectedCandidates}  icon={CheckCircle} color="green" />
              </div>

              {/* KPI Cards Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Resumes Uploaded"  value={stats.uploadedResumes}     icon={UploadCloud} color="blue"   />
                <StatCard title="Pending Analysis"  value={stats.pendingAnalysis}     icon={Clock}       color="orange" />
                <StatCard title="Completed Analysis" value={stats.completedAnalysis}  icon={CheckCircle} color="green"  />
                <StatCard title="Rejected"          value={stats.rejectedCandidates}  icon={UserX}       color="red"    />
              </div>

              {/* Charts (Empty States) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Upload Trend */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-content">Upload Trend</h3>
                      <p className="text-xs text-content-muted mt-0.5">Resume activity this week</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <TrendingUp size={12} /> This Week
                    </span>
                  </div>
                  <div className="h-64 flex flex-col items-center justify-center text-content-muted bg-page/50 rounded-xl border border-dashed border-border-default">
                    <TrendingUp size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No upload trend available</p>
                    <p className="text-xs text-content-muted mt-1">Insufficient data to plot activity</p>
                  </div>
                </div>

                {/* Domain Pie */}
                <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-content">By Domain</h3>
                    <p className="text-xs text-content-muted mt-0.5">Candidate distribution</p>
                  </div>
                  <div className="h-64 flex flex-col items-center justify-center text-content-muted bg-page/50 rounded-xl border border-dashed border-border-default">
                    <Activity size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No domain data</p>
                    <p className="text-xs text-content-muted mt-1 text-center px-4">Role distribution data not available</p>
                  </div>
                </div>
              </div>


              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <h3 className="text-base font-bold text-content mb-5">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { to: '/jd-studio', icon: Plus, label: 'Create New JD', sub: 'Draft a job description', color: 'from-blue-500 to-blue-600' },
                      { to: '/jd-studio', icon: FileSearch, label: 'Browse JDs', sub: 'Select an active job', color: 'from-indigo-500 to-violet-600' },
                      { to: '/executive', icon: TrendingUp, label: 'Analytics', sub: 'Full hiring insights', color: 'from-emerald-500 to-green-600' },
                    ].map(({ to, icon: Icon, label, sub, color }) => (
                      <Link key={to + label} to={to} className="flex items-center gap-4 p-3.5 rounded-xl border border-border-subtle hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-content text-sm group-hover:text-blue-700 transition-colors">{label}</p>
                          <p className="text-xs text-content-muted">{sub}</p>
                        </div>
                        <ArrowUpRight size={14} className="ml-auto text-content-muted group-hover:text-blue-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-content">Recent Activity</h3>
                    <span className="flex items-center gap-1 text-xs text-content-muted">
                      <Activity size={12} /> Live
                    </span>
                  </div>
                  <div className="relative border-l-2 border-border-subtle ml-3 space-y-5 pb-2">
                    {activitiesToDisplay.length > 0 ? (
                      activitiesToDisplay.map((activity, i) => {
                        const Icon = activity.icon || Activity;
                        const color = activity.color || 'bg-blue-100 text-blue-600';
                        return (
                          <div key={i} className="relative pl-6">
                            <div className={`absolute -left-[13px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${color} ring-2 ring-white`}>
                              <Icon size={11} />
                            </div>
                            <p className="text-sm font-semibold text-content">{activity.title}</p>
                            <p className="text-xs text-content-muted mt-0.5">{activity.desc}</p>
                            <p className="text-xs text-content-muted mt-1">{activity.time}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="pl-6 py-6 flex flex-col items-center justify-center text-content-muted">
                        <Clock size={28} className="mb-2 opacity-50 text-content-muted" />
                        <p className="text-sm font-semibold">No recent activity</p>
                        <p className="text-xs text-content-muted mt-1 text-center">Your pipeline activity will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
