import { apiClient } from './client';

export const receiptsApi = {
  getById: (id: string) => 
    apiClient(`receipts/${id}`),

  getByOrderId: (orderId: string) => 
    apiClient(`receipts/order/${orderId}`)
};
