import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, CreditCard, CheckCircle, ChevronRight,
  Info, Copy, Upload, Zap, Star,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import StatusBadge from '../components/ui/StatusBadge';
import { formatTimeRange, formatCurrency, formatDateLong, getNext7Days, dayLabel } from '../utils/format';
import toast from 'react-hot-toast';

// Mock data — no API calls
const MOCK_SLOTS = [
  { id: '1', date: '', startTime: '06:00', endTime: '07:00', isAvailable: false, price: 200 },
  { id: '2', date: '', startTime: '07:00', endTime: '08:00', isAvailable: true, price: 200 },
  { id: '3', date: '', startTime: '08:00', endTime: '09:00', isAvailable: true, price: 250 },
  { id: '4', date: '', startTime: '09:00', endTime: '10:00', isAvailable: true, price: 250 },
  { id: '5', date: '', startTime: '10:00', endTime: '11:00', isAvailable: false, price: 250 },
  { id: '6', date: '', startTime: '11:00', endTime: '12:00', isAvailable: true, price: 300 },
  { id: '7', date: '', startTime: '12:00', endTime: '13:00', isAvailable: true, price: 300 },
  { id: '8', date: '', startTime: '13:00', endTime: '14:00', isAvailable: false, price: 300 },
  { id: '9', date: '', startTime: '14:00', endTime: '15:00', isAvailable: true, price: 250 },
  { id: '10', date: '', startTime: '15:00', endTime: '16:00', isAvailable: true, price: 250 },
  { id: '11', date: '', startTime: '16:00', endTime: '17:00', isAvailable: true, price: 200 },
  { id: '12', date: '', startTime: '17:00', endTime: '18:00', isAvailable: false, price: 200 },
];

const DEMO_REF = 'DEMO-789XYZ';
const GCASH_NUM = '09XX XXX XXXX';

type DemoSlot = typeof MOCK_SLOTS[number];

interface Tooltip {
  id: string;
  text: string;
}

const tips: Tooltip[] = [
  { id: 'date', text: 'Customers pick from the next 7 days. Unavailable/blocked dates are hidden.' },
  { id: 'slots', text: 'Each slot is 1 hour. Green = available, gray = booked. Prices can vary by time.' },
  { id: 'form', text: 'Customer details are saved. Email is used for booking confirmation and tracking.' },
  { id: 'payment', text: 'GCash-only payments with a 15-minute countdown. Admin gets notified instantly.' },
  { id: 'upload', text: 'Customer uploads their GCash screenshot. Admin verifies and confirms the booking.' },
  { id: 'confirmed', text: 'Admin clicks Confirm in the dashboard. Customer receives their reference code.' },
];

