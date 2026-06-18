import api from './api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  register: async (payload: { name: string; email: string; phone: string; password: string }): Promise<void> => {
    await api.post('/api/auth/register', payload);
  },
};
