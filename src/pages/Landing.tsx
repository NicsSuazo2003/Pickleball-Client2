import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Clock, CheckCircle, CreditCard, MapPin,
  Star, Users, Zap, ChevronRight, Wifi, Wind, Droplets, Lightbulb
} from 'lucide-react';
import { courtService } from '../services/courtService';
import type { Court, TimeSlot } from '../types';
import { formatTime, formatCurrency, formatTimeRange } from '../utils/format';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';

const TODAY = new Date().toISOString().split('T')[0];

const amenityIcon: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={14} />,
  'Air Conditioning': <Wind size={14} />,
  Showers: <Droplets size={14} />,
  Lighting: <Lightbulb size={14} />,
};

export default function Landing() {
  const [court, setCourt] = useState<Court | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courtService.getCourt().catch(() => null),
      courtService.getAvailability(TODAY).catch(() => []),
    ]).then(([c, s]) => {
      setCourt(c);
      setSlots(s as TimeSlot[]);
      setLoading(false);
    });
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-teal-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/80 to-teal-500/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Zap size={13} fill="currentColor" /> Now Open for Bookings
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Book Your<br />
              <span className="text-amber-300">Pickleball Court</span><br />
              in Seconds
            </h1>
            <p className="text-lg text-teal-100 mb-8 max-w-lg">
              Enjoy premium pickleball facilities at SideOut Playground. Easy online booking, instant confirmation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/book">
                <Button size="lg" variant="secondary" icon={<CalendarDays size={18} />}>
                  Book a Court
                </Button>
              </Link>
              <Link to="/track">
                <Button
                  size="lg"
                  className="bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-xl"
                  variant="ghost"
                >
                  Track Booking
                </Button>
              </Link>
            </div>

            {court && (
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-300">{formatCurrency(court.pricePerHour)}</p>
                  <p className="text-xs text-teal-200">per hour</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatTime(court.openTime)} – {formatTime(court.closeTime)}</p>
                  <p className="text-xs text-teal-200">operating hours</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="flex justify-center">
                    <StarRating rating={court.rating} />
                  </div>
                  <p className="text-xs text-teal-200">court rating</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Today's Availability */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Today's Availability</h2>
            <p className="text-slate-500">Check what time slots are open for today</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock size={40} className="mx-auto mb-3 opacity-30" />
              <p>No slots available today</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slots.map((slot) => (
                <motion.div
                  key={slot.id}
                  whileHover={{ y: -2 }}
                  className={`rounded-xl p-3 text-center border-2 transition-all ${
                    slot.isAvailable
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </p>
                  <p className={`text-xs font-semibold ${slot.isAvailable ? 'text-teal-600' : 'text-slate-400'}`}>
                    {slot.isAvailable ? formatCurrency(slot.price) : 'Booked'}
                  </p>
                  <span
                    className={`mt-1.5 inline-block w-2 h-2 rounded-full ${
                      slot.isAvailable ? 'bg-teal-500' : 'bg-slate-300'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/book">
              <Button size="lg" icon={<CalendarDays size={17} />}>
                Book a Slot Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Court Info */}
      {court && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp}>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">The Court</span>
                  <h2 className="text-3xl font-bold text-slate-800 mt-2 mb-4">{court.name}</h2>
                  <p className="text-slate-500 mb-6">
                    {court.indoor ? 'Indoor' : 'Outdoor'} court with {court.surface} surface.
                    {court.dimensions && ` Dimensions: ${court.dimensions}.`}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-400 mb-1">Price per Hour</p>
                      <p className="text-xl font-bold text-teal-600">{formatCurrency(court.pricePerHour)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-400 mb-1">Operating Hours</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatTime(court.openTime)} – {formatTime(court.closeTime)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-3">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {court.amenities.map((a) => (
                        <span
                          key={a}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium"
                        >
                          {amenityIcon[a] ?? <CheckCircle size={12} />} {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={court.imageUrl || 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={court.name}
                    className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-teal-600" />
                      <span className="text-sm font-medium text-slate-700">Purok Million, Dawis, Tandag City</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">How It Works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CalendarDays, step: '01', title: 'Pick a Date', desc: 'Choose from the next 7 available days that works for you.' },
              { icon: Clock, step: '02', title: 'Select Slots', desc: 'Pick one or more time slots that fit your schedule.' },
              { icon: Users, step: '03', title: 'Fill Details', desc: 'Enter your name, email, and contact number.' },
              { icon: CreditCard, step: '04', title: 'Pay via GCash', desc: 'Send payment and upload your screenshot to confirm.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative bg-gray-50 rounded-2xl p-6 border border-slate-100"
              >
                <span className="absolute top-4 right-4 text-4xl font-bold text-slate-100">{item.step}</span>
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-teal-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
                {idx < 3 && (
                  <ChevronRight
                    size={20}
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 z-10"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <Star size={32} className="mx-auto mb-4 text-amber-300" fill="currentColor" />
            <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-teal-100 mb-8 text-lg">
              Book your court now and experience the best pickleball facilities in town.
            </p>
            <Link to="/book">
              <Button size="lg" variant="secondary">
                Book a Court Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
