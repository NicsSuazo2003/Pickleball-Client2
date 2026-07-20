import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import logo from '../../assets/logo.png'; // ✅ Import the logo

const appName = import.meta.env.VITE_APP_NAME || 'SideOut Playground';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {/* ✅ Logo Image */}
              <img 
                src={logo} 
                alt="SideOut Playground Logo" 
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="text-white font-bold text-lg">{appName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premier pickleball destination. Book your court, play your game, love the sport.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-slate-700 hover:bg-teal-600 rounded-lg transition-colors text-slate-300">
                IG
              </a>
              <a href="#" className="p-2 bg-slate-700 hover:bg-teal-600 rounded-lg transition-colors text-slate-300">
                FB
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/book', label: 'Book a Court' },
                { to: '/track', label: 'Track Booking' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-teal-400 mt-0.5 shrink-0" />
                <span>Purok Million, Barangay San Agustin Sur (DAWIS), Tandag City</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-teal-400 shrink-0" />
                <span>09561853355 | 09058100973</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-teal-400 shrink-0" />
                <span>nicssuazo@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {appName}. All rights reserved. Astravex Systems
        </div>
      </div>
    </footer>
  );
}