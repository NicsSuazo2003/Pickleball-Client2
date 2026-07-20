import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Calendar, Search } from 'lucide-react';
import { useBookingStore } from '../stores/bookingStore';
import { formatTimeRange, formatCurrency, formatDateLong } from '../utils/format';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, resetBooking } = useBookingStore();
  
  // ✅ Use booking from location state if available, otherwise from store
  const booking = location.state?.booking || currentBooking;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Reference code copied!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/60 border border-slate-100 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-teal-600" fill="currentColor" />
          </motion.div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking Submitted!</h1>
          <p className="text-slate-500 mb-6">
            Your booking has been received. Please wait for admin confirmation after payment is verified.
          </p>

          {/* Reference code */}
          <div className="bg-teal-50 rounded-2xl p-4 mb-6">
            <p className="text-xs font-medium text-teal-600 mb-2 uppercase tracking-wide">Reference Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold font-mono text-teal-800 tracking-widest">
                {booking.referenceCode}
              </span>
              <button
                onClick={() => copy(booking.referenceCode)}
                className="p-2 text-teal-500 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-teal-500 mt-2">Save this code to track your booking</p>
          </div>

          {/* Booking details */}
          <div className="text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-700">{formatDateLong(booking.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-slate-700">
                {booking.slots.map((s: any) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-bold text-teal-700">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/track">
              <Button size="lg" className="w-full" icon={<Search size={16} />}>
                Track My Booking
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              icon={<Calendar size={16} />}
              onClick={() => { resetBooking(); navigate('/book'); }}
            >
              Book Another Court
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}