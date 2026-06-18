import api from './api';
import type { Court, TimeSlot, BlockedDate, PriceRule } from '../types';

export const courtService = {
  getCourt: async (): Promise<Court> => {
    const { data } = await api.get('/api/court');
    return data;
  },

  getAvailability: async (date: string): Promise<TimeSlot[]> => {
    const { data } = await api.get('/api/court/availability', { params: { date } });
    return data;
  },

  updateSettings: async (settings: Partial<Court>): Promise<Court> => {
    const { data } = await api.put('/api/court/settings', settings);
    return data;
  },

  getBlockedDates: async (): Promise<BlockedDate[]> => {
    const { data } = await api.get('/api/court/blocked-dates');
    return data;
  },

  addBlockedDate: async (payload: Omit<BlockedDate, 'id'>): Promise<BlockedDate> => {
    const { data } = await api.post('/api/court/blocked-dates', payload);
    return data;
  },

  deleteBlockedDate: async (id: string): Promise<void> => {
    await api.delete(`/api/court/blocked-dates/${id}`);
  },

  getPriceRules: async (): Promise<PriceRule[]> => {
    const { data } = await api.get('/api/price-rules');
    return data;
  },

  addPriceRule: async (payload: Omit<PriceRule, 'id' | 'isActive'>): Promise<PriceRule> => {
    const { data } = await api.post('/api/price-rules', payload);
    return data;
  },

  updatePriceRule: async (id: string, payload: Partial<PriceRule>): Promise<PriceRule> => {
    const { data } = await api.put(`/api/price-rules/${id}`, payload);
    return data;
  },

  deletePriceRule: async (id: string): Promise<void> => {
    await api.delete(`/api/price-rules/${id}`);
  },
};
