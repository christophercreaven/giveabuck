import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Scholarships } from './pages/Scholarships';
import { ScholarshipDetail } from './pages/ScholarshipDetail';
import { CreateScholarship } from './pages/CreateScholarship';
import { Dashboard } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/scholarships/new" element={<CreateScholarship />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} GiveABuck.org · Non-profit · Free to use · Ad-optional
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
