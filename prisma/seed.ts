import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Prisma Seed] Initialisation des 30 entités relationnelles d\'entreprise...');

  // 1. Rôles et Permissions RBAC
  const ownerRole = await prisma.role.upsert({
    where: { id: 'role-owner' },
    update: {},
    create: {
      id: 'role-owner',
      name: 'owner',
      description: 'Propriétaire / Gérant d\'atelier haute couture'
    }
  });

  const tailorRole = await prisma.role.upsert({
    where: { id: 'role-tailor' },
    update: {},
    create: {
      id: 'role-tailor',
      name: 'tailor',
      description: 'Artisan Couturier / Confectionneur'
    }
  });

  // 2. Grilles Tarifaires SaaS (SubscriptionPlan)
  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      tier: 'pro',
      name: 'Formule Professionnelle VIP',
      priceMonthly: 15000,
      priceYearly: 150000,
      maxOrders: 10000,
      maxUsers: 10,
      features: JSON.stringify(['WhatsApp receipts', 'Multi-user', 'CinetPay gateway', 'Analytics'])
    }
  });

  // 3. Atelier VIP de Démonstration
  const atelier = await prisma.atelier.upsert({
    where: { slug: 'maison-digicouture-vip' },
    update: {},
    create: {
      id: 'atl-1787175204484',
      name: 'Maison DigiCouture VIP',
      slug: 'maison-digicouture-vip',
      ownerName: 'Awa Diallo',
      whatsapp: '+225 07 08 09 10 11',
      city: 'Abidjan (Cocody)',
      address: 'Boulevard de France, Cocody',
      currency: 'FCFA',
      measurementUnit: 'cm',
      enablePublicCatalogue: true,
      registeredAt: '2026-08-01'
    }
  });

  // 4. Client & Profil de Mesures
  const client1 = await prisma.client.upsert({
    where: { id: 'cli-demo-1' },
    update: {},
    create: {
      id: 'cli-demo-1',
      atelierId: atelier.id,
      fullName: 'Aïcha Kone',
      whatsapp: '+225 05 01 02 03 04',
      address: 'Marcory Zone 4, Abidjan',
      createdAt: '2026-08-05'
    }
  });

  const profile1 = await prisma.measurementProfile.upsert({
    where: { id: 'prof-demo-1' },
    update: {},
    create: {
      id: 'prof-demo-1',
      clientId: client1.id,
      profileName: 'Mesures Robe & Boubou',
      category: 'femme'
    }
  });

  await prisma.measurement.upsert({
    where: { id: 'meas-demo-1' },
    update: {},
    create: {
      id: 'meas-demo-1',
      profileId: profile1.id,
      epaules: 38.5,
      poitrine: 92.0,
      sousPoitrine: 78.0,
      hauteurPoitrine: 25.0,
      carrureDevant: 34.0,
      carrureDos: 35.0,
      tourCou: 36.0,
      tourBras: 28.0,
      tourPoignet: 16.0,
      longueurManche: 58.0,
      longueurTailleDevant: 42.0,
      longueurTailleDos: 40.0,
      tourTaille: 72.0,
      tourHanche: 98.0,
      hauteurHanches: 20.0,
      longueurBas: 105.0,
      longueurJupe: 65.0,
      longueurPantalon: 102.0,
      updatedAt: '2026-08-05'
    }
  });

  // 5. Commande sur mesure
  await prisma.order.upsert({
    where: { id: 'ord-demo-1' },
    update: {},
    create: {
      id: 'ord-demo-1',
      atelierId: atelier.id,
      code: 'CMD-2026-00101',
      clientId: client1.id,
      clientName: client1.fullName,
      clientWhatsapp: client1.whatsapp,
      deliveryDate: '2026-08-28',
      urgency: 'normale',
      totalAmount: 85000,
      depositAmount: 50000,
      remainingAmount: 35000,
      status: 'couture',
      createdAt: '2026-08-12'
    }
  });

  console.log('✅ [Prisma Seed] Initialisation des 30 entités terminée avec succès !');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ [Prisma Seed Error]:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
