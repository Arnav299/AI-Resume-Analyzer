import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const FeedbackPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [form, setForm] = useState({ rating: 0, hoverRating: 0, comments: '', actions: '' });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    if (!form.comments.trim()) {
      toast.error('Feedback comments are required.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    
    // Add to local state to display immediately
    setFeedbacks([{ ...form, id: Date.now(), date: new Date().toLocaleDateString() }, ...feedbacks]);
    toast.success('Feedback submitted successfully!');
    
    // Reset form
    setForm({ rating: 0, hoverRating: 0, comments: '', actions: '' });
  };

  return (
    <div className="flex min-h-screen bg-page">
      <div className="hidden md:block"><Sidebar /></div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-textDark">
                {isStudent ? 'My Feedback' : 'Submit Feedback'}
              </h1>
              <p className="text-content-muted mt-1">
                {isStudent 
                  ? 'Review feedback from your mentors to improve your readiness' 
                  : 'Provide constructive feedback to help students grow'}
              </p>
            </div>

            {/* Student info banner */}
            {!isStudent && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl mb-6 border border-blue-100">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
                <div>
                  <p className="font-bold text-textDark">Priya Sharma</p>
                  <p className="text-sm text-content-muted">Data Analyst • Score: <span className="font-semibold text-primary">85/100</span></p>
                </div>
              </div>
            )}

            {!isStudent && (
              <div className="card p-8 shadow-sm mb-8">
                <form onSubmit={handleSubmit}>

                  {/* Star Rating */}
                  <div className="mb-8">
                    <label className="label text-base mb-3">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          onMouseEnter={() => setForm({ ...form, hoverRating: star })}
                          onMouseLeave={() => setForm({ ...form, hoverRating: 0 })}
                          className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          {star <= (form.hoverRating || form.rating) ? '⭐' : '☆'}
                        </button>
                      ))}
                      {form.rating > 0 && (
                        <span className="ml-2 text-sm font-semibold text-content-muted">
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                        </span>
                      )}
                    </div>
                    {!form.rating && <p className="text-error text-xs mt-1 font-medium">Please select a rating before submitting.</p>}
                  </div>

                  {/* Comments */}
                  <div className="mb-5">
                    <label className="label">Feedback Comments</label>
                    <textarea
                      className="input-field min-h-[120px] resize-none"
                      placeholder="Provide detailed feedback about the student's resume, skills, and overall readiness for the target role..."
                      value={form.comments}
                      onChange={(e) => setForm({ ...form, comments: e.target.value })}
                      required
                      rows={5}
                    />
                  </div>

                  {/* Improvement Actions */}
                  <div className="mb-8">
                    <label className="label">Improvement Actions</label>
                    <textarea
                      className="input-field min-h-[100px] resize-none"
                      placeholder="List specific action items the student should focus on (e.g., 'Complete Power BI certification', 'Build 2 data analysis projects on GitHub')..."
                      value={form.actions}
                      onChange={(e) => setForm({ ...form, actions: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Quick Templates */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">Quick Templates</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Great technical skills!',
                        'Needs more projects',
                        'Excellent communication',
                        'Work on certifications',
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, comments: form.comments + (form.comments ? '\n' : '') + t })}
                          className="text-xs bg-surface-hover hover:bg-blue-100 hover:text-primary text-content-muted px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" variant="primary" isLoading={loading} className="flex-1 py-3">
                      ✅ Submit Feedback
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 py-3"
                      onClick={() => setForm({ rating: 0, hoverRating: 0, comments: '', actions: '' })}
                    >
                      🔄 Clear Form
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Display Saved Feedbacks */}
            {feedbacks.length > 0 ? (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-textDark mb-4">
                  {isStudent ? 'Feedback Received' : 'Recent Feedback'}
                </h2>
                <div className="space-y-4">
                  {feedbacks.map(fb => (
                    <div key={fb.id} className="card p-6 shadow-sm border border-border-subtle">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className="text-xl">
                              {star <= fb.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-content-muted font-medium">{fb.date}</span>
                      </div>
                      <p className="text-sm text-textDark leading-relaxed mb-3">{fb.comments}</p>
                      {fb.actions && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Action Items</p>
                          <p className="text-sm text-content-secondary">{fb.actions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              isStudent && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-page rounded-2xl flex items-center justify-center text-3xl mb-4">💬</div>
                  <p className="font-semibold text-content-muted">No feedback received yet</p>
                  <p className="text-sm text-content-muted mt-1">Check back later once a mentor reviews your profile.</p>
                </div>
              )
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeedbackPage;
