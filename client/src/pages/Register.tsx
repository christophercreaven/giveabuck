import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: (params.get('role') as 'DONOR' | 'STUDENT') || 'DONOR',
    school: '', major: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, school: form.school || undefined, major: form.major || undefined });
      toast.success('Welcome to GiveABuck!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-green-600 font-bold text-2xl">
            <Heart className="w-7 h-7 fill-green-600" /> GiveABuck
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your free account</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            {(['DONOR', 'STUDENT'] as const).map((r) => (
              <button
                key={r} type="button" onClick={() => set('role', r)}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${form.role === r ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {r === 'DONOR' ? '💚 I want to give' : '🎓 I want to apply'}
              </button>
            ))}
          </div>

          {[
            { label: 'Full name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '8+ characters' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type} required value={(form as any)[key]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={placeholder}
                minLength={key === 'password' ? 8 : undefined}
              />
            </div>
          ))}

          {form.role === 'STUDENT' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <input
                  type="text" value={form.school} onChange={(e) => set('school', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="University of Michigan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                <input
                  type="text" value={form.major} onChange={(e) => set('major', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Computer Science"
                />
              </div>
            </>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
