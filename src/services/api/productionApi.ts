import { apiClient } from './client';

export const productionApi = {
  getWhoIsWorking: () => 
    apiClient('production/who-is-working'),

  getTasksByOrder: (orderId: string) => 
    apiClient(`orders/${orderId}/production`),

  assignTask: (orderId: string, taskData: { type: string; assignedTo?: string; notes?: string }) => 
    apiClient(`orders/${orderId}/production`, {
      method: 'POST',
      body: JSON.stringify(taskData)
    }),

  updateTaskStatus: (taskId: string, status: string, notes?: string) => 
    apiClient(`production/tasks/${taskId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    })
};
