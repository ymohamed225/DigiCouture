import { pool } from '../config/database.js';
import crypto from 'crypto';

export interface PlanConfig {
  code: string;
  name: string;
  priceMonthly: number;
  maxUsers: number;
  maxClients: number;
  maxOrders: number;
  storageLimitMb: number;
  isRecommended?: boolean;
}

export const PLANS_CONFIG: Record<string, PlanConfig> = {
  FREE: { code: 'FREE', name: 'Offre Découverte', priceMonthly: 0, maxUsers: 1, maxClients: 50, maxOrders: 20, storageLimitMb: 500 },
  STARTER: { code: 'STARTER', name: 'Atelier Essentiel', priceMonthly: 2000, maxUsers: 1, maxClients: 100, maxOrders: 30, storageLimitMb: 2000 },
  PRO: { code: 'PRO', name: 'Couture Premium', priceMonthly: 5000, maxUsers: 3, maxClients: 500, maxOrders: 999999, storageLimitMb: 10000, isRecommended: true },
  ATELIER: { code: 'ATELIER', name: 'Haute Couture', priceMonthly: 10000, maxUsers: 10, maxClients: 999999, maxOrders: 999999, storageLimitMb: 50000 },
  BUSINESS: { code: 'BUSINESS', name: 'Maison de Couture', priceMonthly: 0, maxUsers: 99, maxClients: 999999, maxOrders: 999999, storageLimitMb: 200000 }
};

