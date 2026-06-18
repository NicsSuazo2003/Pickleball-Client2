import { format, parseISO } from 'date-fns';

export function formatTime(time: string): string {
  if (!time) return '';
  const [hourStr, min] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:${min} ${suffix}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function dayLabel(dateStr: string): { day: string; date: string; isToday: boolean } {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = d.getTime() === today.getTime();
  return {
    day: isToday ? 'Today' : format(d, 'EEE'),
    date: format(d, 'MMM d'),
    isToday,
  };
}
