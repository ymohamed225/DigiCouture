import mysql from 'mysql2/promise';

async function addOrder() {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'digicouture_db' });
    await conn.query(
      `INSERT INTO orders (id, atelierId, code, clientId, clientName, clientWhatsapp, modelName, garmentType, fabricName, fabricColor, description, deliveryDate, urgency, status, totalAmount, depositAmount, remainingAmount, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ord-1787178001',
        'atl-1787175204484',
        'CMD-2026-891',
        'cli-1787177288573',
        'Aicha Traoré',
        '0103020034',
        'Robe de Soirée Bazin Riche',
        'Robe de Gala',
        'Bazin Riche Luxe',
        'Bleu Roi',
        'Confection sur-mesure broderie fine au col',
        '2026-08-28',
        'normale',
        'couture',
        85000,
        50000,
        35000,
        '2026-08-19'
      ]
    );
    console.log("✅ Commande créée avec succès pour l'atelier Maiga Couture VIP !");
    await conn.end();
  } catch (e) {
    console.error("Erreur:", e.message);
  }
}

addOrder();
