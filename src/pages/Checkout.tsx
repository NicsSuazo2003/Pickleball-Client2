import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Copy, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../stores/bookingStore';
import { bookingService } from '../services/bookingService';
import { formatTimeRange, formatCurrency, formatDateLong } from '../utils/format';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const GCASH_NUMBER = '09XX XXX XXXX';
const PAYMENT_MINUTES = 15;

type CheckoutStep = 1 | 2 | 3;

export default function Checkout() {
  const navigate = useNavigate();
  const { selectedDate, selectedSlots, customerName, customerEmail, customerPhone, notes, currentBooking, setCurrentBooking } =
    useBookingStore();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_MINUTES * 60);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalAmount = selectedSlots.reduce((s, sl) => s + sl.price, 0);

  // Redirect if no slots
  useEffect(() => {
    if (selectedSlots.length === 0 && !currentBooking) {
      navigate('/book');
    }
  }, []);

  // Timer for step 2
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const timerDisplay = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const timerUrgent = timeLeft < 120;

  const handleCreateBooking = async () => {
    setCreating(true);
    try {
      const booking = await bookingService.createBooking({
        customerName,
        customerEmail,
        customerPhone,
        date: selectedDate,
        slots: selectedSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount,
        notes: notes || undefined,
      });
      setCurrentBooking(booking);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create booking. Please try again.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5MB.');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, or WebP).');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !currentBooking) return;
    setUploading(true);
    try {
      console.log('📤 Uploading payment screenshot:', {
        bookingId: currentBooking.id,
        file: file.name,
        size: file.size,
        type: file.type
      });
      
      const updated = await bookingService.uploadPaymentScreenshot(currentBooking.id, file);
      setCurrentBooking(updated);
      setStep(3);
      toast.success('Payment screenshot uploaded!');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Response:', error.response?.data);
      const message = error.response?.data?.message || error.response?.data?.title || 'Upload failed. Please try again.';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDone = () => {
    navigate('/book/success');
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Checkout</h1>
        <p className="text-slate-500 mb-8">Complete your booking in a few steps.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Order Summary', 'GCash Payment', 'Upload Proof'].map((label, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 text-sm font-medium flex-1 ${active ? 'text-teal-600' : done ? 'text-teal-500' : 'text-slate-400'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    active ? 'bg-teal-600 text-white' : done ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <CheckCircle size={14} /> : n}
                  </span>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {idx < 2 && <div className={`h-px flex-1 max-w-6 ${done || active ? 'bg-teal-300' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5"
            >
              <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-700">{formatDateLong(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium text-slate-700">{customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-700">{customerEmail}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <p className="text-sm font-medium text-slate-600 mb-2">Selected Slots</p>
                {selectedSlots.map((slot) => (
                  <div key={slot.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                    <span className="font-medium text-slate-700">{formatCurrency(slot.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total Amount</span>
                <span className="text-2xl font-bold text-teal-600">{formatCurrency(totalAmount)}</span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleCreateBooking}
                loading={creating}
              >
                Pay Now
              </Button>

              <p className="text-xs text-slate-400 text-center">
                You'll receive payment instructions on the next step. Payment via GCash only.
              </p>
            </motion.div>
          )}

          {step === 2 && currentBooking && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-4"
            >
              {/* Timer */}
              <div className={`rounded-2xl p-4 flex items-center gap-3 ${timerUrgent ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                <Clock size={20} className={timerUrgent ? 'text-red-500' : 'text-amber-500'} />
                <div>
                  <p className={`text-sm font-semibold ${timerUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                    Payment expires in <span className="font-mono">{timerDisplay}</span>
                  </p>
                  <p className="text-xs text-slate-500">Complete your GCash payment before the timer runs out.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                <h2 className="text-lg font-semibold text-slate-800">GCash Payment</h2>

                <div className="bg-teal-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-teal-700 font-medium">GCash Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-teal-800 font-mono">{GCASH_NUMBER}</span>
                      <button
                        onClick={() => copy(GCASH_NUMBER, 'GCash number')}
                        className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-teal-700 font-medium">Amount</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-teal-800">{formatCurrency(totalAmount)}</span>
                      <button
                        onClick={() => copy(String(totalAmount), 'Amount')}
                        className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-teal-700 font-medium">Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-teal-800 font-mono">{currentBooking.referenceCode}</span>
                      <button
                        onClick={() => copy(currentBooking.referenceCode, 'Reference code')}
                        className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>Send exactly <strong>{formatCurrency(totalAmount)}</strong> to the GCash number above. Include your reference code in the payment notes. Then upload your screenshot below.</p>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(3)}
                >
                  I've Sent the Payment
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && currentBooking && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5"
            >
              <h2 className="text-lg font-semibold text-slate-800">Upload Payment Screenshot</h2>
              <p className="text-sm text-slate-500">Upload your GCash screenshot to confirm your payment. Admin will verify it shortly.</p>

              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                  file ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle size={32} className="mx-auto text-teal-500" />
                    <p className="text-sm font-medium text-teal-700">{file.name}</p>
                    <p className="text-xs text-teal-500">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-slate-300" />
                    <p className="text-sm text-slate-500">Click to upload screenshot</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!file}
                  icon={<Upload size={16} />}
                >
                  Submit Screenshot
                </Button>
              </div>

              <button
                onClick={handleDone}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                Skip for now — I'll upload later
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}