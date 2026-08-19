import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const fields = [
  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
  { id: 'college', label: 'College / University', type: 'text', placeholder: 'Enter your institution name' },
  { id: 'branch', label: 'Branch / Department', type: 'text', placeholder: 'e.g. Computer Science' },
  { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Alumni'];
const roles = ['Data Analyst', 'Full Stack Developer', 'AI/ML Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Cybersecurity Analyst'];

const StudentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', college: '', branch: '', year: '', phone: '', targetRole: '' });
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => navigate('/upload'), 1200);
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-textDark">My Profile</h1>
              <p className="text-content-muted mt-1">Complete your profile to get accurate career recommendations</p>
            </div>

            {saved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-success font-medium animate-fade-in">
                ✅ Profile saved successfully! Redirecting to resume upload...
              </div>
            )}

            <div className="card p-8 shadow-sm">
              <form onSubmit={handleSubmit}>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-subtle">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {form.name?.[0]?.toUpperCase() || '👤'}
                  </div>
                  <div>
                    <p className="font-bold text-textDark text-lg">{form.name || 'Your Name'}</p>
                    <p className="text-content-muted text-sm">{user?.email || 'student@.ai'}</p>
                    <span className="badge-primary text-xs mt-1">Student</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {fields.map(({ id, label, type, placeholder }) => (
                    <div key={id}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        className="input-field"
                        placeholder={placeholder}
                        value={form[id]}
                        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                        required
                      />
                    </div>
                  ))}

                  {/* Year */}
                  <div>
                    <label className="label">Year of Study</label>
                    <select
                      className="input-field"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      required
                    >
                      <option value="">Select year</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="label">Target Career Role</label>
                    <select
                      className="input-field"
                      value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1 py-3">
                    💾 Save Profile
                  </Button>
                  <Button type="button" variant="secondary" className="flex-1 py-3" onClick={() => {}}>
                    ✏️ Update Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
