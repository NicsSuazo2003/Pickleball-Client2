import type { Booking } from '../../types';

const configs: Record<Booking['status'], { label: string; classes: string }> = {
  pending_payment: { label: 'Pending Payment', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  payment_submitted: { label: 'Payment Submitted', classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  confirmed: { label: 'Confirmed', classes: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  expired: { label: 'Expired', classes: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' },
};

interface StatusBadgeProps {
  status: Booking['status'];
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = configs[status] ?? { label: status, classes: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
