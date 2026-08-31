import { Request, Response, NextFunction } from 'express';
import { sendApiError } from '../utils/apiError.js';

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['*'], // Accès total
  ADMIN: ['*'], // Accès total
  MANAGER: [
    'clients.read', 'clients.create', 'clients.update',
    'orders.read', 'orders.create', 'orders.update', 'orders.cancel',
    'production.read', 'production.update',
    'payments.read', 'payments.create',
    'receipts.read'
  ],
  COUTURIER: ['production.read', 'production.update', 'orders.read'],
  TAILOR: ['production.read', 'production.update', 'orders.read'],
  CUTTER: ['production.read', 'production.update'],
  EMBROIDERER: ['production.read', 'production.update'],
  CASHIER: ['payments.read', 'payments.create', 'receipts.read', 'orders.read'],
  RECEPTIONIST: ['clients.create', 'clients.read', 'orders.create', 'orders.read'],
  VIEWER: ['clients.read', 'orders.read', 'production.read', 'payments.read']
};

export const requirePermission = (permissionCode: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Récupération du rôle transmis dans l'en-tête ou la session (par défaut OWNER)
    const userRole = (req.headers['x-user-role'] || req.userRole || 'OWNER').toString().toUpperCase();

    const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Si le rôle possède la permission universelle "*" ou la permission exacte demandée
    if (allowedPermissions.includes('*') || allowedPermissions.includes(permissionCode)) {
      return next();
    }

    return sendApiError(
      res,
      403,
      'FORBIDDEN',
      `Accès refusé : le rôle '${userRole}' ne possède pas la permission '${permissionCode}' nécessaire.`
    );
  };
};

declare global {
  namespace Express {
    interface Request {
      userRole?: string;
      userId?: string;
    }
  }
}
