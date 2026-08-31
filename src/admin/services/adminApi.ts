// ─────────────────────────────────────────────────────────────────────────────
// CLIENT HTTP CENTRALISÉ — PLATFORM ADMIN (SaaS)
// Requêtes vers /api/super-admin/*
// ⚠️ Les données métier des ateliers (clients, commandes…) ne sont PAS exposées ici.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  const token = sessionStorage.getItem('dc_admin_token') || localStorage.getItem('dc_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Types Platform (PLATFORM DATA seulement) ─────────────────────────────────

export interface AdminDashboardData {
  generatedAt: string;
  platform: {
    totalAteliers: number;
    activeAteliers: number;
    newAteliers30d: number;
    trialingAteliers: number;
    suspendedAteliers: number;
    totalUsers: number;
  };
  finance: {
    mrr: number;
    arr: number;
    totalSaasRevenue: number;
    churnRate: number;
    retentionRate: number;
  };
  subscriptions: {
    total: number;
    active: number;
    expiringSoon: number;
    breakdown: { plan: string; count: number }[];
  };
  usage: {
    activeThisWeek: number;
    totalApiCalls: number;
    notificationsSent: number;
  };
  system: {
    openTickets: number;
    incidentsThisMonth: number;
  };
}

// Atelier — vue SaaS uniquement (pas de données métier des clients finaux)
export interface AdminAtelier {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  city: string;
  country: string;
  logoUrl: string | null;
  createdAt: string;
  lastActivity: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
  status: string;
  totalUsers: number;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  atelierId?: string;
  userId?: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Paiement SaaS — ce que les ateliers paient à DigiCouture (abonnements)
export interface SaasPayment {
  id: string;
  atelierId: string;
  atelierName?: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string | null;
  providerTransactionId: string | null;
  createdAt: string;
}

// Abonnement SaaS
export interface Subscription {
  id: string;
  atelierId: string;
  atelierName?: string;
  planId: string;
  planName?: string;
  planCode?: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
  startsAt: string;
  endsAt: string | null;
  canceledAt: string | null;
}

// Plan tarifaire
export interface SubscriptionPlan {
  id: string;
  code: string;
  tier: 'FREE' | 'STARTER' | 'PRO' | 'VIP' | 'ENTERPRISE';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxClients: number;
  maxOrders: number;
  storageLimitMb: number;
  features: Record<string, unknown>;
}

// Ticket de support
export interface SupportTicket {
  id: string;
  atelierId: string;
  atelierName?: string;
  userId: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string | null;
}

// AdminPayment kept for legacy audit page compatibility
export interface AdminPayment {
  id: string;
  atelierId: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
}

// ─── API Methods ───────────────────────────────────────────────────────────────

export const adminApi = {
  // ─── DASHBOARD ───────────────────────────────────────────────────────────────
  /** KPIs SaaS globaux — agrégés, anonymisés, sans données métier des ateliers */
  getDashboard: () =>
    fetchAdmin<{ success: boolean } & AdminDashboardData>('/api/super-admin/dashboard'),

  // ─── ATELIERS (Vue SaaS) ──────────────────────────────────────────────────────
  /** Liste paginée des ateliers clients de la plateforme */
  getAteliers: (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    return fetchAdmin<{ success: boolean; total: number; data: AdminAtelier[] }>(
      `/api/super-admin/ateliers?${qs}`
    );
  },

  /** Créer et activer un nouvel atelier depuis le Super-Admin */
  createAtelier: (atelierData: { name: string; phone: string; email?: string; city?: string; planCode?: string }) =>
    fetchAdmin<{ success: boolean; message: string; atelierId: string }>('/api/super-admin/ateliers', {
      method: 'POST',
      body: JSON.stringify(atelierData),
    }),

  /** Vue 360° SaaS d'un atelier (sans données métier) */
  getAtelierOverview: (id: string) =>
    fetchAdmin<{ success: boolean; atelier: any; stats: any; subscription: any }>(
      `/api/super-admin/ateliers/${id}/overview`
    ),

  /** Utilisateurs d'un atelier (gestion SaaS/support uniquement) */
  getAtelierUsers: (id: string) =>
    fetchAdmin<{ success: boolean; data: any[] }>(`/api/super-admin/ateliers/${id}/users`),

  /** Métriques d'usage technique d'un atelier (stockage, API, notifs) */
  getAtelierUsage: (id: string) =>
    fetchAdmin<{ success: boolean; data: any }>(`/api/super-admin/ateliers/${id}/usage`),

  /** Suspendre un atelier */
  suspendAtelier: (id: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/ateliers/${id}/suspend`, { method: 'POST' }),

  /** Activer un atelier */
  activateAtelier: (id: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/ateliers/${id}/activate`, { method: 'POST' }),

  /** Modifier le plan d'abonnement d'un atelier */
  changeAtelierSubscription: (id: string, planCode: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/ateliers/${id}/subscription`, {
      method: 'POST',
      body: JSON.stringify({ planCode }),
    }),

  // ─── ABONNEMENTS SaaS ────────────────────────────────────────────────────────
  /** Liste paginée de tous les abonnements SaaS actifs */
  getSubscriptions: (params?: { limit?: number; offset?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.status) qs.set('status', params.status);
    return fetchAdmin<{ success: boolean; total: number; data: Subscription[] }>(
      `/api/super-admin/subscriptions?${qs}`
    );
  },

  // ─── PLANS TARIFAIRES ────────────────────────────────────────────────────────
  getPlans: () =>
    fetchAdmin<{ success: boolean; data: SubscriptionPlan[] }>('/api/super-admin/plans'),

  updatePlan: (id: string, details: Partial<SubscriptionPlan>) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(details),
    }),

  // ─── PAIEMENTS SaaS ──────────────────────────────────────────────────────────
  /**
   * Ce que les ateliers paient à DigiCouture pour leurs licences SaaS.
   * ⚠️ NE CONTIENT PAS les paiements des clients des ateliers pour leurs vêtements.
   */
  getSaasPayments: (params?: { limit?: number; offset?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.status) qs.set('status', params.status);
    return fetchAdmin<{ success: boolean; total: number; data: SaasPayment[] }>(
      `/api/super-admin/saas-payments?${qs}`
    );
  },

  // ─── REVENUS PLATEFORME ───────────────────────────────────────────────────────
  getRevenue: () =>
    fetchAdmin<{
      success: boolean;
      summary: { totalRevenue: number; mrr: number; arr: number; churnRate: number };
      monthlyTrend: any[];
      plansRevenue: any[];
      byStatus: any[];
    }>('/api/super-admin/revenue'),

  // ─── USAGE ────────────────────────────────────────────────────────────────────
  getUsage: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return fetchAdmin<{ success: boolean; global: any; byAtelier: any[] }>(
      `/api/super-admin/usage?${qs}`
    );
  },

  // ─── SUPPORT ─────────────────────────────────────────────────────────────────
  getSupportTickets: (params?: { limit?: number; offset?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.status) qs.set('status', params.status);
    return fetchAdmin<{ success: boolean; total: number; data: SupportTicket[] }>(
      `/api/super-admin/support?${qs}`
    );
  },

  updateTicket: (id: string, status: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/support/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ─── ANNONCES ─────────────────────────────────────────────────────────────────
  getAnnouncements: () => fetchAdmin<{ success: boolean; data: any[] }>('/api/super-admin/announcements'),
  createAnnouncement: (title: string, message: string, priority: string) =>
    fetchAdmin<{ success: boolean; message: string }>('/api/super-admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, message, priority }),
    }),

  // ─── AUDIT ────────────────────────────────────────────────────────────────────
  getAuditLogs: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return fetchAdmin<{ success: boolean; total: number; data: AuditLogEntry[] }>(
      `/api/super-admin/audit?${qs}`
    );
  },

  getErrors: (params?: { limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    return fetchAdmin<{ success: boolean; data: AuditLogEntry[] }>(
      `/api/super-admin/errors?${qs}`
    );
  },

  // ─── UTILISATEURS (Platform) ──────────────────────────────────────────────────
  getUsers: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit)  qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return fetchAdmin<{ success: boolean; total: number; data: any[] }>(
      `/api/super-admin/users?${qs}`
    );
  },

  suspendUser: (id: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/users/${id}/suspend`, { method: 'POST' }),

  reactivateUser: (id: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/users/${id}/reactivate`, { method: 'POST' }),

  resetUserPassword: (id: string) =>
    fetchAdmin<{ success: boolean; message: string }>(`/api/super-admin/users/${id}/reset-password`, { method: 'POST' }),

  // ─── HEALTH ───────────────────────────────────────────────────────────────────
  getHealth: () => fetchAdmin<{ status: string; database: string; uptime: number }>('/health'),
};

