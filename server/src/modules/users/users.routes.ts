import { Router, Request, Response } from 'express';
import { pool } from '../../config/database.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';

export const usersRouter = Router();

// GET /api/users - Liste des collaborateurs d'un atelier
usersRouter.get('/', requireTenant, requirePermission('users.manage'), async (req: Request, res: Response) => {
  const atelierId = req.atelierId!;
  try {
    const [rows]: any = await pool!.query(
      'SELECT id, atelierId, fullName, phone, email, roleId, createdAt FROM users WHERE atelierId = ? ORDER BY fullName ASC',
      [atelierId]
    );
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users - Invitation / Création d'un membre d'équipe
usersRouter.post('/', requireTenant, requirePermission('users.manage'), async (req: Request, res: Response) => {
  const { fullName, phone, email, role, password } = req.body;
  const atelierId = req.atelierId!;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'fullName et phone obligatoires' });
  }

  try {
    const id = `usr-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    await pool!.query(
      `INSERT INTO users (id, atelierId, fullName, phone, email, passwordHash, role, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, atelierId, fullName, phone, email || '', password || '', role || 'TAILOR', createdAt]
    );
    return res.json({ success: true, user: { id, atelierId, fullName, phone, email, role: role || 'TAILOR', createdAt } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/role - Modification du rôle d'un membre d'équipe
usersRouter.put('/:id/role', requireTenant, requirePermission('users.manage'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const atelierId = req.atelierId!;

  if (!role) return res.status(400).json({ error: 'Rôle obligatoire' });

  try {
    await pool!.query('UPDATE users SET role = ? WHERE id = ? AND atelierId = ?', [role, id, atelierId]);
    return res.json({ success: true, id, role });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Suppression d'un membre d'équipe
usersRouter.delete('/:id', requireTenant, requirePermission('users.manage'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const atelierId = req.atelierId!;

  try {
    await pool!.query('DELETE FROM users WHERE id = ? AND atelierId = ?', [id, atelierId]);
    return res.json({ success: true, message: 'Collaborateur retiré avec succès' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
