import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import SkillBadge from '../components/SkillBadge';
import Button from '../components/Button';

const students = [
  { id: 1, name: 'Priya Sharma', role: 'Data Analyst', score: 85, email: 'priya@college.edu', matched: ['Python','SQL','Excel'], missing: ['Power BI','Tableau'], status: 'Reviewed' },
  { id: 2, name: 'Rahul Verma', role: 'Full Stack Developer', score: 72, email: 'rahul@college.edu', matched: ['React','HTML','CSS'], missing: ['Node.js','Git'], status: 'Pending' },
  { id: 3, name: 'Anjali Patel', role: 'AI/ML Beginner', score: 68, email: 'anjali@college.edu', matched: ['Python','Pandas'], missing: ['ML','Statistics','GitHub'], status: 'Reviewed' },
  { id: 4, name: 'Vikram Singh', role: 'Cloud Engineer', score: 91, email: 'vikram@college.edu', matched: ['AWS','Linux','Git','Networking'], missing: ['Azure'], status: 'Pending' },
  { id: 5, name: 'Sneha Reddy', role: 'DevOps Engineer', score: 78, email: 'sneha@college.edu', matched: ['Docker','Linux','Git'], missing: ['Kubernetes','Jenkins'], status: 'Reviewed' },
];

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    const matchScore =
      scoreFilter === 'all' ? true :
      scoreFilter === 'high' ? s.score >= 80 :
      scoreFilter === 'mid' ? s.score >= 60 && s.score < 80 :
      s.score < 60;
    return matchSearch && matchScore;
  });

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-textDark">Mentor Dashboard</h1>
              <p className="text-content-muted mt-1">Review and provide feedback to your students</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <DashboardCard title="Total Students" value={students.length} icon="🎓" bgColor="bg-blue-50" textColor="text-primary" />
              <DashboardCard title="Avg. Score" value={`${Math.round(students.reduce((a,s)=>a+s.score,0)/students.length)}/100`} icon="📊" bgColor="bg-green-50" textColor="text-success" />
              <DashboardCard title="Reviewed" value={students.filter(s=>s.status==='Reviewed').length} icon="✅" bgColor="bg-purple-50" textColor="text-purple-600" />
              <DashboardCard title="Pending Review" value={students.filter(s=>s.status==='Pending').length} icon="⏳" bgColor="bg-yellow-50" textColor="text-warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student List */}
              <div className="lg:col-span-1 card shadow-sm">
                <h2 className="font-bold text-textDark mb-4">Student List</h2>

                {/* Filters */}
                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="input-field text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select className="input-field text-sm" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
                    <option value="all">All Scores</option>
                    <option value="high">High (80+)</option>
                    <option value="mid">Medium (60–79)</option>
                    <option value="low">Low (&lt;60)</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filtered.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${selected?.id === s.id ? 'bg-primary text-white shadow' : 'bg-page hover:bg-blue-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selected?.id === s.id ? 'bg-surface/20 text-white' : 'bg-primary text-white'}`}>
                            {s.name[0]}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${selected?.id === s.id ? 'text-white' : 'text-textDark'}`}>{s.name}</p>
                            <p className={`text-xs ${selected?.id === s.id ? 'text-blue-100' : 'text-content-muted'}`}>{s.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${selected?.id === s.id ? 'text-white' : 'text-primary'}`}>{s.score}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} ${selected?.id === s.id ? 'opacity-80' : ''}`}>
                            {s.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && <p className="text-center text-content-muted text-sm py-4">No students found.</p>}
                </div>
              </div>

              {/* Review Panel */}
              <div className="lg:col-span-2 card shadow-sm">
                {selected ? (
                  <div className="animate-fade-in">
                    <div className="flex items-start justify-between mb-6 pb-6 border-b border-border-subtle">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow">{selected.name[0]}</div>
                        <div>
                          <h2 className="text-xl font-bold text-textDark">{selected.name}</h2>
                          <p className="text-content-muted text-sm">{selected.email}</p>
                          <span className="badge-primary text-xs mt-1">{selected.role}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-extrabold gradient-text">{selected.score}</p>
                        <p className="text-xs text-content-muted">Readiness Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div>
                        <p className="font-semibold text-content-muted text-xs uppercase tracking-wider mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.matched.map((s) => <SkillBadge key={s} skill={s} matched={true} />)}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-content-muted text-xs uppercase tracking-wider mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.missing.map((s) => <SkillBadge key={s} skill={s} matched={false} />)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 mb-5">
                      <p className="font-semibold text-textDark text-sm mb-1">AI Recommendation</p>
                      <p className="text-sm text-content-secondary leading-relaxed">
                        Focus on bridging the gap in <strong>{selected.missing.join(', ')}</strong> to significantly improve the readiness score. Consider practical projects and online certifications.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="primary" className="flex-1 py-2.5" onClick={() => navigate('/feedback')}>
                        💬 Give Feedback
                      </Button>
                      <Button variant="secondary" className="flex-1 py-2.5">
                        📋 View Full Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center text-3xl mb-4">👈</div>
                    <p className="font-semibold text-content-muted">Select a student to view their analysis</p>
                    <p className="text-sm text-content-muted mt-1">Click on any student from the list to see details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;