function TipBubble({ tip }: { tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow((s) => !s)}
        className="ml-2 p-1 text-amber-500 hover:text-amber-600 rounded-full hover:bg-amber-50 transition-colors"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-20 bottom-full left-0 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl"
          >
            {tip}
            <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type DemoStep = 1 | 2 | 3 | 4 | 5;

export default function Demo() {
  const days = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(days[1]);
  const [selectedSlots, setSelectedSlots] = useState<DemoSlot[]>([]);
  const [step, setStep] = useState<DemoStep>(1);
  const [name, setName] = useState('Maria Santos');
  const [email, setEmail] = useState('maria@example.com');
  const [phone, setPhone] = useState('09991234567');
  const [notes, setNotes] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const totalAmount = selectedSlots.reduce((s, sl) => s + sl.price, 0);

  const toggleSlot = (slot: DemoSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlots((prev) => {
      const exists = prev.find((s) => s.id === slot.id);
      return exists ? prev.filter((s) => s.id !== slot.id) : [...prev, slot];
    });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const stepConfig = [
    { n: 1, label: 'Pick Date & Slots' },
    { n: 2, label: 'Your Details' },
    { n: 3, label: 'Order Review' },
    { n: 4, label: 'Payment' },
    { n: 5, label: 'Success' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Demo Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Live Demo Mode</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This is a fully interactive demo using sample data — no real bookings are made. Click the <Info size={11} className="inline" /> icons for explanations.
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {stepConfig.map((s, idx) => (
            <div key={s.n} className="flex items-center gap-1 flex-1 min-w-0">
              <button
                onClick={() => step > (s.n as DemoStep) && setStep(s.n as DemoStep)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-1 ${
                  step === s.n
                    ? 'bg-teal-600 text-white shadow-sm'
                    : step > s.n
                    ? 'bg-teal-100 text-teal-700 cursor-pointer'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  step === s.n ? 'bg-white/30' : step > s.n ? 'bg-teal-500 text-white' : 'bg-slate-100'
                }`}>
                  {step > s.n ? <CheckCircle size={12} /> : s.n}
                </span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {idx < stepConfig.length - 1 && (
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Date & Slots */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Calendar size={17} className="text-teal-600" /> Pick a Date
                  <TipBubble tip={tips[0].text} />
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {days.map((d) => {
                    const { day, date, isToday } = dayLabel(d);
                    const active = selectedDate === d;
                    return (
                      <button
                        key={d}
                        onClick={() => { setSelectedDate(d); setSelectedSlots([]); }}
                        className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all min-w-[70px] ${
                          active ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                        }`}
                      >
                        <span className={`text-xs font-medium ${active ? 'text-teal-100' : isToday ? 'text-teal-600' : 'text-slate-400'}`}>{day}</span>
                        <span className={`text-sm font-bold mt-0.5 ${active ? 'text-white' : 'text-slate-700'}`}>{date}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Clock size={17} className="text-teal-600" /> Select Time Slots
                  <TipBubble tip={tips[1].text} />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {MOCK_SLOTS.map((slot) => {
                    const selected = selectedSlots.some((s) => s.id === slot.id);
                    return (
                      <motion.button
                        key={slot.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={`rounded-xl p-3 text-left border-2 transition-all ${
                          !slot.isAvailable
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                            : selected
                            ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                        }`}
                      >
                        <p className={`text-xs font-medium mb-1 ${selected ? 'text-teal-100' : 'text-slate-500'}`}>
                          {formatTimeRange(slot.startTime, slot.endTime)}
                        </p>
                        <p className={`text-sm font-semibold ${selected ? 'text-white' : slot.isAvailable ? 'text-teal-600' : 'text-slate-300'}`}>
                          {slot.isAvailable ? formatCurrency(slot.price) : 'Booked'}
                        </p>
                        {selected && <p className="text-xs text-teal-200 mt-1">✓ Selected</p>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div>
                  <p className="text-sm text-slate-500">{selectedSlots.length} slot(s) selected</p>
                  <p className="text-xl font-bold text-teal-700">{formatCurrency(totalAmount)}</p>
                </div>
                <Button size="lg" onClick={() => setStep(2)} disabled={selectedSlots.length === 0}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <User size={17} className="text-teal-600" /> Customer Details
                  <TipBubble tip={tips[2].text} />
                </h2>
                <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                  Pre-filled with sample data for demo purposes.
                </p>
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" className="flex-1" onClick={() => setStep(3)} disabled={!name || !email || !phone}>
                    Review Order
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle size={17} className="text-teal-600" /> Order Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-medium">{name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium">{email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{formatDateLong(selectedDate)}</span></div>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  {selectedSlots.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{formatTimeRange(s.startTime, s.endTime)}</span>
                      <span className="font-medium">{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-teal-700">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button size="lg" className="flex-1" icon={<CreditCard size={16} />} onClick={() => setStep(4)}>
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={18} className="text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Payment Timer (Demo)</p>
                  <p className="text-xs text-amber-600">In real bookings, a 15-minute countdown appears here. <TipBubble tip={tips[3].text} /></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard size={17} className="text-teal-600" /> GCash Payment
                </h2>
                <div className="bg-teal-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 font-medium">GCash Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-teal-800">{GCASH_NUM}</span>
                      <button onClick={() => copy(GCASH_NUM, 'GCash number')} className="p-1.5 text-teal-500 hover:bg-teal-100 rounded-lg">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 font-medium">Amount</span>
                    <span className="text-xl font-bold text-teal-800">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700 font-medium">Reference</span>
                    <span className="font-bold font-mono text-teal-800">{DEMO_REF}</span>
                  </div>
                </div>

                {/* Upload demo */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
                    Upload Screenshot <TipBubble tip={tips[4].text} />
                  </p>
                  <div
                    onClick={() => document.getElementById('demo-upload')?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      uploadFile ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <input
                      id="demo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                    {uploadFile ? (
                      <div className="space-y-1">
                        <CheckCircle size={28} className="mx-auto text-teal-500" />
                        <p className="text-sm text-teal-700 font-medium">{uploadFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload size={28} className="mx-auto text-slate-300" />
                        <p className="text-sm text-slate-500">Tap to upload screenshot (demo)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button size="lg" className="flex-1" onClick={() => setStep(5)} icon={<CheckCircle size={16} />}>
                    Submit (Demo)
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={40} className="text-teal-600" fill="currentColor" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed! (Demo)</h2>
              <p className="text-slate-500 mb-6">This is what customers see after successful booking.</p>

              <div className="bg-teal-50 rounded-2xl p-4 mb-6 inline-block w-full">
                <p className="text-xs font-medium text-teal-600 mb-1 uppercase tracking-wide">Reference Code</p>
                <p className="text-3xl font-bold font-mono text-teal-800 tracking-widest">{DEMO_REF}</p>
              </div>

              <div className="text-left space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status="confirmed" /></div>
                <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-medium">{name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{formatDateLong(selectedDate)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold text-teal-700">{formatCurrency(totalAmount)}</span></div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <Info size={13} /> Admin Experience
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {tips[5].text}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  variant="secondary"
                  icon={<Star size={16} />}
                  onClick={() => {
                    setStep(1);
                    setSelectedSlots([]);
                    setUploadFile(null);
                  }}
                >
                  Start Demo Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
