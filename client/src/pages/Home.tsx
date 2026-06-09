import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Scholarship } from '../lib/types';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { Heart, Trophy, Users, DollarSign, ArrowRight } from 'lucide-react';

interface Stats {
  totalDonors: number;
  totalStudents: number;
  totalRaised: number;
  totalScholarships: number;
}

export function Home() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/scholarships?status=OPEN').then((r) => setScholarships(r.data.slice(0, 3)));
    api.get('/users/stats').then((r) => setStats(r.data));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-10 h-10 text-green-600 fill-green-600" />
            <span className="text-4xl font-bold text-green-700">GiveABuck</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Pool your dollars.<br />
            <span className="text-green-600">Fund a future.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Small donations, big impact. Join donors across the country pooling gifts into real tuition scholarships — and help choose the students who receive them.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register?role=DONOR" className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg">
              Start Giving
            </Link>
            <Link to="/scholarships" className="bg-white text-green-700 border-2 border-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors text-lg">
              Browse Scholarships
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, label: 'Total Raised', value: `$${stats.totalRaised.toLocaleString()}`, color: 'text-green-600' },
              { icon: Heart, label: 'Scholarships', value: stats.totalScholarships, color: 'text-blue-600' },
              { icon: Users, label: 'Donors', value: stats.totalDonors.toLocaleString(), color: 'text-purple-600' },
              { icon: Trophy, label: 'Students', value: stats.totalStudents.toLocaleString(), color: 'text-orange-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How GiveABuck Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Donors Create Scholarships', desc: 'Anyone can start a scholarship for a school or field of study they care about. Set a target, write a description, and share it.' },
              { step: '2', title: 'Pool Small Donations', desc: 'Even $1 helps. Donors contribute what they can, and the community pools gifts until the scholarship goal is reached.' },
              { step: '3', title: 'Community Votes on Recipients', desc: 'Students apply, donors review essays, and the community votes to select deserving recipients. You decide who gets funded.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active scholarships */}
      {scholarships.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Active Scholarships</h2>
              <Link to="/scholarships" className="flex items-center gap-1 text-green-600 font-medium hover:underline text-sm">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {scholarships.map((s) => <ScholarshipCard key={s.id} s={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">A buck goes further than you think.</h2>
        <p className="text-green-100 mb-8 text-lg">Non-profit. Free to use. No hidden fees. Ad-optional.</p>
        <Link to="/register" className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors text-lg inline-block">
          Get Started Free
        </Link>
      </section>
    </div>
  );
}

