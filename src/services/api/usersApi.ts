import { apiClient } from './client';

export const usersApi = {
  getAll: () => 
    apiClient('users'),

  create: (userData: { name: string; email?: string; phone?: string; role?: string }) => 
    apiClient('users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getById: (id: string) => 
    apiClient(`users/${id}`),

  deleteUser: (id: string) => 
    apiClient(`users/${id}`, {
      method: 'DELETE'
    })
};
