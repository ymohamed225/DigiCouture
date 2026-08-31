import { apiClient } from './client';

export const authApi = {
  sendOtp: (phone: string, isLogin: boolean = true, purpose: string = 'AUTH') => 
    apiClient('auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, isLogin, purpose })
    }),

  verifyOtp: (phone: string, otp: string, purpose: string = 'AUTH') => 
    apiClient('auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, purpose })
    }),

  login: (credentials: { phone?: string; email?: string; password?: string }) => 
    apiClient('auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  refresh: (refreshToken: string) => 
    apiClient('auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
};
