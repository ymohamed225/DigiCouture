import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';

export const measurementsRouter = Router();

// GET /api/measurements - Dernières mensurations actives
measurementsRouter.get('/', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { clientId } = req.query;
  try {
    const sql = clientId 
      ? 'SELECT * FROM measurements WHERE atelierId = ? AND clientId = ?'
      : 'SELECT * FROM measurements WHERE atelierId = ?';
    const params = clientId ? [atelierId, clientId] : [atelierId];
    const [rows]: any = await pool!.query(sql, params);
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/measurements/history - Historique chronologique complet des sessions de mesures d'un client
measurementsRouter.get('/history', requireTenant, async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId obligatoire pour consulter l\'historique des mesures.' });
  }

  try {
    const [rows]: any = await pool!.query(
      'SELECT * FROM measurement_history WHERE atelierId = ? AND clientId = ? ORDER BY recordedAt DESC',
      [atelierId, clientId]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/measurements - Nouvelle session de mesure (Archivage automatique de l'ancienne version dans l'historique)
measurementsRouter.post('/', requireTenant, async (req: Request, res: Response) => {
  const m = req.body;
  const atelierId = req.atelierId!;

  if (!m.clientId) {
    return res.status(400).json({ error: 'clientId obligatoire' });
  }

  try {
    // 1. Recherche de l'ancienne mesure du client pour archivage dans l'historique
    const [existingRows]: any = await pool!.query(
      'SELECT * FROM measurements WHERE atelierId = ? AND clientId = ?',
      [atelierId, m.clientId]
    );

    let historyArchived = false;
    if (existingRows.length > 0) {
      const prev = existingRows[0];
      const historyId = `hist-${Date.now()}`;
      const recordedAt = prev.updatedAt || new Date().toISOString().split('T')[0];
      
      await pool!.query(
        `INSERT INTO measurement_history (id, atelierId, clientId, profileName, snapshotData, recordedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          historyId,
          atelierId,
          m.clientId,
          m.profileName || `Session du ${recordedAt}`,
          JSON.stringify(prev),
          recordedAt
        ]
      );
      historyArchived = true;
    }

    // 2. Enregistrement de la nouvelle session de mesure
    const id = m.id || `meas-${Date.now()}`;
    const updatedAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `INSERT INTO measurements (id, atelierId, clientId, category, epaules, poitrine, sousPoitrine, hauteurPoitrine, carrureDevant, carrureDos, tourCou, tourBras, tourPoignet, longueurManche, longueurTailleDevant, longueurTailleDos, tourTaille, tourHanche, hauteurHanches, longueurBas, longueurJupe, longueurPantalon, entrejambe, cuisse, tourGenou, tourCheville, longueurGrandBoubou, largeurEnvergureBoubou, customFields, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE category=VALUES(category), epaules=VALUES(epaules), poitrine=VALUES(poitrine), sousPoitrine=VALUES(sousPoitrine), hauteurPoitrine=VALUES(hauteurPoitrine), carrureDevant=VALUES(carrureDevant), carrureDos=VALUES(carrureDos), tourCou=VALUES(tourCou), tourBras=VALUES(tourBras), tourPoignet=VALUES(tourPoignet), longueurManche=VALUES(longueurManche), longueurTailleDevant=VALUES(longueurTailleDevant), longueurTailleDos=VALUES(longueurTailleDos), tourTaille=VALUES(tourTaille), tourHanche=VALUES(tourHanche), hauteurHanches=VALUES(hauteurHanches), longueurBas=VALUES(longueurBas), longueurJupe=VALUES(longueurJupe), longueurPantalon=VALUES(longueurPantalon), entrejambe=VALUES(entrejambe), cuisse=VALUES(cuisse), tourGenou=VALUES(tourGenou), tourCheville=VALUES(tourCheville), longueurGrandBoubou=VALUES(longueurGrandBoubou), largeurEnvergureBoubou=VALUES(largeurEnvergureBoubou), customFields=VALUES(customFields), updatedAt=VALUES(updatedAt)`,
      [
        id,
        atelierId,
        m.clientId,
        m.category || 'femme',
        m.epaules || 0,
        m.poitrine || 0,
        m.sousPoitrine || 0,
        m.hauteurPoitrine || 0,
        m.carrureDevant || 0,
        m.carrureDos || 0,
        m.tourCou || 0,
        m.tourBras || 0,
        m.tourPoignet || 0,
        m.longueurManche || 0,
        m.longueurTailleDevant || 0,
        m.longueurTailleDos || 0,
        m.tourTaille || 0,
        m.tourHanche || 0,
        m.hauteurHanches || 0,
        m.longueurBas || 0,
        m.longueurJupe || 0,
        m.longueurPantalon || 0,
        m.entrejambe || 0,
        m.cuisse || 0,
        m.tourGenou || 0,
        m.tourCheville || 0,
        m.longueurGrandBoubou || 0,
        m.largeurEnvergureBoubou || 0,
        JSON.stringify(m.customFields || {}),
        updatedAt
      ]
    );

    return res.json({
      success: true,
      measurements: { ...m, atelierId, updatedAt },
      historyArchived,
      message: historyArchived 
        ? '✅ Ancienne mesure archivée dans l\'historique et nouvelle session de mesure enregistrée !' 
        : '✅ Première session de mesure enregistrée avec succès !'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
