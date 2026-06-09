import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scholarship, Application } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Heart, ThumbsUp, Send, Share2, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export function ScholarshipDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donateMsg, setDonateMsg] = useState('');
  const [essay, setEssay] = useState('');
  const [gpa, setGpa] = useState('');
  const [school, setSchool] = useState(user?.school || '');
  const [major, setMajor] = useState(user?.major || '');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/scholarships/${id}`).then((r) => setScholarship(r.data));

  useEffect(() => { load(); }, [id]);

  if (!scholarship) return <div className="text-center py-20 text-gray-400">Loading&hellip;</div>;

  const pct = Math.min((scholarship.raisedAmount / scholarship.targetAmount) * 100, 100);

  const handleDonate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await api.post('/donations', {
        amount: parseFloat(donateAmount),
        scholarshipId: scholarship.id,
        anonymous,
        message: donateMsg || undefined,
      });
      toast.success(`$${donateAmount} donated! Thank you.`);
      setDonateAmount(''); setDonateMsg('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Donation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await api.post('/applications', {
        scholarshipId: scholarship.id,
        essay, gpa: gpa ? parseFloat(gpa) : undefined, major, school,
      });
      toast.success('Application submitted!');
      setEssay(''); setGpa('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (appId: string) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/applications/${appId}/vote`);
      toast.success(data.voted ? 'Vote cast!' : 'Vote removed');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Vote failed');
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post(`/scholarships/${id}/comments`, { text: commentText });
      setCommentText('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Comment failed');
    }
  };

  const shareUrl = window.location.href;
  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{scholarship.title}</h1>
              <button onClick={handleShare} className="shrink-0 text-gray-400 hover:text-green-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
              {scholarship.school && <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{scholarship.school}</span>}
              {scholarship.fieldOfStudy && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{scholarship.fieldOfStudy}</span>}
              {scholarship.deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>}
              <span className="text-gray-400">by {scholarship.creator.name}</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{scholarship.description}</p>
          </div>

          {/* Applications / Voting */}
          {(scholarship.applications?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {scholarship.status === 'VOTING' ? 'Vote for a Recipient' : 'Applications'}
              </h2>
              <div className="space-y-4">
                {scholarship.applications!.map((app: Application) => (
                  <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{app.student?.name}</div>
                        <div className="text-sm text-gray-500">{app.major} · {app.school}{app.gpa ? ` · GPA ${app.gpa}` : ''}</div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{app.essay}</p>
                      </div>
                      {scholarship.status === 'VOTING' && user?.role === 'DONOR' && (
                        <button
                          onClick={() => handleVote(app.id)}
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors shrink-0"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {app._count?.votes ?? 0}
                        </button>
                      )}
                      {scholarship.status !== 'VOTING' && app._count && (
                        <span className="text-sm text-gray-400">{app._count.votes} votes</span>
                      )}
                    </div>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply form */}
          {scholarship.status === 'OPEN' && user?.role === 'STUDENT' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Apply for this Scholarship</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                    <input value={school} onChange={(e) => setSchool(e.target.value)} required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your university" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                    <input value={major} onChange={(e) => setMajor(e.target.value)} required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your major" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                  <input type="number" step="0.01" min="0" max="4" value={gpa} onChange={(e) => setGpa(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3.75" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Essay (100+ chars)</label>
                  <textarea value={essay} onChange={(e) => setEssay(e.target.value)} required minLength={100} rows={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell donors about yourself and why you deserve this scholarship&hellip;" />
                </div>
                <button type="submit" disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Submitting&hellip;' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}

          {/* Comments */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
            {user && (
              <form onSubmit={handleComment} className="flex gap-2 mb-5">
                <input
                  value={commentText} onChange={(e) => setCommentText(e.target.value)} required
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add a comment&hellip;"
                />
                <button type="submit" className="text-green-600 hover:text-green-700">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            {(scholarship.comments?.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {scholarship.comments!.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
                      {c.user.name[0]}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">{c.user.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <p className="text-sm text-gray-600 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600 mb-1">${scholarship.raisedAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-3">raised of ${scholarship.targetAmount.toLocaleString()} goal</div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{scholarship._count?.donations ?? scholarship.donations?.length ?? 0} donors</span>
              <span>{Math.round(pct)}% funded</span>
            </div>
          </div>

          {/* Donate form */}
          {scholarship.status === 'OPEN' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" /> Make a Donation
              </h3>
              <form onSubmit={handleDonate} className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 25].map((amt) => (
                    <button key={amt} type="button" onClick={() => setDonateAmount(String(amt))}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        donateAmount === String(amt)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                      }`}>
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number" min="1" max="10000" step="0.01" placeholder="Custom amount"
                  value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text" placeholder="Optional message" value={donateMsg} onChange={(e) => setDonateMsg(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
                  Give anonymously
                </label>
                <button type="submit" disabled={!donateAmount || submitting}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                  {submitting ? 'Processing&hellip;' : `Donate $${donateAmount || '-'}`}
                </button>
              </form>
            </div>
          )}

          {/* Recent donors */}
          {(scholarship.donations?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Donors</h3>
              <div className="space-y-2">
                {scholarship.donations!.slice(0, 8).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{d.anonymous ? 'Anonymous' : (d.donor?.name ?? 'Donor')}</span>
                    <span className="font-medium text-green-600">${d.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
