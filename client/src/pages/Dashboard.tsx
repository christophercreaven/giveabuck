import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Donation, Application } from '../lib/types';
import { Heart, BookOpen, Trophy, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user?.role === 'DONOR') api.get('/donations/my').then((r) => setDonations(r.data));
    if (user?.role === 'STUDENT') api.get('/applications/my').then((r) => setApplications(r.data));
  }, [user]);

  if (!user) return null;

  const totalGiven = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 capitalize">{user.role.toLowerCase()} · {user.email}</p>
          {user.school && <p className="text-sm text-gray-400">{user.school}{user.major ? ` · ${user.major}` : ''}</p>}
        </div>
      </div>

      {user.role === 'DONOR' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-700">${totalGiven.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Given</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-700">{donations.length}</div>
              <div className="text-xs text-gray-500">Donations</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-700">
                {new Set(donations.map((d) => d.scholarshipId)).size}
              </div>
              <div className="text-xs text-gray-500">Scholarships Supported</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Donations</h2>
            <Link to="/scholarships" className="text-sm text-green-600 font-medium hover:underline">Browse scholarships &rarr;</Link>
          </div>

          {donations.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't donated yet.</p>
              <Link to="/scholarships" className="mt-3 inline-block bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                Find a scholarship
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <Link key={d.id} to={`/scholarships/${d.scholarshipId}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-green-300 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{d.scholarship?.title}</div>
                    <div className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}{d.message ? ` · "${d.message}"` : ''}</div>
                  </div>
                  <span className="font-semibold text-green-600">${d.amount}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {user.role === 'STUDENT' && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Applications</h2>
          {applications.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't applied to any scholarships yet.</p>
              <Link to="/scholarships" className="mt-3 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Find scholarships
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((a) => (
                <Link key={a.id} to={`/scholarships/${a.scholarshipId}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{a.scholarship?.title}</div>
                    <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()} · {a._count?.votes ?? 0} votes</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                    a.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    a.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
