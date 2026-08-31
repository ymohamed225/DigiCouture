import crypto from 'crypto';
import { pool } from '../config/database.js';

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export class AuthSessionService {
  /**
   * Créer une nouvelle session persistante avec Access Token (30 min) + Refresh Token (30 jours)
   */
  public static async createSession(
    userId: string,
    atelierId: string,
    platform: 'web' | 'ios' | 'android' = 'web',
    deviceId: string = 'unknown'
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: string }> {
    const rawRefreshToken = `ref-tok-${Date.now()}-${crypto.randomUUID()}`;
    const tokenHash = hashToken(rawRefreshToken);

    const now = new Date();
    const expiresDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours (Section 4)
    const createdAt = now.toISOString();
    const expiresAt = expiresDate.toISOString();

    const accessToken = `acc-tok-${atelierId}-${userId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    await pool!.query(
      `INSERT INTO refresh_tokens (id, user_id, atelier_id, token_hash, device_id, platform, created_at, expires_at, last_used_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, userId, atelierId, tokenHash, deviceId, platform, createdAt, expiresAt, createdAt]
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresAt
    };
  }

  /**
   * Valider et renouveler silencieusement la session (Refresh Token Rotation Section 3 & 10)
   */
  public static async refreshSession(
    providedRefreshToken: string,
    platform: 'web' | 'ios' | 'android' = 'web',
    deviceId: string = 'unknown'
  ): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    atelier?: any;
    user?: any;
    error?: string;
    isSuspended?: boolean;
  }> {
    if (!providedRefreshToken) {
      return { success: false, error: 'NO_REFRESH_TOKEN' };
    }

    const tokenHash = hashToken(providedRefreshToken);
    const nowIso = new Date().toISOString();

    // 1. Récupération et vérification en base de données
    const [rows]: any = await pool!.query(
      `SELECT r.*, a.name as atelierName, a.subscription_status, a.is_catalogue_enabled
       FROM refresh_tokens r
       LEFT JOIN ateliers a ON r.atelier_id = a.id
       WHERE r.token_hash = ? LIMIT 1`,
      [tokenHash]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: 'SESSION_NOT_FOUND' };
    }

    const session = rows[0];

    // Vérifier la révocation et l'expiration (Section 14 & 16)
    if (session.revoked_at) {
      return { success: false, error: 'SESSION_REVOKED' };
    }

    if (new Date(session.expires_at).getTime() < new Date().getTime()) {
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    // Vérifier l'état du compte atelier (Compte suspendu / supprimé Section 17 & 20)
    if (session.subscription_status === 'canceled') {
      return { success: false, isSuspended: true, error: 'ACCOUNT_SUSPENDED' };
    }

    // 2. Rotation du Refresh Token (Security Best Practice Section 24)
    await pool!.query('UPDATE refresh_tokens SET revoked_at = ?, last_used_at = ? WHERE id = ?', [nowIso, nowIso, session.id]);

    // 3. Charger le profil complet de l'atelier
    const [ateliers]: any = await pool!.query('SELECT * FROM ateliers WHERE id = ? LIMIT 1', [session.atelier_id]);
    const atelier = ateliers[0] || null;

    if (!atelier) {
      return { success: false, error: 'ATELIER_NOT_FOUND' };
    }

    // 4. Générer le nouveau duo de tokens
    const newSession = await this.createSession(session.user_id, session.atelier_id, platform, deviceId);

    return {
      success: true,
      accessToken: newSession.accessToken,
      refreshToken: newSession.refreshToken,
      atelier,
      user: {
        id: session.user_id,
        atelierId: session.atelier_id,
        role: 'OWNER',
        ownerName: atelier.ownerName
      }
    };
  }

  /**
   * Révocation explicite lors d'une déconnexion volontaire (Section 13)
   */
  public static async revokeSession(providedRefreshToken: string): Promise<boolean> {
    if (!providedRefreshToken) return false;
    const tokenHash = hashToken(providedRefreshToken);
    const nowIso = new Date().toISOString();

    const [result]: any = await pool!.query(
      'UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL',
      [nowIso, tokenHash]
    );

    return result.affectedRows > 0;
  }
}
