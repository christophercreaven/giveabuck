import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-green-600 font-bold text-2xl">
            <Heart className="w-7 h-7 fill-green-600" /> GiveABuck
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✉️
              </div>
              <p className="font-medium text-gray-900">Check your inbox</p>
              <p className="text-sm text-gray-500">
                If <strong>{email}</strong> is registered, a reset link is on its way.
                The link expires in 1 hour.
              </p>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                Running locally? The reset link is printed in the server console.
              </p>
              <Link to="/login" className="block text-sm text-green-600 font-medium hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
