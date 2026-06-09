import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Trophy, BookOpen } from 'lucide-react';

interface LeaderEntry {
  school?: string | null;
  fieldOfStudy?: string | null;
  _sum: { raisedAmount: number | null };
  _count: { id: number };
}

export function Leaderboard() {
  const [data, setData] = useState<{ bySchool: LeaderEntry[]; byField: LeaderEntry[] } | null>(null);

  useEffect(() => { api.get('/scholarships/leaderboard').then((r) => setData(r.data)); }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-2">Schools and fields competing to raise the most for their students.</p>
      </div>

      {data ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> By School
            </h2>
            <div className="space-y-3">
              {data.bySchool.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
              {data.bySchool.map((entry, i) => (
                <div key={entry.school} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
                  <span className="text-2xl">{medals[i] ?? `#${i + 1}`}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{entry.school}</div>
                    <div className="text-xs text-gray-400">{entry._count.id} scholarship{entry._count.id !== 1 ? 's' : ''}</div>
                  </div>
                  <span className="text-green-600 font-bold">${(entry._sum.raisedAmount ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> By Field of Study
            </h2>
            <div className="space-y-3">
              {data.byField.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
              {data.byField.map((entry, i) => (
                <div key={entry.fieldOfStudy} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4">
                  <span className="text-2xl">{medals[i] ?? `#${i + 1}`}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{entry.fieldOfStudy}</div>
                    <div className="text-xs text-gray-400">{entry._count.id} scholarship{entry._count.id !== 1 ? 's' : ''}</div>
                  </div>
                  <span className="text-green-600 font-bold">${(entry._sum.raisedAmount ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      )}
    </div>
  );
}
