import { apiClient } from './client';

export const dashboardApi = {
  getStats: () => 
    apiClient('dashboard'),

  getAdminStats: () => 
    apiClient('admin/stats'),

  getAuditLogs: (limit: number = 50) => 
    apiClient('audit-logs', {
      params: { limit }
    })
};
