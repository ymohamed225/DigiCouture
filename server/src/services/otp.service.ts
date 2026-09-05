import crypto from 'crypto';
import { pool } from '../config/database.js';
import { WhatsappGatewayService } from './whatsappGateway.service.js';

export class OtpService {
  // Durée de validité rapide (5 minutes)
  private static OTP_EXPIRATION_MS = 5 * 60 * 1000;
  // Rate limit de demande (60 secondes d'attente entre deux demandes)
  private static RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
  // Nombre maximum d'essais autorisé par challenge
  private static MAX_ATTEMPTS = 3;

  /**
   * Helper de hachage cryptographique du code OTP (Interdiction de stocker en clair)
   */
  private static hashCode(code: string): string {
    return crypto.createHash('sha256').update(`digicouture_salt_${code}`).digest('hex');
  }

  /**
   * Demande de génération et d'envoi d'un OTP par WhatsApp
   */
  public static async requestOtp(phone: string, purpose: string = 'AUTH'): Promise<{ success: boolean; message: string; rawOtp: string }> {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Numéro de téléphone invalide.');
    }

    const nowMs = Date.now();

    // 1. Rate Limiting : Vérifier si un OTP a déjà été généré pour ce numéro durant les 60 dernières secondes
    const [recentRows]: any = await pool!.query(
      `SELECT createdAt FROM otp_challenges 
       WHERE phone = ? AND purpose = ? AND createdAt > ? 
       ORDER BY createdAt DESC LIMIT 1`,
      [cleanPhone, purpose, new Date(nowMs - this.RATE_LIMIT_COOLDOWN_MS).toISOString()]
    );

    if (recentRows && recentRows.length > 0) {
      throw new Error('Un code OTP a déjà été envoyé récemment. Veuillez patienter 60 secondes avant de réessayer.');
    }

    // 2. Génération cryptographique aléatoire d'un code OTP à 4-6 chiffres (ex: 4 chiffres 1000-9999)
    const rawOtp = Math.floor(1000 + crypto.randomInt(9000)).toString();
    const codeHash = this.hashCode(rawOtp);

    const id = `otp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(nowMs + this.OTP_EXPIRATION_MS).toISOString();
    const createdAt = new Date(nowMs).toISOString();

    // 3. Stockage exclusif du HASH cryptographique dans la table otp_challenges (JAMAIS EN CLAIR)
    await pool!.query(
      `INSERT INTO otp_challenges (id, phone, codeHash, expiresAt, attempts, consumedAt, purpose, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, cleanPhone, codeHash, expiresAt, 0, null, purpose, createdAt]
    );

    // 4. Envoi DIRECT et PROPRE du message WhatsApp via la passerelle
    const otpMessage = `🔑 Votre code de vérification WhatsApp DigiCouture est : ${rawOtp}\n\nCe code est valide pendant 5 minutes. Ne le communiquez à personne.`;

    const gatewayResult = await WhatsappGatewayService.sendMessage({
      recipient: cleanPhone,
      message: otpMessage
    });

    console.log(`🔒 [OTP Security] Code WhatsApp généré (${rawOtp}) pour +${cleanPhone} | Envoi passerelle (${gatewayResult.provider}): ${gatewayResult.sent ? 'RÉUSSI' : 'SIMULÉ/ÉCHEC'}`);

    return {
      success: true,
      message: gatewayResult.sent 
        ? 'Code de vérification envoyé sur votre WhatsApp. Valide 5 minutes.'
        : 'Code de vérification généré (Mode secours actif : code 1234 ou code affiché).',
      rawOtp
    };
  }

  /**
   * Vérification et consommation à usage unique de l'OTP
   */
  public static async verifyOtp(phone: string, code: string, purpose: string = 'AUTH'): Promise<boolean> {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const inputHash = this.hashCode(code);
    const nowIso = new Date().toISOString();

    // 1. Recherche du dernier challenge actif non consommé
    const [rows]: any = await pool!.query(
      `SELECT * FROM otp_challenges 
       WHERE phone = ? AND purpose = ? AND consumedAt IS NULL
       ORDER BY createdAt DESC LIMIT 1`,
      [cleanPhone, purpose]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Aucun code de vérification actif trouvé pour ce numéro.');
    }

    const challenge = rows[0];

    // 2. Contrôle de la date d'expiration (Fast Expiry)
    if (nowIso > challenge.expiresAt) {
      throw new Error('Code de vérification expiré. Veuillez en demander un nouveau.');
    }

    // 3. Limite de tentatives (Max 3 tentatives)
    if (challenge.attempts >= this.MAX_ATTEMPTS) {
      // Invalidation du challenge suite à trop d'échecs
      await pool!.query('UPDATE otp_challenges SET consumedAt = ? WHERE id = ?', [nowIso, challenge.id]);
      throw new Error('Nombre maximal de tentatives dépassé (3 max). Code invalidé par sécurité.');
    }

    // Incrémentation des tentatives
    await pool!.query('UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?', [challenge.id]);

    // 4. Vérification de la correspondance des hashes
    if (challenge.codeHash !== inputHash) {
      const remaining = this.MAX_ATTEMPTS - (challenge.attempts + 1);
      throw new Error(`Code de vérification incorrect. ${remaining} tentative(s) restante(s).`);
    }

    // 5. Consommation à usage unique (Single-Use)
    await pool!.query('UPDATE otp_challenges SET consumedAt = ? WHERE id = ?', [nowIso, challenge.id]);

    console.log(`✅ [OTP Security] Code WhatsApp validé et consommé à usage unique pour ${cleanPhone}`);
    return true;
  }
}
