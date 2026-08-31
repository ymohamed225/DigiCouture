export interface Client {
  id: string;
  atelierId?: string;
  customerCode?: string; // ex: CLI-000001 (Unique par atelier)
  fullName: string;
  whatsapp: string;
  address?: string;
  country?: string;
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Measurements {
  id?: string;
  clientId: string;
  category: 'femme' | 'homme' | 'enfant';
  // Haut & Torse
  epaules?: number;
  poitrine?: number;
  sousPoitrine?: number; // NOUVEAU : Tour sous-poitrine / soutien-gorge
  hauteurPoitrine?: number; // NOUVEAU : Hauteur épaule-poitrine
  carrureDevant?: number; // NOUVEAU : Carrure devant
  carrureDos?: number; // NOUVEAU : Carrure dos
  tourCou?: number; // NOUVEAU : Tour de cou / Encolure
  tourBras?: number;
  tourPoignet?: number; // NOUVEAU : Tour de poignet
  longueurManche?: number;
  longueurTailleDevant?: number; // NOUVEAU : Longueur buste devant
  longueurTailleDos?: number; // NOUVEAU : Longueur buste dos
  // Taille & Bas
  tourTaille?: number;
  tourHanche?: number;
  hauteurHanches?: number; // NOUVEAU : Hauteur taille-hanche
  longueurBas?: number;
  longueurJupe?: number; // NOUVEAU : Longueur jupe
  longueurPantalon?: number; // NOUVEAU : Longueur pantalon
  entrejambe?: number; // NOUVEAU : Hauteur d'entrejambe
  cuisse?: number;
  tourGenou?: number; // NOUVEAU : Tour de genou
  tourCheville?: number; // NOUVEAU : Tour de cheville
  // Traditionnel Afrique de l'Ouest
  longueurGrandBoubou?: number; // NOUVEAU : Longueur Grand Boubou
  largeurEnvergureBoubou?: number; // NOUVEAU : Envergure des bras Boubou
  // Champs personnalisés
  customFields?: Record<string, number | string>;
  updatedAt?: string;
}

export type ProductionStatus = 
  | 'commande_recue'
  | 'mesures_prises'
  | 'mesures_validees'
  | 'decoupe'
  | 'couture'
  | 'finitions'
  | 'essayage'
  | 'prete'
  | 'livree';

export interface Order {
  id: string;
  atelierId?: string;
  clientId: string;
  orderNumber?: string; // ex: CMD-2026-00001 (Unique par atelier)
  code?: string; // alias compatibilité
  clientName: string;
  clientWhatsapp: string;
  modelName: string;
  modelCategory: string;
  modelImageUrl?: string;
  garmentType: string;
  fabricName?: string;
  fabricColor?: string;
  description?: string;
  specialInstructions?: string;
  dueDate?: string;
  deliveryDate: string;
  urgency: 'normale' | 'urgente' | 'tres_urgente';
  totalAmount: number;
  depositAmount: number;
  paidAmount?: number;
  remainingAmount: number; // Calculé backend : totalAmount - paidAmount
  currency?: string; // ex: 'FCFA'
  status: ProductionStatus;
  notes?: string;
  createdBy?: string;
  tracking_token?: string;
  qr_code?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  fromStatus?: ProductionStatus;
  toStatus: ProductionStatus;
  changedAt: string; // Date (ex: 2026-08-22)
  time?: string; // Heure (ex: 14:30)
  changedBy?: string; // Utilisateur / Couturier
  comment?: string; // Remarques d'avancement
}

export type TaskType = 
  | 'CUTTING'
  | 'SEWING'
  | 'EMBROIDERY'
  | 'FINISHING'
  | 'IRONING'
  | 'FITTING'
  | 'PACKAGING';

export interface ProductionTask {
  id: string;
  atelierId?: string;
  orderId: string;
  type: TaskType;
  taskName?: string;
  assignedUserId?: string;
  assignedUserName?: string; // ex: "Koffi (Couturier Senior)"
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type FittingStatus = 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export interface FittingSession {
  id: string;
  atelierId?: string;
  orderId: string;
  clientId: string;
  scheduledAt: string; // Date & Heure ex: "2026-08-28 15:00"
  status: FittingStatus;
  notes?: string;
  adjustments?: string; // Retouches nécessaires
  nextAction?: string; // ex: "Ajustement ceinture"
  createdAt: string;
  updatedAt?: string;
}

export type PaymentMethodEnum = 
  | 'CINETPAY'
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'MTN_MONEY'
  | 'MOOV_MONEY'
  | 'CARD'
  | 'CASH'
  | 'BANK_TRANSFER';

export interface Payment {
  id: string;
  atelierId?: string;
  orderId: string;
  amount: number;
  currency?: string; // ex: "FCFA"
  method: PaymentMethodEnum | string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  provider?: string;
  providerTransactionId?: string;
  clientName?: string;
  note?: string;
  date?: string; // Alias rétrocompatibilité UI
  createdAt?: string;
  updatedAt?: string;
}

export interface Receipt {
  id: string;
  atelierId?: string;
  orderId: string;
  paymentId?: string;
  receiptNumber: string; // ex: "REC-2026-000001" (Génération Serveur)
  amount: number;
  currency?: string; // ex: "FCFA"
  issuedAt: string;
  pdfUrl?: string;
  status: string; // ex: "ISSUED"
  createdAt?: string;
}

export interface Attachment {
  id: string;
  atelierId?: string;
  entityType: 'ORDER' | 'CLIENT' | 'GARMENT' | 'FABRIC' | string;
  entityId: string;
  storageKey: string; // Clé de stockage S3 / CDN
  url: string; // URL d'accès sécurisé
  mimeType: string;
  size?: number;
  createdAt: string;
}

export interface CatalogueItem {
  id: string;
  code?: string; // ex: "MOD-001", "BZN-101"
  title: string;
  category: 'Robes' | 'Costumes' | 'Hommes' | 'Tenues traditionnelles' | 'Mariage' | 'Enfants' | 'Autres';
  imageUrl: string;
  description: string;
  estimatedPrice: string; // ex: "45 000 FCFA" ou "Sur devis"
  estimatedLeadTime: string; // ex: "3-5 jours"
  tags: string[];
}

export interface ModelRequest {
  id: string;
  modelId: string;
  modelTitle: string;
  clientName: string;
  clientWhatsapp: string;
  desiredDate: string;
  message?: string;
  createdAt: string;
  status: 'nouvelle' | 'acceptee' | 'refusee';
}

export type SubscriptionPlan = 'gratuit' | 'starter' | 'pro' | 'atelier';

export interface AtelierProfile {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  ownerName: string;
  whatsapp: string;
  address: string;
  city: string; // ex: Abidjan (Cocody)
  description: string;
  specialties: string[];
  openingHours: string;
  reminderDaysBeforeDelivery?: number; // Nombre de jours avant le retrait pour notifier (ex: 3 jours par défaut)
  plan?: SubscriptionPlan; // 'gratuit' | 'starter' | 'pro' | 'atelier'
  trialEndsAt?: string; // Date de fin d'essai gratuit 1 mois (ex: '2026-09-18')
  registeredAt?: string; // Date d'inscription de l'atelier (ex: '2026-08-18')
  // Options de Personnalisation SaaS Multi-Tenant :
  currency?: string; // ex: 'FCFA', 'EUR', 'USD', 'GNF'
  measurementUnit?: string; // ex: 'cm', 'pouces'
  taxRate?: number; // ex: 0 ou 18 (%)
  receiptFooterMsg?: string; // ex: "Merci pour votre confiance !"
  enablePublicCatalogue?: boolean;
  autoBackupCloud?: boolean;
}
