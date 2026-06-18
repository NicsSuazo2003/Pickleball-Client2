import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'SideOut Playground';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/30">
            <Zap size={26} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{appName}</h1>
          <p className="text-slate-500 text-sm mt-1">Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          For admin access only
        </p>
      </motion.div>
    </div>
  );
}
