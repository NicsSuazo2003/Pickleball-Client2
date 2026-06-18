import { useEffect, useState, useMemo } from 'react';
import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';
import { adminService } from '../../services/bookingService';
import type { Booking } from '../../types';
import { formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

interface CustomerRow {
  name: string;
  email: string;
  phone: string;
  bookings: number;
  lastBooking: string;
}

export default function AdminCustomers() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    bookings.forEach((b) => {
      const key = b.customerEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.bookings += 1;
        if (b.date > existing.lastBooking) existing.lastBooking = b.date;
      } else {
        map.set(key, {
          name: b.customerName,
          email: b.customerEmail,
          phone: b.customerPhone ?? '—',
          bookings: 1,
          lastBooking: b.date,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings);
  }, [bookings]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Users size={14} />
          {customers.length} unique customer{customers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Customer', 'Email', 'Phone', 'Bookings', 'Last Booking'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={13} className="text-slate-300" /> {c.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={13} className="text-slate-300" /> {c.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {c.bookings}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} className="text-slate-300" /> {formatDate(c.lastBooking)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
