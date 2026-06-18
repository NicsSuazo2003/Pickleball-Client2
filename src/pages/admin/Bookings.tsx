import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, CheckCircle, XCircle, Clock, RefreshCw, Calendar } from 'lucide-react';
import { adminService, bookingService } from '../../services/bookingService';
import { courtService } from '../../services/courtService';
import type { Booking, TimeSlot } from '../../types';
import { formatDate, formatTimeRange, formatCurrency, getNext7Days } from '../../utils/format';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | Booking['status'];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_payment', label: 'Pending' },
  { value: 'payment_submitted', label: 'Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

function BookingDetailModal({ booking, onUpdate }: {
  booking: Booking; onClose?: () => void; onUpdate: (b: Booking) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const updated = await adminService.updateBookingStatus(booking.id, status);
      onUpdate(updated);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const actions: { label: string; status: string; variant: 'primary' | 'secondary' | 'outline' | 'destructive' }[] = [];
  if (booking.status === 'payment_submitted') {
    actions.push({ label: 'Confirm', status: 'confirmed', variant: 'primary' });
    actions.push({ label: 'Reject', status: 'cancelled', variant: 'destructive' });
  }
  if (booking.status === 'confirmed') {
    actions.push({ label: 'Mark Completed', status: 'completed', variant: 'secondary' });
    actions.push({ label: 'Cancel', status: 'cancelled', variant: 'destructive' });
  }
  if (booking.status === 'pending_payment') {
    actions.push({ label: 'Cancel', status: 'cancelled', variant: 'destructive' });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono">{booking.referenceCode}</p>
          <h3 className="text-lg font-semibold text-slate-800 mt-0.5">{booking.customerName}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Email</p>
          <p className="font-medium text-slate-700 truncate">{booking.customerEmail}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Phone</p>
          <p className="font-medium text-slate-700">{booking.customerPhone ?? '—'}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Date</p>
          <p className="font-medium text-slate-700">{formatDate(booking.date)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Amount</p>
          <p className="font-semibold text-teal-700">{formatCurrency(booking.totalAmount)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 col-span-2">
          <p className="text-xs text-slate-400 mb-0.5">Time Slots</p>
          <p className="font-medium text-slate-700">
            {booking.slots.map((s) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
          </p>
        </div>
        {booking.notes && (
          <div className="bg-slate-50 rounded-xl p-3 col-span-2">
            <p className="text-xs text-slate-400 mb-0.5">Notes</p>
            <p className="font-medium text-slate-700">{booking.notes}</p>
          </div>
        )}
      </div>

      {booking.paymentScreenshot && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Payment Screenshot</p>
          <img
            src={booking.paymentScreenshot}
            alt="Payment"
            className="rounded-xl border border-slate-200 w-full max-h-60 object-contain"
          />
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {actions.map((a) => (
            <Button
              key={a.status}
              variant={a.variant}
              size="sm"
              loading={updating}
              onClick={() => updateStatus(a.status)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewBookingModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Booking) => void }) {
  const days = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoadingSlots(true);
    courtService.getAvailability(selectedDate)
      .then((s) => { setSlots(s); setSelectedSlots([]); })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const total = selectedSlots.reduce((s, sl) => s + sl.price, 0);

  const handleCreate = async () => {
    if (!name || !email || selectedSlots.length === 0) return;
    setCreating(true);
    try {
      const booking = await bookingService.adminCreateBooking({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        date: selectedDate,
        slots: selectedSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
        totalAmount: total,
        notes: notes || undefined,
        status: 'confirmed',
      });
      onCreated(booking);
      toast.success('Booking created successfully');
      onClose();
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-base font-semibold text-slate-800">Create Manual Booking</h3>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">Date</p>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        >
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">Time Slots</p>
        {loadingSlots ? (
          <p className="text-xs text-slate-400">Loading slots...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.filter(s => s.isAvailable).map((slot) => {
              const sel = selectedSlots.some(s => s.id === slot.id);
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlots(prev => sel ? prev.filter(s => s.id !== slot.id) : [...prev, slot])}
                  className={`p-2 rounded-lg border text-xs transition-all ${sel ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-200 text-slate-600 hover:border-teal-300'}`}
                >
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Input label="Customer Name" value={name} onChange={e => setName(e.target.value)} required placeholder="Full name" />
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" />
      <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09XX XXX XXXX" />
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1.5">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none" />
      </div>

      {selectedSlots.length > 0 && (
        <div className="bg-teal-50 rounded-xl p-3">
          <p className="text-sm font-semibold text-teal-800">{formatCurrency(total)}</p>
          <p className="text-xs text-teal-600">{selectedSlots.length} slot(s) selected</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button className="flex-1" loading={creating} disabled={!name || !email || selectedSlots.length === 0} onClick={handleCreate}>
          Create Confirmed
        </Button>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    adminService.getBookings()
      .then(setBookings)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.referenceCode.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, reference..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadBookings} icon={<RefreshCw size={14} />}>
          Refresh
        </Button>
        <Button size="sm" onClick={() => setShowNewModal(true)} icon={<Plus size={14} />}>
          New Booking
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statusOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => setStatusFilter(o.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === o.value
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner className="py-16" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings found" description="Try changing your filters or search term." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Reference', 'Customer', 'Date', 'Time', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-teal-700 font-semibold">{b.referenceCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 whitespace-nowrap">{b.customerName}</p>
                      <p className="text-xs text-slate-400 truncate max-w-40">{b.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {b.slots.map((s) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal-700 whitespace-nowrap">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {b.status === 'payment_submitted' && (
                          <button
                            onClick={async () => {
                              const updated = await adminService.updateBookingStatus(b.id, 'confirmed').catch(() => null);
                              if (updated) {
                                setBookings((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                                toast.success('Confirmed');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {(b.status === 'pending_payment' || b.status === 'confirmed') && (
                          <button
                            onClick={async () => {
                              const updated = await adminService.updateBookingStatus(b.id, 'cancelled').catch(() => null);
                              if (updated) {
                                setBookings((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                                toast.success('Cancelled');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={async () => {
                              const updated = await adminService.updateBookingStatus(b.id, 'completed').catch(() => null);
                              if (updated) {
                                setBookings((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                                toast.success('Completed');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Complete"
                          >
                            <Clock size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} size="md">
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdate={(updated) => {
              setBookings((prev) => prev.map((b) => b.id === updated.id ? updated : b));
              setSelectedBooking(updated);
            }}
          />
        )}
      </Modal>

      {/* New booking modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} size="md">
        <NewBookingModal
          onClose={() => setShowNewModal(false)}
          onCreated={(b) => setBookings((prev) => [b, ...prev])}
        />
      </Modal>
    </div>
  );
}
