import api from './api';
import type { Booking, CreateBookingPayload, Analytics } from '../types';

export const bookingService = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await api.post('/api/bookings', payload);
    return data;
  },

  trackBooking: async (referenceCode: string, email?: string): Promise<Booking> => {
    const { data } = await api.get(`/api/bookings/track/${referenceCode}`, {
      params: email ? { email } : undefined,
    });
    return data;
  },

  uploadPaymentScreenshot: async (id: string, file: File): Promise<Booking> => {
    const formData = new FormData();
     formData.append('screenshot', file);
    const { data } = await api.post(`/api/bookings/${id}/upload-payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  adminCreateBooking: async (payload: CreateBookingPayload & { status: string }): Promise<Booking> => {
    const { data } = await api.post('/api/bookings/admin-create', payload);
    return data;
  },
};

export const adminService = {
  getBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get('/api/admin/bookings');
    return data;
  },

  updateBookingStatus: async (id: string, status: string): Promise<Booking> => {
    const { data } = await api.put(`/api/admin/bookings/${id}`, { status });
    return data;
  },

  getAnalytics: async (): Promise<Analytics> => {
    const { data } = await api.get('/api/admin/analytics');
    return data;
  },

  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteFile: async (url: string): Promise<void> => {
    await api.delete('/api/files', { data: { url } });
  },
};
