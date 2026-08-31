import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function debug() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'digicouture_db',
    port: Number(process.env.DB_PORT) || 3306
  });

  try {
    const [paymentsCols] = await conn.query('SHOW COLUMNS FROM payments');
    console.log('--- payments columns ---');
    console.log(paymentsCols.map(c => `${c.Field} (${c.Type})`));

    const [ordersCols] = await conn.query('SHOW COLUMNS FROM orders');
    console.log('--- orders columns ---');
    console.log(ordersCols.map(c => `${c.Field} (${c.Type})`));

    const [ateliersCols] = await conn.query('SHOW COLUMNS FROM ateliers');
    console.log('--- ateliers columns ---');
    console.log(ateliersCols.map(c => `${c.Field} (${c.Type})`));
  } catch (e) {
    console.error('Error debugging db:', e.message);
  } finally {
    await conn.end();
  }
}

debug();
