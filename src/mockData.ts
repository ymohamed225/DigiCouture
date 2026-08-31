import type { Client, Measurements, Order, Payment, CatalogueItem, ModelRequest, AtelierProfile } from './types';

export const initialAtelier: AtelierProfile = {
  id: '',
  name: 'Mon Atelier',
  slug: '',
  ownerName: '',
  whatsapp: '',
  address: '',
  city: 'Abidjan',
  description: '',
  specialties: [],
  openingHours: '',
  reminderDaysBeforeDelivery: 3
};

export const initialClients: Client[] = [];
export const initialMeasurements: Record<string, Measurements> = {};
export const initialOrders: Order[] = [];
export const initialPayments: Payment[] = [];
export const initialCatalogue: CatalogueItem[] = [];
export const initialRequests: ModelRequest[] = [];
