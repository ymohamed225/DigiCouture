import { apiClient } from './client';

export const ordersApi = {
  getAll: () => 
    apiClient('orders'),

  getById: (id: string) => 
    apiClient(`orders/${id}`),

  create: (orderData: any) => 
    apiClient('orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  update: (id: string, updateData: any) => 
    apiClient(`orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    }),

  updateStatus: (id: string, status: string, changedBy?: string, comment?: string) => 
    apiClient(`orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, changedBy, comment })
    }),

  getTimeline: (id: string) => 
    apiClient(`orders/${id}/timeline`),

  generatePortalToken: (id: string) => 
    apiClient(`orders/${id}/portal-token`, {
      method: 'POST'
    }),

  getPortalOrder: (token: string) => 
    apiClient(`portal/orders/${token}`)
};
