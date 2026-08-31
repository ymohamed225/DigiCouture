import mysql from 'mysql2/promise';

async function initDb() {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
    await conn.query("CREATE DATABASE IF NOT EXISTS digicouture_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    console.log("✅ Base de données digicouture_db créée avec succès !");
    
    await conn.query("USE digicouture_db");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ateliers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        ownerName VARCHAR(255),
        whatsapp VARCHAR(50),
        city VARCHAR(100),
        address TEXT,
        plan VARCHAR(50) DEFAULT 'gratuit',
        registeredAt VARCHAR(50),
        trialEndsAt VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        atelierId VARCHAR(50),
        fullName VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50),
        address TEXT,
        avatarUrl TEXT,
        createdAt VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        atelierId VARCHAR(50),
        code VARCHAR(50),
        clientId VARCHAR(50),
        clientName VARCHAR(255),
        clientWhatsapp VARCHAR(50),
        modelName VARCHAR(255),
        garmentType VARCHAR(100),
        description TEXT,
        fabricName VARCHAR(100),
        fabricColor VARCHAR(100),
        deliveryDate VARCHAR(50),
        urgency VARCHAR(50),
        status VARCHAR(50),
        totalAmount DECIMAL(12,2) DEFAULT 0,
        depositAmount DECIMAL(12,2) DEFAULT 0,
        remainingAmount DECIMAL(12,2) DEFAULT 0,
        modelImageUrl TEXT,
        createdAt VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        orderId VARCHAR(50),
        clientName VARCHAR(255),
        amount DECIMAL(12,2),
        method VARCHAR(50),
        date VARCHAR(50),
        note TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ Tables [ateliers, clients, orders, payments] créées avec succès dans digicouture_db !");
    await conn.end();
  } catch (e) {
    console.error("Erreur SQL:", e.message);
  }
}

initDb();
