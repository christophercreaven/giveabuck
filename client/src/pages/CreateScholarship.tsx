import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function CreateScholarship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', targetAmount: '',
    school: '', fieldOfStudy: '', deadline: '',
  });
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'DONOR') {
    navigate('/scholarships');
    return null;
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/scholarships', {
        title: form.title,
        description: form.description,
        targetAmount: parseFloat(form.targetAmount),
        school: form.school || undefined,
        fieldOfStudy: form.fieldOfStudy || undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      });
      toast.success('Scholarship created!');
      navigate(`/scholarships/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create scholarship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Scholarship</h1>
      <p className="text-gray-500 mb-8">Launch a scholarship and let your community help fund a student's future.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input required value={form.title} onChange={(e) => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. MIT Computer Science Scholarship 2025" minLength={5} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea required value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={4} minLength={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="What's this scholarship for? Who should apply?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal ($) *</label>
          <input required type="number" min="100" step="50" value={form.targetAmount} onChange={(e) => set('targetAmount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="5000" />
          <p className="text-xs text-gray-400 mt-1">Minimum $100. The scholarship opens for applications once funded.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School (optional)</label>
            <input value={form.school} onChange={(e) => set('school', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="University of Michigan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study (optional)</label>
            <input value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Computer Science" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (optional)</label>
          <input type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
          {loading ? 'Creating…' : 'Launch Scholarship'}
        </button>
      </form>
    </div>
  );
}