export class SubscriptionService {
  /**
   * Source de Vérité Unique Backend : Récupère et calcule l'état réactif de l'abonnement
   */
  public static async getSubscriptionStatus(atelierId: string) {
    const now = new Date();
    const nowIso = now.toISOString();
    const nowMs = now.getTime();
    const monthPrefix = nowIso.slice(0, 7);

    // 1. Charger l'atelier
    const [rows]: any = await pool!.query('SELECT * FROM ateliers WHERE id = ?', [atelierId]);
    if (!rows || rows.length === 0) {
      throw new Error(`Atelier non trouvé : ${atelierId}`);
    }
    const atelier = rows[0];

    // Initialisation automatique si données manquantes (Nouvel atelier)
    let planCode = (atelier.subscription_plan || atelier.plan || 'FREE').toUpperCase();
    if (!PLANS_CONFIG[planCode]) planCode = 'FREE';

    let status = (atelier.subscription_status || 'TRIAL').toUpperCase();
    let trialStartIso = atelier.trial_start_date || atelier.createdAt || nowIso;

    // Détection d'anciennement payant ou d'essai déjà utilisé
    const isPaidPlan = planCode === 'STARTER' || planCode === 'PRO' || planCode === 'ATELIER' || planCode === 'BUSINESS';
    let hasHadPaidPlan = Boolean(atelier.has_had_paid_plan || isPaidPlan);
    let hasUsedTrial = Boolean(atelier.has_used_trial || status === 'EXPIRED' || isPaidPlan || (status === 'TRIAL' && atelier.trial_end_date && new Date(atelier.trial_end_date).getTime() < nowMs));

    // Mise à jour automatique des flags si nécessaire
    if ((isPaidPlan && !atelier.has_had_paid_plan) || (hasUsedTrial && !atelier.has_used_trial)) {
      await pool!.query(
        'UPDATE ateliers SET has_used_trial = ?, has_had_paid_plan = ? WHERE id = ?',
        [hasUsedTrial ? 1 : 0, hasHadPaidPlan ? 1 : 0, atelierId]
      );
    }
    
    // Calcul date de fin d'essai 30 jours basée exclusivement sur la date SERVEUR
    let trialStartDate = new Date(trialStartIso);
    if (isNaN(trialStartDate.getTime())) trialStartDate = now;

    const trialEndMs = trialStartDate.getTime() + 30 * 24 * 3600 * 1000;
    const trialEndDate = new Date(trialEndMs);
    const trialEndIso = atelier.trial_end_date || trialEndDate.toISOString();

    // Calcul des jours restants d'essai
    const trialDaysRemaining = Math.max(0, Math.ceil((trialEndMs - nowMs) / (24 * 3600 * 1000)));
    const trialDaysElapsed = Math.min(30, Math.max(1, 30 - trialDaysRemaining));

    // Gestion réactive des transitions de statut par Date Serveur
    let isExpired = false;
    let isExpiringSoon = false;

    if (status === 'TRIAL') {
      if (nowMs >= trialEndMs) {
        status = 'EXPIRED';
        isExpired = true;
        hasUsedTrial = true;
        // Mise à jour en base
        await pool!.query(
          'UPDATE ateliers SET subscription_status = "EXPIRED", has_used_trial = 1, subscription_updated_at = ? WHERE id = ?',
          [nowIso, atelierId]
        );
      } else if (trialDaysRemaining <= 5) {
        isExpiringSoon = true;
      }
    } else if (status === 'ACTIVE') {
      if (atelier.subscription_end_date) {
        const subEndMs = new Date(atelier.subscription_end_date).getTime();
        if (nowMs >= subEndMs) {
          status = 'EXPIRED';
          isExpired = true;
          await pool!.query(
            'UPDATE ateliers SET subscription_status = "EXPIRED", subscription_updated_at = ? WHERE id = ?',
            [nowIso, atelierId]
          );
        } else if (subEndMs - nowMs <= 5 * 24 * 3600 * 1000) {
          status = 'EXPIRING_SOON';
          isExpiringSoon = true;
        }
      }
    } else if (status === 'EXPIRED') {
      isExpired = true;
    }

    // 2. Compteurs de consommation réels (Base de Données)
    const [[{ currentClients }]]: any = await pool!.query(
      'SELECT COUNT(*) as currentClients FROM clients WHERE atelierId = ?',
      [atelierId]
    );

    const [[{ currentMonthOrders }]]: any = await pool!.query(
      'SELECT COUNT(*) as currentMonthOrders FROM orders WHERE atelierId = ? AND createdAt LIKE ?',
      [atelierId, `${monthPrefix}%`]
    );

    const [[{ totalOrders }]]: any = await pool!.query(
      'SELECT COUNT(*) as totalOrders FROM orders WHERE atelierId = ?',
      [atelierId]
    );

    const [[{ currentUsers }]]: any = await pool!.query(
      'SELECT COUNT(*) as currentUsers FROM users WHERE atelierId = ?',
      [atelierId]
    );

    const planConfig = PLANS_CONFIG[planCode];

    // Vérification des quotas du plan
    const isOrdersLimitReached = planCode === 'FREE' 
      ? totalOrders >= planConfig.maxOrders 
      : currentMonthOrders >= planConfig.maxOrders;
    
    const isClientsLimitReached = currentClients >= planConfig.maxClients;
    const isUsersLimitReached = currentUsers >= planConfig.maxUsers;

    // Phase de découverte & Messages dynamiques
    let discoveryPhase: 'welcome' | 'usage' | 'warning' | 'urgent' | 'expired' = 'welcome';
    let phaseMessage = '🎉 Bienvenue dans DigiCouture ! Vous êtes en période de découverte.';

    if (isExpired || status === 'EXPIRED' || status === 'SUSPENDED') {
      discoveryPhase = 'expired';
      phaseMessage = '🔒 Votre période découverte est terminée. Vos données sont conservées en toute sécurité.';
    } else if (trialDaysRemaining <= 2) {
      discoveryPhase = 'urgent';
      phaseMessage = `🔴 Votre période découverte se termine dans ${trialDaysRemaining} jour(s). N'attendez pas !`;
    } else if (trialDaysRemaining <= 5) {
      discoveryPhase = 'warning';
      phaseMessage = `🟡 Votre période découverte se termine bientôt (il vous reste ${trialDaysRemaining} jours).`;
    } else if (trialDaysElapsed >= 8) {
      discoveryPhase = 'usage';
      phaseMessage = `Vous utilisez DigiCouture depuis ${trialDaysElapsed} jours.`;
    }

    return {
      success: true,
      atelierId,
      plan: planCode,
      planName: planConfig.name,
      status,
      isTrial: status === 'TRIAL',
      isActive: status === 'ACTIVE' || (status === 'TRIAL' && !isExpired),
      isExpiringSoon,
      isExpired,
      isSuspended: status === 'SUSPENDED',
      hasUsedTrial,
      hasHadPaidPlan,
      canSwitchToFree: !hasUsedTrial && !hasHadPaidPlan && planCode === 'FREE',
      trialStartDate: trialStartIso,
      trialEndDate: trialEndIso,
      trialDaysRemaining,
      trialDaysElapsed,
      subscriptionStartDate: atelier.subscription_start_date || null,
      subscriptionEndDate: atelier.subscription_end_date || null,
      quotas: {
        maxUsers: planConfig.maxUsers,
        currentUsers,
        isUsersLimitReached,
        maxClients: planConfig.maxClients,
        currentClients,
        isClientsLimitReached,
        maxOrders: planConfig.maxOrders,
        currentMonthOrders,
        totalOrders,
        isOrdersLimitReached,
        storageLimitMb: planConfig.storageLimitMb
      },
      entitlements: {
        canCreateOrder: !isExpired && status !== 'SUSPENDED' && !isOrdersLimitReached,
        canCreateClient: !isExpired && status !== 'SUSPENDED' && !isClientsLimitReached,
        canAddUser: !isExpired && status !== 'SUSPENDED' && !isUsersLimitReached,
        canAccessFullApp: !isExpired && status !== 'SUSPENDED'
      },
      discoveryPhase,
      phaseMessage,
      serverTime: nowIso
    };
  }

