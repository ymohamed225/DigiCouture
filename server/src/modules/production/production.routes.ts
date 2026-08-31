import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const productionRouter = Router();

// GET /api/production/tasks - Liste des tâches de production d'un atelier
productionRouter.get('/tasks', requireTenant, requirePermission('production.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { orderId, assignedUserId, status } = req.query;

  try {
    let sql = 'SELECT * FROM production_tasks WHERE atelierId = ?';
    const params: any[] = [atelierId];

    if (orderId) {
      sql += ' AND orderId = ?';
      params.push(orderId);
    }
    if (assignedUserId) {
      sql += ' AND assignedUserId = ?';
      params.push(assignedUserId);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY createdAt DESC';

    const [tasks]: any = await pool!.query(sql, params);
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/production/who-is-working - "Qui travaille actuellement sur cette commande ?"
productionRouter.get('/who-is-working', requireTenant, requirePermission('production.read'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  const { orderId } = req.query;

  try {
    let sql = `
      SELECT t.id, t.orderId, o.orderNumber, o.clientName, o.modelName, t.type, t.assignedUserId, t.assignedUserName, t.status, t.startedAt, t.notes
      FROM production_tasks t
      JOIN orders o ON t.orderId = o.id
      WHERE t.atelierId = ? AND t.status = 'in_progress'
    `;
    const params: any[] = [atelierId];

    if (orderId) {
      sql += ' AND t.orderId = ?';
      params.push(orderId);
    }

    sql += ' ORDER BY t.startedAt DESC';

    const [activeArtisans]: any = await pool!.query(sql, params);
    return res.json(activeArtisans);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/production/tasks - Affecter / Créer une tâche de production (CUTTING, SEWING, EMBROIDERY, FINISHING, etc.)
productionRouter.post('/tasks', requireTenant, requirePermission('production.update'), async (req: Request, res: Response) => {
  const task = req.body;
  const atelierId = req.atelierId!;

  if (!task.orderId || !task.type) {
    return res.status(400).json({ error: 'orderId et type (CUTTING, SEWING, etc.) obligatoires' });
  }

  try {
    const taskId = task.id || `task-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    await pool!.query(
      `INSERT INTO production_tasks (id, atelierId, orderId, type, taskName, assignedUserId, assignedUserName, status, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        atelierId,
        task.orderId,
        task.type,
        task.taskName || `Tâche ${task.type}`,
        task.assignedUserId || null,
        task.assignedUserName || 'Artisan Couturier',
        task.status || 'pending',
        task.notes || '',
        createdAt
      ]
    );

    return res.json({
      success: true,
      task: {
        id: taskId,
        atelierId,
        orderId: task.orderId,
        type: task.type,
        taskName: task.taskName || `Tâche ${task.type}`,
        assignedUserId: task.assignedUserId || null,
        assignedUserName: task.assignedUserName || 'Artisan Couturier',
        status: task.status || 'pending',
        createdAt
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/production/tasks/:id/status - Démarrage / Validation / Avancement d'une tâche de production
productionRouter.put('/tasks/:id/status', requireTenant, requirePermission('production.update'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const atelierId = req.atelierId!;

  if (!status) return res.status(400).json({ error: 'Statut de tâche obligatoire' });

  try {
    const nowIso = new Date().toISOString();
    let startedAtClause = '';
    let completedAtClause = '';
    const params: any[] = [status];

    if (status === 'in_progress') {
      startedAtClause = ', startedAt = ?';
      params.push(nowIso);
    } else if (status === 'completed') {
      completedAtClause = ', completedAt = ?';
      params.push(nowIso);
    }

    if (notes) {
      params.push(notes);
    }

    params.push(nowIso); // updatedAt
    params.push(id);
    params.push(atelierId);

    let sql = `UPDATE production_tasks SET status = ? ${startedAtClause} ${completedAtClause}`;
    if (notes) sql += ', notes = ?';
    sql += ', updatedAt = ? WHERE id = ? AND atelierId = ?';

    await pool!.query(sql, params);

    return res.json({ success: true, taskId: id, status, updatedAt: nowIso });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
