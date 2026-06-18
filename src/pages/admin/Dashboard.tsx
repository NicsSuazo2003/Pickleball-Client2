import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Users,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { adminService } from '../../services/bookingService';
import type { Analytics, Booking } from '../../types';
import { formatCurrency, formatDate, formatTimeRange } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

function StatCard({ label, value, growth, icon: Icon, color }: {
  label: string; value: string; growth: number; icon: React.ElementType; color: string;
}) {
  const isUp = growth >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-teal-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(growth)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      adminService.getAnalytics().catch(() => null),
      adminService.getBookings().catch(() => []),
    ]).then(([a, b]) => {
      setAnalytics(a);
      setTodayBookings((b as Booking[]).filter((bk) => bk.date === today));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={analytics ? formatCurrency(analytics.totalRevenue) : '₱0.00'}
          growth={analytics?.revenueGrowth ?? 0}
          icon={DollarSign}
          color="bg-teal-500"
        />
        <StatCard
          label="Total Bookings"
          value={analytics ? String(analytics.totalBookings) : '0'}
          growth={analytics?.bookingsGrowth ?? 0}
          icon={Calendar}
          color="bg-amber-500"
        />
        <StatCard
          label="Active Customers"
          value={analytics ? String(analytics.activeUsers) : '0'}
          growth={analytics?.usersGrowth ?? 0}
          icon={Users}
          color="bg-rose-400"
        />
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Revenue (7 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.revenueByDay}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => formatDate(v).slice(0, 6)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="amount" stroke="#0d9488" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Bookings (7 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => formatDate(v).slice(0, 6)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Today's schedule */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">Today's Schedule</h3>
          <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
            {todayBookings.length} booking{todayBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">No bookings today.</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{b.customerName}</p>
                  <p className="text-xs text-slate-500">
                    {b.slots.map((s: { startTime: string; endTime: string }) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={b.status} />
                  <p className="text-xs font-semibold text-slate-700 mt-1">{formatCurrency(b.totalAmount)}</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
