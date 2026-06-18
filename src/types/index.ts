// Court types
export interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  indoor: boolean;
  pricePerHour: number;
  amenities: string[];
  rating: number;
  imageUrl: string;
  images: string[];
  status: 'active' | 'inactive' | 'maintenance';
  openTime: string;
  closeTime: string;
  dimensions: string;
  surface: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  referenceCode: string;
  date: string;
  slots: TimeSlot[];
  totalAmount: number;
  status: 'pending_payment' | 'payment_submitted' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  paymentMethod: 'gcash';
  createdAt: string;
  notes?: string;
  paymentScreenshot?: string;
  paymentExpiresAt?: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface PriceRule {
  id: string;
  name: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isActive: boolean;
  priority: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  revenueByDay: { date: string; amount: number }[];
  bookingsByDay: { date: string; count: number }[];
  revenueGrowth: number;
  bookingsGrowth: number;
  usersGrowth: number;
}

export interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface CreateBookingPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  slots: { startTime: string; endTime: string }[];
  totalAmount: number;
  notes?: string;
}
