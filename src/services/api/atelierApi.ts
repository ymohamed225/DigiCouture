import { apiClient } from './client';

export const atelierApi = {
  getMe: () => 
    apiClient('ateliers/me'),

  getAll: () => 
    apiClient('ateliers'),

  createOrUpdate: (atelierData: any) => 
    apiClient('ateliers', {
      method: 'POST',
      body: JSON.stringify(atelierData)
    }),

  deleteAtelier: (identifier: string) => 
    apiClient(`ateliers/${identifier}`, {
      method: 'DELETE'
    })
};
