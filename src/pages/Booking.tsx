import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ChevronRight, CheckCircle, X, Star } from 'lucide-react';
import { courtService } from '../services/courtService';
import { useBookingStore } from '../stores/bookingStore';
import type { TimeSlot } from '../types';
import { formatTimeRange, formatCurrency, getNext7Days, dayLabel } from '../utils/format';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { useForm } from 'react-hook-form';
import type { BookingFormData } from '../types';

export default function Booking() {
  const navigate = useNavigate();
  const {
    selectedDate, selectedSlots, setSelectedDate, toggleSlot,
    setCustomerInfo,
  } = useBookingStore();

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const days = getNext7Days();

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<BookingFormData>();

  useEffect(() => {
    setLoadingSlots(true);
    
    // ✅ Fetch both court settings and availability
    Promise.all([
      courtService.getCourt(),
      courtService.getAvailability(selectedDate)
    ])
      .then(([courtData, fetchedSlots]) => {
        // ✅ Get base price from court settings (fallback to 150)
        const basePrice = courtData?.pricePerHour || 150;
        const twoHourPrice = basePrice * 2; // ✅ Dynamic 2-hour price
        
        // ✅ Remove 4-5 PM and 5-6 PM slots
        let filteredSlots = fetchedSlots.filter(s => 
          !(s.startTime === '16:00' && s.endTime === '17:00') &&
          !(s.startTime === '17:00' && s.endTime === '18:00')
        );
        
        // ✅ Add fixed 4-6 PM slot with dynamic price
        const has4to6 = filteredSlots.some(s => 
          s.startTime === '16:00' && s.endTime === '18:00'
        );
        
        let allSlots = filteredSlots;
        if (!has4to6) {
          const fixedSlot: TimeSlot = {
            id: `fixed-${selectedDate}-16-18`,
            date: selectedDate,
            startTime: '16:00',
            endTime: '18:00',
            isAvailable: true,
            price: twoHourPrice, // ✅ Dynamic – updates with court settings
          };
          allSlots = [...filteredSlots, fixedSlot];
        }
        
        // ✅ Sort by time
        allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setSlots(allSlots);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);

  const onSubmit = (data: BookingFormData) => {
    setCustomerInfo({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      notes: data.notes ?? '',
    });
    navigate('/book/checkout');
  };

  // Check if a slot is the fixed 4-6 PM slot
  const isFixedSlot = (slot: TimeSlot) => {
    return slot.startTime === '16:00' && slot.endTime === '18:00';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Book a Court</h1>
          <p className="text-slate-500 mt-1">Select your date, time slots, and fill in your details.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { n: 1, label: 'Select Slots' },
            { n: 2, label: 'Your Details' },
          ].map((s, idx) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => step > (s.n as 1 | 2) && setStep(s.n as 1 | 2)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  step === s.n
                    ? 'bg-teal-600 text-white'
                    : step > s.n
                    ? 'bg-teal-100 text-teal-700 cursor-pointer'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.n ? 'bg-white/30' : step > s.n ? 'bg-teal-500 text-white' : 'bg-slate-200'
                }`}>
                  {step > s.n ? <CheckCircle size={14} /> : s.n}
                </span>
                {s.label}
              </button>
              {idx < 1 && <ChevronRight size={16} className="text-slate-300" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Date picker */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-teal-600" /> Choose Date
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {days.map((d) => {
                      const { day, date, isToday } = dayLabel(d);
                      const active = selectedDate === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all text-center min-w-[72px] ${
                            active
                              ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                          }`}
                        >
                          <span className={`text-xs font-medium ${active ? 'text-teal-100' : isToday ? 'text-teal-600' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          <span className={`text-sm font-bold mt-0.5 ${active ? 'text-white' : 'text-slate-700'}`}>{date}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-teal-600" /> Available Slots
                  </h2>
                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map((slot) => {
                        const selected = selectedSlots.some((s) => s.id === slot.id);
                        const fixed = isFixedSlot(slot);
                        return (
                          <motion.button
                            key={slot.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => slot.isAvailable && toggleSlot(slot)}
                            disabled={!slot.isAvailable}
                            className={`rounded-xl p-3 text-left border-2 transition-all relative ${
                              !slot.isAvailable
                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                : selected
                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20'
                                : fixed
                                ? 'bg-amber-50 border-amber-400 text-slate-700 hover:border-amber-500 hover:shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:shadow-sm'
                            }`}
                          >
                            {/* ✅ "2hr Fixed" badge */}
                            {fixed && (
                              <span className="absolute top-1 right-1 flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                <Star size={10} fill="currentColor" /> 2hr Fixed
                              </span>
                            )}
                            <p className={`text-xs font-medium mb-1 ${selected ? 'text-teal-100' : fixed ? 'text-amber-600' : 'text-slate-500'}`}>
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </p>
                            <p className={`text-sm font-semibold ${selected ? 'text-white' : slot.isAvailable ? fixed ? 'text-amber-600' : 'text-teal-600' : 'text-slate-300'}`}>
                              {slot.isAvailable ? formatCurrency(slot.price) : 'Booked'}
                            </p>
                            {selected && (
                              <div className="mt-1.5 flex items-center gap-1 text-teal-200 text-xs">
                                <CheckCircle size={11} fill="currentColor" /> Selected
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={selectedSlots.length === 0}
                    icon={<ChevronRight size={18} />}
                  >
                    Continue to Details
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <User size={18} className="text-teal-600" /> Your Details
                  </h2>

                  <Input
                    label="Full Name"
                    placeholder="Juan dela Cruz"
                    required
                    {...register('customerName', { required: 'Name is required' })}
                    error={errors.customerName?.message}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="juan@example.com"
                    required
                    {...register('customerEmail', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                    error={errors.customerEmail?.message}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    required
                    {...register('customerPhone', { required: 'Phone is required' })}
                    error={errors.customerPhone?.message}
                  />
                  <Textarea
                    label="Notes (optional)"
                    placeholder="Any special requests or notes..."
                    rows={3}
                    {...register('notes')}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" icon={<ChevronRight size={18} />}>
                      Proceed to Checkout
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Booking Summary</h3>

              {selectedSlots.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No slots selected yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {selectedSlots.map((slot) => {
                    const fixed = isFixedSlot(slot);
                    return (
                      <div key={slot.id} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${fixed ? 'text-amber-600' : 'text-slate-700'}`}>
                            {formatTimeRange(slot.startTime, slot.endTime)}
                            {fixed && (
                              <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                                2hr Fixed
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${fixed ? 'text-amber-600' : 'text-teal-600'}`}>
                            {formatCurrency(slot.price)}
                          </span>
                          <button
                            onClick={() => toggleSlot(slot)}
                            className="p-1 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Total</span>
                  <span className="text-xl font-bold text-teal-700">{formatCurrency(totalAmount)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}