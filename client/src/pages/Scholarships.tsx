import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scholarship } from '../lib/types';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle } from 'lucide-react';

export function Scholarships() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    api.get(`/scholarships?${params}`).then((r) => {
      setScholarships(r.data);
      setLoading(false);
    });
  }, [search, status]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-500 mt-1">Browse and fund scholarships for U.S. students.</p>
        </div>
        {user?.role === 'DONOR' && (
          <Link to="/scholarships/new" className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> Create Scholarship
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search scholarshipsâ€¦" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={status} onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="VOTING">Voting</option>
          <option value="FUNDED">Funded</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loadingâ€¦</div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No scholarships found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((s) => <ScholarshipCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}

