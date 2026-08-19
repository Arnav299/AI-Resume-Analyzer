import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { jdAPI } from '../services/api';
import toast from 'react-hot-toast';
import OrgSidebar from '../components/OrgSidebar';
import StatusBadge from '../components/StatusBadge';
import ThemeToggle from '../components/ThemeToggle';
import {
  Search, Plus, Archive, Briefcase, FileText, Settings, Clock, MapPin,
  Copy, Edit2, Trash2, ArrowRight, Zap, Sparkles, ChevronRight, Info
} from 'lucide-react';

const JDStudio = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', domain: '', department: '', location: '',
      employmentType: 'Full-time', workMode: 'On-site',
      experienceLevel: 'Mid-Level', salary: '', education: '',
      skills: '', preferredSkills: '', certifications: '',
      description: '', requirements: '', benefits: '',
      aiMatchingThreshold: 70, selectedThreshold: 90,
      waitingThreshold: 75, status: 'Active'
    }
  });

  const fetchJDs = async () => {
    setLoading(true);
    try {
      const res = await jdAPI.getAll();
      setJds(res.data || []);
    } catch (err) {
      toast.error('Failed to load Job Descriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJDs(); }, []);

  const domains = ['All', ...new Set(jds.map(jd => jd.domain || 'Uncategorized').filter(Boolean))];

  const filteredJDs = jds.filter(jd => {
    if (activeTab === 'archived') return jd.status === 'Archived';
    if (activeTab === 'all') return jd.status !== 'Archived';
    return false;
  }).filter(jd => selectedDomain === 'All' || (jd.domain || 'Uncategorized') === selectedDomain);

  const onSubmit = async (data) => {
    try {
      // Build a clean payload from only the known form fields.
      // IMPORTANT: do NOT spread the full `data` object here — when editing,
      // `data` may contain snake_case JD response keys (employment_type, work_mode, etc.)
      // that conflict with the camelCase aliases and cause Pydantic to ignore the new values.
      const payload = {
        title: data.title,
        company: data.company || null,
        domain: data.domain || null,
        department: data.department || null,
        location: data.location || null,
        employmentType: data.employmentType || 'Full-time',
        workMode: data.workMode || 'On-site',
        salary: data.salary || null,
        experienceLevel: data.experienceLevel || 'Mid-Level',
        education: data.education || null,
        description: data.description || null,
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        skills: typeof data.skills === 'string'
          ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
          : (data.skills || []),
        preferredSkills: typeof data.preferredSkills === 'string'
          ? data.preferredSkills.split(',').map(s => s.trim()).filter(Boolean)
          : (data.preferredSkills || []),
        certifications: typeof data.certifications === 'string'
          ? data.certifications.split(',').map(s => s.trim()).filter(Boolean)
          : (data.certifications || []),
        aiMatchingThreshold: parseInt(data.aiMatchingThreshold, 10) || 70,
        selectedThreshold: parseInt(data.selectedThreshold, 10) || 90,
        waitingThreshold: parseInt(data.waitingThreshold, 10) || 75,
        status: data.status || 'Active',
      };
      if (editingId) {
        await jdAPI.update(editingId, payload);
        toast.success('Job Description updated!');
      } else {
        await jdAPI.create(payload);
        toast.success('Job Description created!');
      }
      reset(); setEditingId(null); setActiveTab('all'); fetchJDs();
    } catch (error) {
      console.error('API Error:', error);
      let errMsg = 'Failed to save Job Description';
      if (error?.response?.data?.detail) {
        errMsg = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.map(d => `${d.loc?.join('.') ?? ''}: ${d.msg}`).join(' | ')
          : String(error.response.data.detail);
      } else if (error?.message) {
        errMsg = error.message;
      }
      toast.error(errMsg);
    }
  };

  const handleEdit = (jd) => {
    setEditingId(jd.id);
    reset({
      ...jd,
      skills: jd.skills?.join(', ') || '',
      preferredSkills: jd.preferred_skills?.join(', ') || '',
      certifications: jd.certifications?.join(', ') || '',
      aiMatchingThreshold: jd.ai_matching_threshold || 70,
      selectedThreshold: jd.selected_threshold || 90,
      waitingThreshold: jd.waiting_threshold || 75,
      employmentType: jd.employment_type || 'Full-time',
      workMode: jd.work_mode || 'On-site',
      experienceLevel: jd.experience_level || 'Mid-Level'
    });
    setActiveTab('create');
  };

  const handleDuplicate = (jd) => {
    setEditingId(null);
    reset({
      ...jd, title: `${jd.title} (Copy)`,
      skills: jd.skills?.join(', ') || '',
      preferredSkills: jd.preferred_skills?.join(', ') || '',
      certifications: jd.certifications?.join(', ') || '',
      aiMatchingThreshold: jd.ai_matching_threshold || 70,
      selectedThreshold: jd.selected_threshold || 90,
      waitingThreshold: jd.waiting_threshold || 75,
      employmentType: jd.employment_type || 'Full-time',
      workMode: jd.work_mode || 'On-site',
      experienceLevel: jd.experience_level || 'Mid-Level'
    });
    setActiveTab('create');
    toast.success('Duplicated to draft. Save to confirm.');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await jdAPI.update(id, { status: newStatus });
      toast.success(`JD moved to ${newStatus}`);
      fetchJDs();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this JD?')) {
      try {
        await jdAPI.remove(id);
        toast.success('JD deleted successfully');
        fetchJDs();
      } catch (err) { toast.error('Failed to delete JD'); }
    }
  };

  const handleUseJD = (jd) => {
    navigate('/upload-wizard', { state: { selectedJdId: jd.id, selectedJdTitle: jd.title } });
  };

  // Premium input classes
  const inputCls = "w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-content placeholder-content-muted focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/15 transition-all outline-none";
  const labelCls = "block text-xs font-bold text-content-secondary uppercase tracking-wider mb-2";

  const tabs = [
    { id: 'all',      label: 'All JDs',    icon: Briefcase },
    { id: 'create',   label: editingId ? 'Edit JD' : 'Create JD', icon: Plus },
    { id: 'archived', label: 'Archived',   icon: Archive },
  ];

  return (
    <div className="flex min-h-screen font-sans bg-page text-content transition-colors">
      <div className="hidden md:block"><OrgSidebar /></div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border-default px-8 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted mb-1">
              <span>Portal</span><span>›</span>
              <span className="text-blue-600 font-medium">JD Studio</span>
            </div>
            <h1 className="text-2xl font-black text-content tracking-tight">JD Studio</h1>
            <p className="text-sm text-content-secondary mt-0.5">Create and manage AI-powered Job Descriptions</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-content-secondary hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
            <button
              onClick={() => { setActiveTab('create'); setEditingId(null); reset(); }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <Plus size={16} /> New JD
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Premium Tab Nav */}
            <div className="flex gap-1 bg-surface rounded-2xl p-1.5 border border-border-subtle shadow-sm w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id !== 'create') { setEditingId(null); reset(); } }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-content-secondary hover:text-content hover:bg-surface-hover'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Card container */}
            <div className="bg-surface rounded-2xl border border-border-default shadow-sm min-h-[600px]">

              {/* LIST VIEW */}
              {(activeTab === 'all' || activeTab === 'archived') && (
                <div className="p-6">
                  {/* Domain filters */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {domains.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDomain(d)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                          selectedDomain === d
                            ? 'bg-content text-page border-content shadow-sm'
                            : 'bg-surface text-content-secondary border-border-default hover:border-content-muted'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    </div>
                  ) : filteredJDs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <FileText size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-content">No Job Descriptions Found</h3>
                        <p className="text-sm text-content-secondary mt-1">Create your first JD to get started.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
                      >
                        <Plus size={16} /> Create JD
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredJDs.map(jd => (
                        <div key={jd.id} className="group bg-surface border border-border-default rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                                <Briefcase size={16} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-content group-hover:text-blue-500 transition-colors leading-tight">{jd.title}</h3>
                                <p className="text-xs text-content-secondary mt-0.5">{jd.domain || 'Uncategorized'} · {jd.department || 'General'}</p>
                              </div>
                            </div>
                            <StatusBadge status={jd.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-xs font-medium bg-surface-hover text-content-secondary px-2.5 py-1 rounded-lg flex items-center gap-1" title="Experience Level">
                              <Briefcase size={11} /> {jd.experience_level || 'Mid-Level'}
                            </span>
                            <span className="text-xs font-medium bg-surface-hover text-content-secondary px-2.5 py-1 rounded-lg flex items-center gap-1" title="Employment Type">
                              <Clock size={11} /> {jd.employment_type || 'Full-time'}
                            </span>
                            <span className="text-xs font-medium bg-surface-hover text-content-secondary px-2.5 py-1 rounded-lg flex items-center gap-1" title="Location & Work Mode">
                              <MapPin size={11} /> {jd.location ? `${jd.location} (${jd.work_mode || 'On-site'})` : (jd.work_mode || 'On-site')}
                            </span>
                            {jd.ai_matching_threshold && (
                              <span className="text-xs font-bold bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg ml-auto">
                                🎯 {jd.ai_matching_threshold}% match
                              </span>
                            )}
                          </div>

                          <div className="mt-auto pt-4 border-t border-border-default flex items-center gap-2">
                            <button
                              onClick={() => handleUseJD(jd)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
                            >
                              Use JD <ArrowRight size={13} />
                            </button>
                            <div className="flex gap-1">
                              <button onClick={() => handleEdit(jd)} className="p-2 text-content-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit"><Edit2 size={15} /></button>
                              <button onClick={() => handleDuplicate(jd)} className="p-2 text-content-muted hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Duplicate"><Copy size={15} /></button>
                              {activeTab === 'all' && (
                                <button onClick={() => handleStatusChange(jd.id, 'Archived')} className="p-2 text-content-muted hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors" title="Archive"><Archive size={15} /></button>
                              )}
                              {activeTab === 'archived' && (
                                <>
                                  <button onClick={() => handleStatusChange(jd.id, 'Active')} className="p-2 text-content-muted hover:text-green-600 hover:bg-green-500/10 rounded-lg transition-colors" title="Restore"><ArrowRight size={15} /></button>
                                  <button onClick={() => handleDelete(jd.id)} className="p-2 text-content-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CREATE/EDIT FORM */}
              {activeTab === 'create' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border-default">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-content">{editingId ? 'Edit Job Description' : 'Create New JD'}</h2>
                      <p className="text-xs text-content-secondary">Fill in the details to create a smart AI-powered job description</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section: Basic Details */}
                    <div className="bg-page rounded-2xl p-6 border border-border-default">
                      <h3 className="text-sm font-black text-content uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Briefcase size={16} className="text-blue-600" /> Basic Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2">
                          <label className={labelCls}>Job Title *</label>
                          <input {...register('title', { required: true })} className={inputCls} placeholder="e.g. Senior Frontend Developer" />
                          {errors.title && <span className="text-red-500 text-xs mt-1 block">Required</span>}
                        </div>
                        <div>
                          <label className={labelCls}>Status</label>
                          <select {...register('status')} className={inputCls}>
                            <option>Active</option><option>Draft</option><option>Archived</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Domain</label>
                          <input {...register('domain')} className={inputCls} placeholder="e.g. Engineering, Data Science" />
                        </div>
                        <div>
                          <label className={labelCls}>Department</label>
                          <input {...register('department')} className={inputCls} placeholder="e.g. Product, Marketing" />
                        </div>
                        <div>
                          <label className={labelCls}>Company</label>
                          <input {...register('company')} className={inputCls} placeholder="Your Company Name" />
                        </div>
                      </div>
                    </div>

                    {/* Section: Logistics */}
                    <div className="bg-page rounded-2xl p-6 border border-border-default">
                      <h3 className="text-sm font-black text-content uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Settings size={16} className="text-blue-600" /> Logistics & Requirements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className={labelCls}>Employment Type</label>
                          <select {...register('employmentType')} className={inputCls}>
                            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Work Mode</label>
                          <select {...register('workMode')} className={inputCls}>
                            <option>On-site</option><option>Hybrid</option><option>Remote</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Location</label>
                          <input {...register('location')} className={inputCls} placeholder="e.g. New York, NY" />
                        </div>
                        <div>
                          <label className={labelCls}>Experience Level</label>
                          <select {...register('experienceLevel')} className={inputCls}>
                            <option>Entry-Level</option><option>Mid-Level</option><option>Senior</option><option>Lead / Manager</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Salary Range</label>
                          <input {...register('salary')} className={inputCls} placeholder="e.g. $100k – $120k" />
                        </div>
                        <div>
                          <label className={labelCls}>Education</label>
                          <input {...register('education')} className={inputCls} placeholder="e.g. Bachelor's in CS" />
                        </div>
                      </div>
                    </div>

                    {/* Section: Skills & AI */}
                    <div className="bg-page rounded-2xl p-6 border border-border-default">
                      <h3 className="text-sm font-black text-content uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Zap size={16} className="text-blue-600" /> Skills & AI Criteria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Required Skills (comma-separated)</label>
                          <textarea {...register('skills')} className={`${inputCls} h-24 resize-none`} placeholder="React, Node.js, TypeScript" />
                        </div>
                        <div>
                          <label className={labelCls}>Preferred Skills (comma-separated)</label>
                          <textarea {...register('preferredSkills')} className={`${inputCls} h-24 resize-none`} placeholder="AWS, Docker, GraphQL" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelCls}>Certifications (comma-separated)</label>
                          <input {...register('certifications')} className={inputCls} placeholder="AWS Certified Developer, PMP" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-3 gap-4">
                          {/* Match Threshold */}
                          <div>
                            <label className={labelCls}>Match Threshold (%)</label>
                            <p className="flex items-center gap-1 text-[11px] text-content-muted italic mb-2">
                              <Info size={11} className="text-blue-400 shrink-0" />
                              Skill match — minimum % of required skills a resume must match to be considered
                            </p>
                            <input type="number" min="0" max="100" {...register('aiMatchingThreshold')} className={inputCls} />
                          </div>
                          {/* Select Threshold */}
                          <div>
                            <label className={labelCls}>Select Threshold (%)</label>
                            <p className="flex items-center gap-1 text-[11px] text-content-muted italic mb-2">
                              <Info size={11} className="text-green-400 shrink-0" />
                              Auto-select — resumes scoring at or above this % are shortlisted as &quot;Successful&quot;
                            </p>
                            <input type="number" min="0" max="100" {...register('selectedThreshold')} className={inputCls} />
                          </div>
                          {/* Wait Threshold */}
                          <div>
                            <label className={labelCls}>Wait Threshold (%)</label>
                            <p className="flex items-center gap-1 text-[11px] text-content-muted italic mb-2">
                              <Info size={11} className="text-yellow-400 shrink-0" />
                              Hold zone — resumes between this % and Select threshold are placed on &quot;Wait&quot; for review
                            </p>
                            <input type="number" min="0" max="100" {...register('waitingThreshold')} className={inputCls} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: JD Details */}
                    <div className="bg-page rounded-2xl p-6 border border-border-default">
                      <h3 className="text-sm font-black text-content uppercase tracking-widest mb-5 flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" /> Job Description Details
                      </h3>
                      <div className="space-y-5">
                        <div>
                          <label className={labelCls}>Overview / Description</label>
                          <textarea {...register('description')} className={`${inputCls} h-32 resize-none`} placeholder="Describe the role and team…" />
                        </div>
                        <div>
                          <label className={labelCls}>Responsibilities</label>
                          <textarea {...register('requirements')} className={`${inputCls} h-32 resize-none`} placeholder="What will they do day-to-day?" />
                        </div>
                        <div>
                          <label className={labelCls}>Benefits</label>
                          <textarea {...register('benefits')} className={`${inputCls} h-24 resize-none`} placeholder="Health insurance, 401k, remote options…" />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { reset(); setActiveTab('all'); setEditingId(null); }}
                        className="px-6 py-2.5 rounded-xl font-semibold text-content-secondary bg-surface-hover hover:bg-border-default transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/25 hover:-translate-y-0.5 transition-all text-sm"
                      >
                        {editingId ? 'Update JD' : 'Create JD'} <ChevronRight className="inline ml-1" size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JDStudio;
