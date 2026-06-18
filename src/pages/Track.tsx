import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types';
import { formatTimeRange, formatCurrency, formatDateLong } from '../utils/format';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function Track() {
  const [refCode, setRefCode] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim()) {
      setError('Please enter a reference code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await bookingService.trackBooking(refCode.trim(), email.trim() || undefined);
      setBooking(result);
    } catch {
      setError('Booking not found. Check your reference code and email.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !booking) return;
    setUploading(true);
    try {
      const updated = await bookingService.uploadPaymentScreenshot(booking.id, uploadFile);
      setBooking(updated);
      setUploadFile(null);
      toast.success('Screenshot uploaded successfully!');
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Track Your Booking</h1>
          <p className="text-slate-500">Enter your reference code to check your booking status.</p>
        </motion.div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Reference Code"
              placeholder="e.g. BOOK-ABC123"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              required
              error={error}
            />
            <Input
              label="Email (optional)"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading} icon={<Search size={16} />}>
              Track Booking
            </Button>
          </form>
        </div>

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Reference</p>
                <p className="text-xl font-bold font-mono text-teal-700">{booking.referenceCode}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-slate-700">{booking.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-700">{formatDateLong(booking.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Time Slots</span>
                <span className="font-medium text-slate-700">
                  {booking.slots.map((s) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-teal-700">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Status messages */}
            {booking.status === 'pending_payment' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Payment Pending</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Please complete your GCash payment and upload the screenshot below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === 'payment_submitted' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Payment Under Review</p>
                    <p className="text-xs text-blue-700 mt-0.5">Your payment screenshot has been submitted. Admin will confirm shortly.</p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-teal-500 mt-0.5 shrink-0" fill="currentColor" />
                  <div>
                    <p className="text-sm font-semibold text-teal-800">Booking Confirmed!</p>
                    <p className="text-xs text-teal-700 mt-0.5">Your court is reserved. See you on the court!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload section for pending payment */}
            {(booking.status === 'pending_payment') && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Upload Payment Screenshot</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    uploadFile ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  {uploadFile ? (
                    <p className="text-sm text-teal-700 font-medium">{uploadFile.name}</p>
                  ) : (
                    <div className="space-y-1">
                      <Upload size={24} className="mx-auto text-slate-300" />
                      <p className="text-sm text-slate-500">Click to upload</p>
                    </div>
                  )}
                </div>
                <Button
                  size="md"
                  className="w-full mt-3"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!uploadFile}
                  icon={<Upload size={14} />}
                >
                  Submit Screenshot
                </Button>
              </div>
            )}

            {/* Payment screenshot preview */}
            {booking.paymentScreenshot && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Payment Screenshot</p>
                <img
                  src={booking.paymentScreenshot}
                  alt="Payment screenshot"
                  className="rounded-xl border border-slate-200 max-h-64 object-contain w-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
