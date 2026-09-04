export function getStepWhatsappMessage(
  order: {
    id: string;
    code?: string;
    orderNumber?: string;
    clientName: string;
    modelName: string;
    fabricName?: string;
    totalAmount: number;
    depositAmount: number;
    remainingAmount: number;
  },
  newStatus: string,
  atelierName: string = 'Maison DigiCouture VIP',
  atelierAddress: string = 'Abidjan, Côte d\'Ivoire'
): string {
  const orderCode = order.code || order.orderNumber || order.id;
  const clientName = order.clientName;
  const modelName = order.modelName;
  const fabric = order.fabricName || 'Tissu Sélectionné Luxe';
  const trackingUrl = `https://digicouture.app/suivi/${order.id}`;

  switch (newStatus) {
    case 'commande_recue':
      return `📦 *MAISON DIGICOUTURE VIP - COMMANDE REÇUE*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Votre commande N° *${orderCode}* pour la création *${modelName}* (${fabric}) a bien été enregistrée dans notre atelier *${atelierName}*.\n\n` +
        `💰 Total : ${order.totalAmount.toLocaleString('fr-FR')} FCFA\n` +
        `💳 Acompte versé : ${order.depositAmount.toLocaleString('fr-FR')} FCFA\n` +
        `💵 Reste à payer : ${order.remainingAmount.toLocaleString('fr-FR')} FCFA\n\n` +
        `🔗 Suivez l'avancement en temps réel sur votre portail client :\n${trackingUrl}\n\n` +
        `Merci pour votre confiance ! ✨`;

    case 'mesures_prises':
    case 'mesures_validees':
      return `📏 *MAISON DIGICOUTURE VIP - MESURES VALIDÉES*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Vos 22 points de mensurations pour la tenue *${modelName}* (Commande N° *${orderCode}*) ont été enregistrés et validés par le Maître Tailleur. Le patron haute couture est en cours de modélisation.\n\n` +
        `🔗 Suivez l'évolution de votre création :\n${trackingUrl}\n\n` +
        `À très bientôt ! ✨`;

    case 'decoupe':
      return `✂️ *MAISON DIGICOUTURE VIP - DÉCOUPE EN COURS*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Grande étape ! Le tissu (${fabric}) de votre tenue *${modelName}* (Commande N° *${orderCode}*) est actuellement sur notre table de coupe entre les mains expertes de nos artisans.\n\n` +
        `🔗 Suivez la confection en direct :\n${trackingUrl}\n\n` +
        `Merci pour votre confiance ! ✨`;

    case 'couture':
      return `🧵 *MAISON DIGICOUTURE VIP - COUTURE & ASSEMBLAGE*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Les différentes pièces de votre création *${modelName}* (Commande N° *${orderCode}*) sont en cours de montage et d'assemblage de précision sur nos machines.\n\n` +
        `🔗 Suivez la progression sur votre espace VIP :\n${trackingUrl}\n\n` +
        `À très bientôt chez ${atelierName} !`;

    case 'finitions':
      return `🪡 *MAISON DIGICOUTURE VIP - FINITIONS & BRODERIES*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Votre tenue *${modelName}* (Commande N° *${orderCode}*) est désormais à l'étape des finitions délicates : broderies fines au fil d'Or, pose des boutons et ajustements.\n\n` +
        `🔗 Suivez les derniers détails :\n${trackingUrl}\n\n` +
        `L'excellence se cache dans les détails ! ✨`;

    case 'essayage':
      return `👗 *MAISON DIGICOUTURE VIP - INVITATION ESSAYAGE*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Excellente nouvelle ! Votre tenue *${modelName}* (Commande N° *${orderCode}*) est prête pour la séance d'essayage !\n\n` +
        `📍 Nous vous accueillons au salon d'essayage de l'atelier *${atelierName}* (${atelierAddress}).\n` +
        `🔗 Consultez votre fiche d'essayage :\n${trackingUrl}\n\n` +
        `À très vite ! ✨`;

    case 'prete':
      return `✅ *MAISON DIGICOUTURE VIP - TENUE PRÊTE À RETIRER !*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Votre tenue *${modelName}* (Commande N° *${orderCode}*) est totalement terminée, repassée, cintrée et sous housse de protection !\n\n` +
        `💰 Solde restant à régler à la livraison : *${order.remainingAmount.toLocaleString('fr-FR')} FCFA*\n` +
        `📍 Emplacement de retrait : *${atelierName}* (${atelierAddress})\n` +
        `🔗 Lien de suivi & reçu :\n${trackingUrl}\n\n` +
        `Nous avons hâte de vous la remettre ! 🎉`;

    case 'livree':
      return `🧾 *REÇU DE LIVRAISON OFFICIEL AUTOMATIQUE - MAISON DIGICOUTURE VIP*\n\n` +
        `📍 *N° Commande :* ${orderCode}\n` +
        `👤 *Client VIP :* ${clientName}\n` +
        `👗 *Modèle Confectionné :* ${modelName}\n` +
        `🧵 *Tissu & Matière :* ${fabric}\n` +
        `-----------------------------------\n` +
        `💰 *Prix Total Confection :* ${order.totalAmount.toLocaleString('fr-FR')} FCFA\n` +
        `💳 *Acompte Antérieur Versé :* ${order.depositAmount.toLocaleString('fr-FR')} FCFA\n` +
        `✅ *Solde Réglé à la Livraison :* 0 FCFA (SOLDE ENTIÈREMENT RÉGLÉ)\n\n` +
        `🔒 *Statut :* ARTICLE CERTIFIÉ CONFORME & REMIS EN MAINS PROPRES AU CLIENT\n` +
        `✨ Merci infiniment pour votre confiance ! À très bientôt chez ${atelierName}.`;

    default:
      return `📌 *MAISON DIGICOUTURE VIP - MISE À JOUR DE COMMANDE*\n\n` +
        `Bonjour *${clientName}* 👋,\n` +
        `Votre commande N° *${orderCode}* (*${modelName}*) est désormais au statut : *${newStatus}*.\n\n` +
        `🔗 Suivez votre commande en direct :\n${trackingUrl}`;
  }
}
