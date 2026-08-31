import type { AtelierProfile, Client, Order, Payment, Measurements } from './types';

export const demoAtelier: AtelierProfile = {
  id: 'demo-atelier-vip',
  name: 'Coulibaly Couture VIP',
  slug: 'coulibaly-couture-demo',
  ownerName: 'Maison Coulibaly',
  whatsapp: '+225 07 00 00 00 00',
  address: 'Cocody Ambassades, Boulevard de France',
  city: 'Abidjan',
  description: 'Maison de Couture spécialisée dans la Haute Couture Africaine, le Bazin Riche et les tenues de cérémonie sur-mesure.',
  specialties: ['Bazin Riche Brodé', 'Wax Hollandais VIP', 'Robes de Mariée', 'Costumes Homme'],
  openingHours: 'Lundi - Samedi : 08h30 - 19h00',
  reminderDaysBeforeDelivery: 3,
  plan: 'atelier'
};

export const demoClients: Client[] = [
  {
    id: 'demo-cli-1',
    atelierId: 'demo-atelier-vip',
    fullName: 'Awa Diallo',
    whatsapp: '+2250701020304',
    notes: 'Cliente fidèle VIP. Préfère les coupes ajustées avec finitions dorées.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'demo-cli-2',
    atelierId: 'demo-atelier-vip',
    fullName: 'Koffi Kouadio',
    whatsapp: '+2250502030405',
    notes: 'Commande régulière de boubous Bazin pour cérémonies.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'demo-cli-3',
    atelierId: 'demo-atelier-vip',
    fullName: 'Marie-Laure Bamba',
    whatsapp: '+2250103040506',
    notes: 'Tenues de gala et robes de soirée.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const demoOrders: Order[] = [
  {
    id: 'demo-ord-1',
    orderNumber: 'CMD-2026-975',
    atelierId: 'demo-atelier-vip',
    clientId: 'demo-cli-1',
    clientName: 'Awa Diallo',
    clientWhatsapp: '+2250701020304',
    modelName: 'Robe Bazin Impériale',
    modelCategory: 'Femme',
    garmentType: 'Robe de Soirée Bazin Riche',
    fabricName: 'Bazin Magenta 5m',
    description: 'Bazin Magenta 5m avec broderies dorées',
    totalAmount: 180000,
    depositAmount: 100000,
    remainingAmount: 80000,
    status: 'couture',
    urgency: 'normale',
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: 'Broderies fines sur les manches et le col.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'demo-ord-2',
    orderNumber: 'CMD-2026-976',
    atelierId: 'demo-atelier-vip',
    clientId: 'demo-cli-2',
    clientName: 'Koffi Kouadio',
    clientWhatsapp: '+2250502030405',
    modelName: 'Grand Boubou Prestige',
    modelCategory: 'Homme',
    garmentType: 'Grand Boubou 3 Pièces Bazin',
    fabricName: 'Bazin Bleu Nuit',
    description: 'Bazin Bleu Nuit Premium',
    totalAmount: 225000,
    depositAmount: 145000,
    remainingAmount: 80000,
    status: 'decoupe',
    urgency: 'urgente',
    deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'demo-ord-3',
    orderNumber: 'CMD-2026-977',
    atelierId: 'demo-atelier-vip',
    clientId: 'demo-cli-3',
    clientName: 'Marie-Laure Bamba',
    clientWhatsapp: '+2250103040506',
    modelName: 'Tailleur Wax Haute Couture',
    modelCategory: 'Femme',
    garmentType: 'Ensemble Tailleur Wax VIP',
    fabricName: 'Wax Hollandais 6 yards',
    description: 'Wax Hollandais Véritable 6 yards',
    totalAmount: 95000,
    depositAmount: 95000,
    remainingAmount: 0,
    status: 'prete',
    urgency: 'normale',
    deliveryDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

export const demoPayments: Payment[] = [
  {
    id: 'demo-pay-1',
    atelierId: 'demo-atelier-vip',
    orderId: 'demo-ord-1',
    amount: 100000,
    method: 'WAVE',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'demo-pay-2',
    atelierId: 'demo-atelier-vip',
    orderId: 'demo-ord-2',
    amount: 145000,
    method: 'ORANGE_MONEY',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'demo-pay-3',
    atelierId: 'demo-atelier-vip',
    orderId: 'demo-ord-3',
    amount: 95000,
    method: 'CASH',
    status: 'completed',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

export const demoMeasurements: Record<string, Measurements> = {
  'demo-cli-1': {
    clientId: 'demo-cli-1',
    category: 'femme',
    epaules: 40,
    poitrine: 92,
    tourTaille: 74,
    tourHanche: 102,
    tourBras: 30
  },
  'demo-cli-2': {
    clientId: 'demo-cli-2',
    category: 'homme',
    epaules: 48,
    poitrine: 106,
    tourTaille: 94,
    tourCou: 42
  }
};
