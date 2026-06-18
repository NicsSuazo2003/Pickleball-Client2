import { create } from 'zustand';
import type { TimeSlot, Booking } from '../types';

interface BookingStore {
  selectedDate: string;
  selectedSlots: TimeSlot[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  currentBooking: Booking | null;
  setSelectedDate: (date: string) => void;
  toggleSlot: (slot: TimeSlot) => void;
  clearSlots: () => void;
  setCustomerInfo: (info: { customerName: string; customerEmail: string; customerPhone: string; notes: string }) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  selectedSlots: [],
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  notes: '',
  currentBooking: null,

  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),
  toggleSlot: (slot) =>
    set((state) => {
      const exists = state.selectedSlots.find((s) => s.id === slot.id);
      if (exists) {
        return { selectedSlots: state.selectedSlots.filter((s) => s.id !== slot.id) };
      }
      return { selectedSlots: [...state.selectedSlots, slot] };
    }),
  clearSlots: () => set({ selectedSlots: [] }),
  setCustomerInfo: (info) => set(info),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  resetBooking: () =>
    set({
      selectedSlots: [],
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
      currentBooking: null,
    }),
}));
