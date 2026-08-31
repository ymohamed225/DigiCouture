import { apiClient } from './client';

export const notificationsApi = {
  getAll: () => 
    apiClient('notifications'),

  getTemplates: () => 
    apiClient('notifications/templates'),

  getQueueStatus: () => 
    apiClient('notifications/queue-status'),

  sendDirectWhatsApp: (phone: string, message: string) => 
    apiClient('notifications/send-whatsapp', {
      method: 'POST',
      body: JSON.stringify({ phone, message })
    })
};
