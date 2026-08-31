import { apiClient } from './client';

export const measurementsApi = {
  getByClientId: (clientId: string) => 
    apiClient(`clients/${clientId}/measurements`),

  saveForClient: (clientId: string, measurementsData: any) => 
    apiClient(`clients/${clientId}/measurements`, {
      method: 'POST',
      body: JSON.stringify(measurementsData)
    }),

  getHistoryByClientId: (clientId: string) => 
    apiClient(`measurements/history/${clientId}`)
};
