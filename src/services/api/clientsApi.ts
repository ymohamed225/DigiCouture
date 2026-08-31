import { apiClient } from './client';

export const clientsApi = {
  getAll: (query?: string, limit?: number, page?: number) => 
    apiClient('clients', {
      params: { q: query, limit, page }
    }),

  search: (query: string) => 
    apiClient('clients/search', {
      params: { q: query }
    }),

  getById: (id: string) => 
    apiClient(`clients/${id}`),

  create: (clientData: any) => 
    apiClient('clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    }),

  update: (id: string, updateData: any) => 
    apiClient(`clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
};
