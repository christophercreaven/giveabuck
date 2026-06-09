import { Link } from 'react-router-dom';
import type { Scholarship } from '../lib/types';
import { DollarSign, Users, BookOpen, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  VOTING: 'bg-blue-100 text-blue-700',
  FUNDED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const pct = Math.min((s.raisedAmount / s.targetAmount) * 100, 100);

  return (
    <Link to={`/scholarships/${s.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 flex-1">
          {s.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColors[s.status]}`}>
          {s.status}
        </span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{s.description}</p>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-green-700">${s.raisedAmount.toLocaleString()} raised</span>
          <span className="text-gray-400">of ${s.targetAmount.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        {s.school && (
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.school}</span>
        )}
        {s.fieldOfStudy && (
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{s.fieldOfStudy}</span>
        )}
        {s._count && (
          <span className="flex items-center gap-1 ml-auto"><Users className="w-3 h-3" />{s._count.donations} donors</span>
        )}
        {s.deadline && (
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.deadline).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}

