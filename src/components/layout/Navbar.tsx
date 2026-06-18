import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const appName = import.meta.env.VITE_APP_NAME || 'SideOut Playground';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/book', label: 'Book Now' },
  { to: '/track', label: 'Track Booking' },
  { to: '/demo', label: 'Demo' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-teal-700 shadow-lg shadow-teal-900/20' : 'bg-teal-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-teal-800" fill="currentColor" />
            </div>
            <span className="hidden sm:block">{appName}</span>
            <span className="sm:hidden">SideOut</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-white/20 text-white'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-400 text-teal-900'
                    : 'bg-amber-400/80 text-teal-900 hover:bg-amber-400'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-teal-500/50"
          >
            <nav className="px-4 pb-4 pt-2 flex flex-col gap-1 bg-teal-700">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-white/20 text-white'
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to="/admin" className="px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-400 text-teal-900 mt-1">
                  Admin Panel
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