  /**
   * Middleware de garde : Contrôle si une action métier est autorisée
   */
  public static async assertEntitlement(atelierId: string, feature: 'CREATE_ORDER' | 'CREATE_CLIENT' | 'ADD_USER') {
    const status = await this.getSubscriptionStatus(atelierId);

    if (status.isSuspended) {
      throw new Error('ACCOUNT_SUSPENDED: Votre compte atelier a été suspendu par l\'administrateur.');
    }

    if (status.isExpired) {
      throw new Error('SUBSCRIPTION_EXPIRED: Votre période découverte est terminée. Vos données restent conservées ! Veuillez choisir une formule pour continuer.');
    }

    if (feature === 'CREATE_ORDER' && status.quotas.isOrdersLimitReached) {
      throw new Error(`QUOTA_EXCEEDED: Vous avez atteint la limite de commandes de votre formule (${status.quotas.maxOrders}). Passez au plan PRO pour créer des commandes illimitées.`);
    }

    if (feature === 'CREATE_CLIENT' && status.quotas.isClientsLimitReached) {
      throw new Error(`QUOTA_EXCEEDED: Vous avez atteint la limite de clients de votre formule (${status.quotas.maxClients}). Passez au plan supérieur pour ajouter plus de clients.`);
    }

    if (feature === 'ADD_USER' && status.quotas.isUsersLimitReached) {
      throw new Error(`QUOTA_EXCEEDED: Vous avez atteint la limite d'utilisateurs de votre formule (${status.quotas.maxUsers}).`);
    }

    return true;
  }

  /**
   * Enregistrement d'un log d'audit lors d'une action d'administration manuelle
   */
  public static async recordAuditLog(params: {
    adminUserId?: string;
    adminUserName?: string;
    atelierId: string;
    action: string;
    previousPlan?: string;
    newPlan?: string;
    previousStatus?: string;
    newStatus?: string;
    reason?: string;
  }) {
    const id = `audit-sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    await pool!.query(
      `INSERT INTO subscription_audit_logs 
       (id, adminUserId, adminUserName, atelierId, action, previousPlan, newPlan, previousStatus, newStatus, reason, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.adminUserId || 'super-admin',
        params.adminUserName || 'Admin Mohamed',
        params.atelierId,
        params.action,
        params.previousPlan || null,
        params.newPlan || null,
        params.previousStatus || null,
        params.newStatus || null,
        params.reason || 'Action administrative',
        createdAt
      ]
    );

    console.log(`📜 [Audit Log] ${params.action} sur atelier ${params.atelierId} par ${params.adminUserName || 'Admin'}`);
  }
}
