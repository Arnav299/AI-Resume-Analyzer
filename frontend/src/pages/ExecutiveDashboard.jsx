import ThemeToggle from '../components/ThemeToggle';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrgSidebar from '../components/OrgSidebar';
import NotificationBell from '../components/NotificationBell';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users, FileText, CheckCircle, Clock, TrendingUp, Download,
  Filter, BarChart2, Target, Zap, Award, ArrowUpRight
} from 'lucide-react';

const ExecutiveDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('This Quarter');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getExecutive();
        const d = res.data;
        setStats({
          totalCandidates:  d.total_resumes || 0,
          resumesUploaded:  d.total_resumes || 0,
          analysesRun:      d.completed_analyses || 0,
          avgReadiness:     Math.round(d.avg_readiness_score || 0),
          shortlisted:      d.shortlisted || 0,
          hired:            d.selected || 0,
          totalJds:         d.total_jds || 0,
          activeJds:        d.active_jds || 0,
          recentActivities: d.recent_activities || [],
        });
      } catch (err) {
        setError('Failed to load executive stats. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Auto-refresh when bulk analysis completes in OrgDashboard (any tab)
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'rocas_analysis_done') {
        const fetchStats = async () => {
          try {
            const res = await dashboardAPI.getExecutive();
            const d = res.data;
            setStats({
              totalCandidates:  d.total_resumes || 0,
              resumesUploaded:  d.total_resumes || 0,
              analysesRun:      d.completed_analyses || 0,
              avgReadiness:     Math.round(d.avg_readiness_score || 0),
              shortlisted:      d.shortlisted || 0,
              hired:            d.selected || 0,
              totalJds:         d.total_jds || 0,
              activeJds:        d.active_jds || 0,
              recentActivities: d.recent_activities || [],
            });
          } catch (err) {
            console.error('Executive auto-refresh failed:', err);
          }
        };
        fetchStats();
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);


  return (
    <div className="flex min-h-screen font-sans" >
      <div className="hidden md:block">
        <OrgSidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border-default/80 px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 font-medium">Executive Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">Executive Dashboard</h1>
            <p className="text-sm text-content-muted mt-0.5">Company-wide analytics & hiring intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            <div className="flex bg-surface-hover rounded-xl p-1 gap-1">
              {['This Month', 'This Quarter', 'This Year'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    timeRange === range ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 border border-border-default bg-surface hover:bg-page text-content-secondary px-4 py-2 rounded-xl font-medium transition-all shadow-sm text-sm">
              <Download size={15} /> Export
            </button>
            <NotificationBell notifications={[]} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-content-muted">Loading executive analytics…</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto">

              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Candidates" value={stats.totalCandidates} icon={Users}       color="blue"   trend="up" trendValue="15%" />
                <StatCard title="Total Resumes"    value={stats.resumesUploaded} icon={FileText}    color="purple" />
                <StatCard title="Analyses Run"     value={stats.analysesRun}     icon={CheckCircle} color="green"  />
                <StatCard title="Avg. Match Score" value={`${stats.avgReadiness}%`} icon={TrendingUp} color="orange" trend="up" trendValue="2%" progress={stats.avgReadiness} />
              </div>

              {/* KPI Row 2 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Shortlisted"   value={stats.shortlisted} icon={Award}  color="green" />
                <StatCard title="Hired"         value={stats.hired}       icon={Target} color="blue"  progress={stats.totalCandidates > 0 ? Math.round((stats.hired / stats.totalCandidates) * 100) : 0} />
                <StatCard title="Total JDs"     value={stats.totalJds}    icon={FileText} color="purple" />
                <StatCard title="Active JDs"    value={stats.activeJds}   icon={Zap}    color="orange" />
              </div>

              {/* Charts (Empty States) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                {/* Trends Chart */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-content">Recruitment Pipeline Trends</h3>
                      <p className="text-xs text-content-muted mt-0.5">6-month candidate flow</p>
                    </div>
                    <button className="text-content-muted hover:text-blue-600 transition-colors p-1">
                      <Filter size={16} />
                    </button>
                  </div>
                  <div className="h-64 flex flex-col items-center justify-center text-content-muted bg-page/50 rounded-xl border border-dashed border-border-default">
                    <BarChart2 size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No trend data available</p>
                    <p className="text-xs text-content-muted mt-1">Insufficient data to plot pipeline trends</p>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-content">Top Roles by Volume</h3>
                    <p className="text-xs text-content-muted mt-0.5">Applications by position</p>
                  </div>
                  <div className="h-64 flex flex-col items-center justify-center text-content-muted bg-page/50 rounded-xl border border-dashed border-border-default">
                    <Target size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No role data</p>
                    <p className="text-xs text-content-muted mt-1 text-center px-4">Role distribution data not available</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Distribution */}
                <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <h3 className="text-base font-bold text-content mb-6">Score Distribution</h3>
                  <div className="h-48 flex flex-col items-center justify-center text-content-muted bg-page/50 rounded-xl border border-dashed border-border-default">
                    <TrendingUp size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No score distribution</p>
                    <p className="text-xs text-content-muted mt-1 text-center px-4">Sufficient analyses required</p>
                  </div>
                </div>

                {/* Recent Highlights */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-content">Recent Highlights</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                      View Log <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {stats.recentActivities && stats.recentActivities.length > 0 ? (
                      stats.recentActivities.map((act, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border-subtle hover:bg-page transition-colors group cursor-default">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-blue-100 text-blue-700">
                            <Clock size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-content text-sm">{act.title}</p>
                            <p className="text-xs text-content-muted mt-0.5">{act.desc}</p>
                          </div>
                          <span className="text-xs text-content-muted whitespace-nowrap">{act.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-content-muted border border-dashed border-border-default rounded-xl bg-page/50">
                        <Clock size={32} className="mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No recent highlights</p>
                        <p className="text-xs text-content-muted mt-1">Platform activity will appear here</p>
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

export default ExecutiveDashboard;
