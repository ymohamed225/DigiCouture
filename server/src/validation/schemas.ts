import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES RÉUTILISABLES
// ─────────────────────────────────────────────────────────────────────────────

/** Identifiant UUID ou slug métier (CLI-000001, CMD-2026-000001…) */
const id = z.string().min(1).max(64);

/** Montant monétaire entier (FCFA). Jamais négatif. */
const amount = z.number({ coerce: true }).int().nonnegative();

/** Numéro de téléphone africain, 8–15 chiffres, optionnel espace/tiret */
const phone = z
  .string()
  .regex(/^\+?[\d\s\-]{8,15}$/, 'Numéro de téléphone invalide.')
  .transform((v) => v.replace(/\s|-/g, ''));

/** Date ISO 8601 (YYYY-MM-DD) */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide. Format attendu : YYYY-MM-DD.');

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Email invalide.').max(255),
  password: z.string().min(6, 'Mot de passe trop court (6 caractères minimum).').max(128),
});

export const OtpVerifySchema = z.object({
  phone: phone,
  code: z.string().length(6, 'Le code OTP doit comporter exactement 6 chiffres.').regex(/^\d{6}$/, 'Code OTP invalide.'),
  purpose: z.enum(['LOGIN', 'PAYMENT', 'SENSITIVE_ACTION'], { message: "Purpose invalide." }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'refreshToken invalide.'),
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLIENTS
// ─────────────────────────────────────────────────────────────────────────────

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Nom requis (2 caractères minimum).').max(150).trim(),
  phone: phone.optional(),
  whatsapp: phone.optional(),
  email: z.string().email('Email invalide.').max(255).optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const ClientSearchSchema = z.object({
  q: z.string().min(1, 'Terme de recherche requis.').max(100).trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. COMMANDES
// ─────────────────────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  clientId: id,
  modelName: z.string().min(1, 'Nom du modèle requis.').max(150).trim(),
  garmentType: z.string().min(1).max(100).trim().optional().default('Sur-mesure'),
  fabricName: z.string().max(100).trim().optional(),
  fabricColor: z.string().max(50).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  specialInstructions: z.string().max(2000).trim().optional(),
  deliveryDate: isoDate,
  dueDate: isoDate.optional(),
  urgency: z.enum(['normale', 'urgente', 'tres_urgente']).default('normale'),
  totalAmount: amount,
  depositAmount: amount.default(0),
  currency: z.string().max(10).default('FCFA'),
  notes: z.string().max(2000).trim().optional(),
  createdBy: z.string().max(100).trim().optional(),
});

export const UpdateOrderSchema = CreateOrderSchema.partial().omit({ clientId: true });

export const OrderStatusSchema = z.object({
  status: z.enum([
    'commande_recue',
    'mesures_prises',
    'mesures_validees',
    'decoupe',
    'couture',
    'finitions',
    'essayage',
    'prete',
    'livree',
  ], { message: 'Statut de commande invalide.' }),
  changedBy: z.string().max(100).trim().optional(),
  comment: z.string().max(500).trim().optional(),
  expectedVersion: z.coerce.number().int().positive().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const CreatePaymentSchema = z.object({
  orderId: id,
  amount: amount.positive('Le montant doit être supérieur à 0.'),
  method: z.enum(['CASH', 'WAVE', 'ORANGE_MONEY', 'MTN_MONEY', 'CINETPAY', 'BANK', 'CHEQUE'], {
    message: 'Méthode de paiement invalide.',
  }),
  currency: z.string().max(10).default('FCFA'),
  provider: z.string().max(100).trim().optional(),
  providerTransactionId: z.string().max(200).trim().optional(),
  clientName: z.string().max(150).trim().optional(),
  note: z.string().max(500).trim().optional(),
  idempotencyKey: z.string().max(200).trim().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. WEBHOOK CINETPAY (Source externe - validation renforcée)
// ─────────────────────────────────────────────────────────────────────────────

export const CinetPayWebhookSchema = z.object({
  cpm_trans_id: z.string().min(1).max(200),
  cpm_site_id: z.string().min(1).max(100),
  cpm_trans_date: z.string().optional(),
  cpm_amount: z.coerce.number().positive('Montant CinetPay invalide.'),
  cpm_currency: z.string().max(10),
  cpm_payid: z.string().max(200).optional(),
  cpm_payment_date: z.string().optional(),
  cpm_payment_time: z.string().optional(),
  cpm_error_message: z.string().optional(),
  cpm_result: z.string().optional(),
  cpm_trans_status: z.string().optional(),
  signature: z.string().optional(),
}).passthrough(); // champs supplémentaires tolérés (forwarded by CinetPay)

// ─────────────────────────────────────────────────────────────────────────────
// 6. MENSURATION CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const measurementDecimal = z.coerce.number().nonnegative().max(999.99).default(0);

export const CreateMeasurementSchema = z.object({
  epaules: measurementDecimal,
  poitrine: measurementDecimal,
  sousPoitrine: measurementDecimal,
  hauteurPoitrine: measurementDecimal,
  carrureDevant: measurementDecimal,
  carrureDos: measurementDecimal,
  tourCou: measurementDecimal,
  tourBras: measurementDecimal,
  tourPoignet: measurementDecimal,
  longueurManche: measurementDecimal,
  longueurTailleDevant: measurementDecimal,
  longueurTailleDos: measurementDecimal,
  tourTaille: measurementDecimal,
  tourHanche: measurementDecimal,
  hauteurHanches: measurementDecimal,
  longueurBas: measurementDecimal,
  longueurJupe: measurementDecimal,
  longueurPantalon: measurementDecimal,
  entrejambe: measurementDecimal,
  cuisse: measurementDecimal,
  tourGenou: measurementDecimal,
  tourCheville: measurementDecimal,
  longueurGrandBoubou: measurementDecimal,
  largeurEnvergureBoubou: measurementDecimal,
  customFields: z.record(z.any()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ESSAYAGES (FITTING)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateFittingSchema = z.object({
  orderId: id,
  scheduledAt: z.string().min(1, 'Date d\'essayage requise.').max(50),
  notes: z.string().max(1000).trim().optional(),
  retouches: z.string().max(2000).trim().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. TÂCHES DE PRODUCTION
// ─────────────────────────────────────────────────────────────────────────────

export const CreateProductionTaskSchema = z.object({
  orderId: id,
  taskType: z.enum(['CUTTING', 'SEWING', 'EMBROIDERY', 'FINISHING', 'QUALITY_CHECK'], {
    message: 'Type de tâche invalide.',
  }),
  assignedTo: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. UPLOAD DE FICHIERS (paramètres URL / form)
// ─────────────────────────────────────────────────────────────────────────────

export const FileUploadParamsSchema = z.object({
  orderId: id.optional(),
  clientId: id.optional(),
  attachmentType: z.enum(['FABRIC_PHOTO', 'MODEL_PHOTO', 'RECEIPT_PDF', 'SIGNATURE'], {
    message: 'Type de fichier invalide.',
  }).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. SYNCHRONISATION OFFLINE MOBILE
// ─────────────────────────────────────────────────────────────────────────────

export const SyncQueueItemSchema = z.object({
  entityType: z.enum(['order', 'client', 'payment', 'fitting', 'production_task'], {
    message: "Type d'entité de synchronisation invalide.",
  }),
  entityId: id,
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.record(z.any()),
  expectedUpdatedAt: z.string().datetime({ offset: true }).optional(),
});

export const SyncQueueSchema = z.object({
  items: z.array(SyncQueueItemSchema).min(1).max(50, 'Maximum 50 opérations de synchronisation par requête.'),
});
