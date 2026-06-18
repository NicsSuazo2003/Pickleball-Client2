import { useEffect, useState } from 'react';
import { Download, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { adminService } from '../../services/bookingService';
import type { Analytics } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    adminService.getAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    toast('Export feature coming soon!', { icon: '📋' });
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  const combinedData = analytics
    ? analytics.revenueByDay.map((r, i) => ({
        date: formatDate(r.date).slice(0, 6),
        revenue: r.amount,
        bookings: analytics.bookingsByDay[i]?.count ?? 0,
      }))
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Date range */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 font-medium">Date Range:</span>
          <span className="font-semibold text-slate-700">{formatDate(dateFrom)} — {formatDate(dateTo)}</span>
          <span className="text-xs text-slate-400">(last 30 days)</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} icon={<Download size={14} />}>
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: formatCurrency(analytics.totalRevenue), color: 'bg-teal-500' },
            { icon: Calendar, label: 'Total Bookings', value: String(analytics.totalBookings), color: 'bg-amber-500' },
            { icon: TrendingUp, label: 'Revenue Growth', value: `${analytics.revenueGrowth}%`, color: analytics.revenueGrowth >= 0 ? 'bg-teal-500' : 'bg-red-400' },
            { icon: BarChart3, label: 'Bookings Growth', value: `${analytics.bookingsGrowth}%`, color: analytics.bookingsGrowth >= 0 ? 'bg-teal-500' : 'bg-red-400' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                <item.icon size={16} className="text-white" />
              </div>
              <p className="text-xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Combined chart */}
      {combinedData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Revenue & Bookings Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={combinedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(value, name) =>
                  name === 'revenue' ? formatCurrency(Number(value)) : Number(value)
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar yAxisId="right" dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!analytics && (
        <div className="text-center py-16 text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p>No analytics data available.</p>
        </div>
      )}
    </div>
  );
}
