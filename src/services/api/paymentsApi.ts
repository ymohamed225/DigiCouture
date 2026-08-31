import { apiClient } from './client';

export const paymentsApi = {
  getAll: () => 
    apiClient('payments'),

  recordPayment: (paymentData: any, idempotencyKey?: string) => 
    apiClient('payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      idempotencyKey
    }),

  initiateCinetPay: (paymentData: { orderId: string; amount: number; description?: string; returnUrl?: string }, idempotencyKey?: string) => 
    apiClient('payments/cinetpay/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      idempotencyKey
    }),

  checkCinetPayStatus: (transactionId: string) => 
    apiClient(`payments/cinetpay/check/${transactionId}`)
};
