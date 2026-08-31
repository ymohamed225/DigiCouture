import { apiClient } from './client';

export const fittingsApi = {
  getAll: () => 
    apiClient('fittings'),

  create: (fittingData: { orderId: string; clientId?: string; scheduledAt: string; notes?: string }) => 
    apiClient('fittings', {
      method: 'POST',
      body: JSON.stringify(fittingData)
    }),

  updateStatus: (id: string, status: string, notes?: string, adjustments?: any, nextAction?: string) => 
    apiClient(`fittings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, adjustments, nextAction })
    })
};
