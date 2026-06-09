import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, User, PlusCircle } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-green-600 font-bold text-xl">
          <Heart className="w-6 h-6 fill-green-600" />
          GiveABuck
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/scholarships" className="hover:text-green-600 transition-colors">Scholarships</Link>
          <Link to="/leaderboard" className="hover:text-green-600 transition-colors">Leaderboard</Link>
          {user?.role === 'DONOR' && (
            <Link to="/scholarships/new" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Create
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
                <User className="w-4 h-4" />
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
