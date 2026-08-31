import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Configuration de la connexion MySQL (Variables d'environnement ou valeurs par défaut XAMPP / WAMP)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digicouture_db',
  port: Number(process.env.DB_PORT) || 3306
};

// Pool de connexions MySQL
const pool = mysql.createPool(dbConfig);

// Test de connexion initiale à MySQL
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'ok', message: '🟢 Connecté à la base de données MySQL DigiCouture avec succès !' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: '🔴 Erreur de connexion MySQL : ' + error.message });
  }
});

// --- API ENDPOINTS CLIENTS (FILTRÉS PAR ATELIER DE COUTURE) ---
app.get('/api/clients', async (req, res) => {
  try {
    const { atelierId } = req.query;
    let query = 'SELECT * FROM clients ORDER BY createdAt DESC';
    let params: any[] = [];
    
    if (atelierId) {
      query = 'SELECT * FROM clients WHERE atelierId = ? ORDER BY createdAt DESC';
      params = [atelierId];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { id, atelierId, fullName, whatsapp, address, avatarUrl, createdAt } = req.body;
    await pool.query(
      'INSERT INTO clients (id, atelierId, fullName, whatsapp, address, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, atelierId || 'atl-default', fullName, whatsapp, address || '', avatarUrl || '', createdAt || new Date().toISOString().split('T')[0]]
    );
    res.json({ success: true, message: 'Client créé avec succès et associé à cet Atelier !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINTS COMMANDES (FILTRÉES PAR ATELIER DE COUTURE) ---
app.get('/api/orders', async (req, res) => {
  try {
    const { atelierId } = req.query;
    let query = 'SELECT * FROM orders ORDER BY createdAt DESC';
    let params: any[] = [];

    if (atelierId) {
      query = 'SELECT * FROM orders WHERE atelierId = ? ORDER BY createdAt DESC';
      params = [atelierId];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { id, atelierId, clientName, clientWhatsapp, modelName, fabricDetails, specialInstructions, deliveryDate, urgency, totalAmount, depositAmount, remainingAmount, status, createdAt } = req.body;
    await pool.query(
      `INSERT INTO orders 
      (id, atelierId, clientName, clientWhatsapp, modelName, fabricDetails, specialInstructions, deliveryDate, urgency, totalAmount, depositAmount, remainingAmount, status, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, atelierId || 'atl-default', clientName, clientWhatsapp, modelName, fabricDetails || '', specialInstructions || '', deliveryDate, urgency || 'normale', totalAmount, depositAmount, remainingAmount, status || 'commande_recue', createdAt || new Date().toISOString().split('T')[0]]
    );
    res.json({ success: true, message: 'Commande enregistrée et isolée dans cet Atelier !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Statut mis à jour en BDD MySQL !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINTS PAIEMENTS (FILTRÉS PAR ATELIER DE COUTURE) ---
app.get('/api/payments', async (req, res) => {
  try {
    const { atelierId } = req.query;
    let query = 'SELECT * FROM payments ORDER BY date DESC';
    let params: any[] = [];

    if (atelierId) {
      query = 'SELECT * FROM payments WHERE atelierId = ? ORDER BY date DESC';
      params = [atelierId];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { id, atelierId, orderId, clientName, amount, method, date, note } = req.body;
    await pool.query(
      'INSERT INTO payments (id, atelierId, orderId, clientName, amount, method, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, atelierId || 'atl-default', orderId, clientName, amount, method, date || new Date().toISOString().split('T')[0], note || '']
    );
    res.json({ success: true, message: 'Paiement comptabilisé pour cet Atelier !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINTS AUTHENTIFICATION & ATELIER PAR NUMÉRO UNIQUE ---
app.post('/api/auth/phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }
    
    // Formattage propre du numéro
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Recherche de l'atelier correspondant au numéro unique
    const [rows]: any = await pool.query('SELECT * FROM ateliers WHERE whatsapp = ? OR phone = ? LIMIT 1', [cleanPhone, cleanPhone]);
    
    if (rows && rows.length > 0) {
      // Compte / Atelier existant
      res.json({
        isNew: false,
        atelier: rows[0],
        message: '🟢 Connexion réussie à l\'atelier !'
      });
    } else {
      // Création automatique de l'Atelier / Compte unique pour ce numéro
      const newAtelierId = `atl-${Date.now()}`;
      const newAtelierName = `Atelier Haute Couture (${cleanPhone.slice(-4)})`;
      const defaultPlan = 'pro';

      await pool.query(
        `INSERT INTO ateliers (id, name, slug, ownerName, whatsapp, phone, address, city, plan, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newAtelierId, newAtelierName, `atelier-${Date.now()}`, 'Couturier Propriétaire', cleanPhone, cleanPhone, 'Abidjan', 'Abidjan', defaultPlan, new Date().toISOString().split('T')[0]]
      );

      const [newRows]: any = await pool.query('SELECT * FROM ateliers WHERE id = ?', [newAtelierId]);

      res.json({
        isNew: true,
        atelier: newRows[0],
        message: '🎉 Nouveau compte Atelier créé avec succès pour ce numéro unique !'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINTS ATELIERS (SUPERADMIN & RECHERCHE UNIQUE) ---
app.get('/api/ateliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ateliers ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ateliers', async (req, res) => {
  try {
    const { id, name, slug, ownerName, whatsapp, address, city, description, specialties, openingHours, plan } = req.body;
    await pool.query(
      `INSERT INTO ateliers 
      (id, name, slug, ownerName, whatsapp, address, city, description, specialties, openingHours, plan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug || name.toLowerCase().replace(/\s+/g, '-'), ownerName, whatsapp, address || '', city || 'Abidjan', description || '', JSON.stringify(specialties || []), openingHours || '08h00 - 19h00', plan || 'pro']
    );
    res.json({ success: true, message: 'Nouvel atelier activé en BDD MySQL !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur backend MySQL API Express
app.listen(PORT, () => {
  console.log(`🚀 Serveur Backend MySQL DigiCouture démarré sur http://localhost:${PORT}`);
});
