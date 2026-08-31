import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const prisma = new PrismaClient();
export let pool: mysql.Pool | null = null;
export let isMySqlConnected = false;
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  if (!pool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('🛑 [SQL Transaction Rollback] Opération annulée intégralement :', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: ENV.DB_HOST,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    isMySqlConnected = true;
    console.log('✅ [Prisma ORM & MySQL] Connecté avec succès à la Base de Données (digicouture_db) !');
    await syncTables(conn);
    conn.release();
  } catch (err: any) {
    isMySqlConnected = false;
    console.error('❌ [Database] ERREUR MYSQL: Serveur de base de données indisponible.', err.message);
  }
}

async function syncTables(conn: mysql.PoolConnection) {
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ateliers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        ownerName VARCHAR(100) NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        city VARCHAR(100) DEFAULT 'Abidjan',
        address VARCHAR(255),
        logoUrl TEXT,
        coverUrl TEXT,
        plan ENUM('gratuit', 'starter', 'pro', 'atelier') DEFAULT 'pro',
        trialEndsAt VARCHAR(30),
        registeredAt VARCHAR(30),
        currency VARCHAR(10) DEFAULT 'FCFA',
        measurementUnit VARCHAR(10) DEFAULT 'cm',
        enablePublicCatalogue TINYINT(1) DEFAULT 1,
        INDEX idx_whatsapp (whatsapp),
        INDEX idx_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        roleId VARCHAR(64) NOT NULL,
        permissionId VARCHAR(64) NOT NULL,
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL UNIQUE,
        email VARCHAR(150),
        passwordHash VARCHAR(255),
        roleId VARCHAR(64),
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE SET NULL,
        INDEX idx_user_atelier (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        userId VARCHAR(64),
        action VARCHAR(100) NOT NULL,
        details JSON,
        ipAddress VARCHAR(45),
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_audit_atelier_logs (atelierId, createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        customerCode VARCHAR(50) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        address VARCHAR(255),
        country VARCHAR(100) DEFAULT 'Côte d''Ivoire',
        notes TEXT,
        avatarUrl TEXT,
        createdAt VARCHAR(30),
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_atelier_client (atelierId, id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        clientId VARCHAR(64) UNIQUE NOT NULL,
        category ENUM('femme', 'homme', 'enfant') DEFAULT 'femme',
        epaules DECIMAL(6,2) DEFAULT 0,
        poitrine DECIMAL(6,2) DEFAULT 0,
        sousPoitrine DECIMAL(6,2) DEFAULT 0,
        hauteurPoitrine DECIMAL(6,2) DEFAULT 0,
        carrureDevant DECIMAL(6,2) DEFAULT 0,
        carrureDos DECIMAL(6,2) DEFAULT 0,
        tourCou DECIMAL(6,2) DEFAULT 0,
        tourBras DECIMAL(6,2) DEFAULT 0,
        tourPoignet DECIMAL(6,2) DEFAULT 0,
        longueurManche DECIMAL(6,2) DEFAULT 0,
        longueurTailleDevant DECIMAL(6,2) DEFAULT 0,
        longueurTailleDos DECIMAL(6,2) DEFAULT 0,
        tourTaille DECIMAL(6,2) DEFAULT 0,
        tourHanche DECIMAL(6,2) DEFAULT 0,
        hauteurHanches DECIMAL(6,2) DEFAULT 0,
        longueurBas DECIMAL(6,2) DEFAULT 0,
        longueurJupe DECIMAL(6,2) DEFAULT 0,
        longueurPantalon DECIMAL(6,2) DEFAULT 0,
        entrejambe DECIMAL(6,2) DEFAULT 0,
        cuisse DECIMAL(6,2) DEFAULT 0,
        tourGenou DECIMAL(6,2) DEFAULT 0,
        tourCheville DECIMAL(6,2) DEFAULT 0,
        longueurGrandBoubou DECIMAL(6,2) DEFAULT 0,
        largeurEnvergureBoubou DECIMAL(6,2) DEFAULT 0,
        customFields JSON,
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_atelier_meas (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS measurement_history (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        clientId VARCHAR(64) NOT NULL,
        profileName VARCHAR(100) DEFAULT 'Session de Mesure',
        snapshotData JSON NOT NULL,
        recordedAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_meas_history (clientId, recordedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        clientId VARCHAR(64) NOT NULL,
        orderNumber VARCHAR(50) NOT NULL,
        code VARCHAR(50),
        clientName VARCHAR(100) NOT NULL,
        clientWhatsapp VARCHAR(30) NOT NULL,
        modelName VARCHAR(150) NOT NULL DEFAULT 'Modèle sur mesure',
        modelCategory VARCHAR(100) DEFAULT 'Création',
        garmentType VARCHAR(100) DEFAULT 'Sur-mesure',
        fabricName VARCHAR(100) DEFAULT 'Bazin Riche Luxe',
        fabricColor VARCHAR(50) DEFAULT '',
        description TEXT,
        specialInstructions TEXT,
        dueDate VARCHAR(30),
        deliveryDate VARCHAR(30) NOT NULL,
        urgency ENUM('normale', 'urgente', 'tres_urgente') DEFAULT 'normale',
        totalAmount INT NOT NULL DEFAULT 0,
        depositAmount INT NOT NULL DEFAULT 0,
        paidAmount INT NOT NULL DEFAULT 0,
        remainingAmount INT NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'FCFA',
        status ENUM('commande_recue', 'mesures_prises', 'mesures_validees', 'decoupe', 'couture', 'finitions', 'essayage', 'prete', 'livree') DEFAULT 'commande_recue',
        modelImageUrl TEXT,
        notes TEXT,
        createdBy VARCHAR(64),
        createdAt VARCHAR(30),
        updatedAt VARCHAR(30),
        version INT NOT NULL DEFAULT 1,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_atelier_order (atelierId, status),
        INDEX idx_order_number (orderNumber)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id VARCHAR(64) PRIMARY KEY,
        orderId VARCHAR(64) NOT NULL,
        fromStatus VARCHAR(50),
        toStatus VARCHAR(50) NOT NULL,
        changedAt VARCHAR(30) NOT NULL,
        time VARCHAR(20),
        changedBy VARCHAR(100),
        comment TEXT,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_history (orderId, changedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS production_tasks (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        orderId VARCHAR(64) NOT NULL,
        type ENUM('CUTTING', 'SEWING', 'EMBROIDERY', 'FINISHING', 'IRONING', 'FITTING', 'PACKAGING') NOT NULL DEFAULT 'SEWING',
        taskName VARCHAR(150),
        assignedUserId VARCHAR(64),
        assignedUserName VARCHAR(100),
        status ENUM('pending', 'in_progress', 'review', 'completed', 'blocked') DEFAULT 'pending',
        startedAt VARCHAR(30),
        completedAt VARCHAR(30),
        notes TEXT,
        createdAt VARCHAR(30),
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_atelier_task (atelierId, orderId),
        INDEX idx_assigned_user (assignedUserId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fitting_sessions (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        orderId VARCHAR(64) NOT NULL,
        clientId VARCHAR(64) NOT NULL,
        scheduledAt VARCHAR(30) NOT NULL,
        status ENUM('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED') DEFAULT 'SCHEDULED',
        notes TEXT,
        adjustments TEXT,
        nextAction VARCHAR(150),
        createdAt VARCHAR(30),
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_atelier_fitting (atelierId, scheduledAt),
        INDEX idx_order_fitting (orderId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        orderId VARCHAR(64) NOT NULL,
        amount INT NOT NULL,
        currency VARCHAR(10) DEFAULT 'FCFA',
        method ENUM('CINETPAY', 'WAVE', 'ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY', 'CARD', 'CASH', 'BANK_TRANSFER') DEFAULT 'CASH',
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
        reference VARCHAR(100) UNIQUE NOT NULL,
        provider VARCHAR(50) DEFAULT 'SYSTEM',
        providerTransactionId VARCHAR(100),
        clientName VARCHAR(100),
        note TEXT,
        createdAt VARCHAR(30) NOT NULL,
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_atelier_payment (atelierId, createdAt),
        INDEX idx_order_payment (orderId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        orderId VARCHAR(64) NOT NULL,
        paymentId VARCHAR(64),
        receiptNumber VARCHAR(100) NOT NULL,
        amount INT NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'FCFA',
        issuedAt VARCHAR(30) NOT NULL,
        pdfUrl TEXT,
        status VARCHAR(30) DEFAULT 'ISSUED',
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE SET NULL,
        UNIQUE KEY idx_atelier_receipt_num (atelierId, receiptNumber),
        INDEX idx_order_receipt (orderId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        entityType VARCHAR(50) NOT NULL,
        entityId VARCHAR(64) NOT NULL,
        storageKey VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        mimeType VARCHAR(100) NOT NULL,
        size INT NOT NULL DEFAULT 0,
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_atelier_attachment (atelierId, entityType, entityId),
        INDEX idx_storage_key (storageKey)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        id VARCHAR(64) PRIMARY KEY,
        idempotencyKey VARCHAR(128) UNIQUE NOT NULL,
        atelierId VARCHAR(64),
        statusCode INT NOT NULL,
        responseBody JSON NOT NULL,
        createdAt VARCHAR(30) NOT NULL,
        INDEX idx_idem_key (idempotencyKey)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64),
        event ENUM('ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'FITTING_REMINDER', 'ORDER_READY', 'ORDER_DELIVERED', 'PAYMENT_REMINDER') NOT NULL,
        templateText TEXT NOT NULL,
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        UNIQUE KEY idx_atelier_event (atelierId, event)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        orderId VARCHAR(64),
        event ENUM('ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'FITTING_REMINDER', 'ORDER_READY', 'ORDER_DELIVERED', 'PAYMENT_REMINDER') NOT NULL DEFAULT 'ORDER_CREATED',
        channel ENUM('whatsapp', 'sms', 'email', 'push') DEFAULT 'whatsapp',
        recipient VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        sentAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
        INDEX idx_atelier_notif (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id VARCHAR(64) PRIMARY KEY,
        notificationId VARCHAR(64) NOT NULL,
        provider VARCHAR(50) DEFAULT 'WhatsApp',
        status VARCHAR(30) NOT NULL,
        responsePayload JSON,
        loggedAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE,
        INDEX idx_notif_log (notificationId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_notification_logs (
        id VARCHAR(64) PRIMARY KEY,
        orderId VARCHAR(64) NOT NULL,
        atelierId VARCHAR(64) NOT NULL,
        event VARCHAR(50) NOT NULL,
        channel VARCHAR(20) DEFAULT 'whatsapp',
        recipient VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        sentAt VARCHAR(30) NOT NULL,
        status VARCHAR(30) DEFAULT 'SENT',
        providerMessageId VARCHAR(100),
        INDEX idx_order_notif_log (orderId),
        INDEX idx_order_event (orderId, event)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS catalogue_models (
        id VARCHAR(64) PRIMARY KEY,
        atelier_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'Autre',
        price INT DEFAULT 0,
        show_price TINYINT(1) DEFAULT 1,
        currency VARCHAR(10) DEFAULT 'FCFA',
        cover_image TEXT NOT NULL,
        images JSON,
        colors JSON,
        sizes JSON,
        tags JSON,
        is_published TINYINT(1) DEFAULT 1,
        is_featured TINYINT(1) DEFAULT 0,
        display_order INT DEFAULT 0,
        views_count INT DEFAULT 0,
        whatsapp_clicks_count INT DEFAULT 0,
        created_at VARCHAR(30) NOT NULL,
        updated_at VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelier_id) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_cat_atelier (atelier_id),
        INDEX idx_cat_pub (atelier_id, is_published),
        INDEX idx_cat_slug (atelier_id, slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS catalogue_analytics (
        id VARCHAR(64) PRIMARY KEY,
        atelier_id VARCHAR(64) NOT NULL,
        model_id VARCHAR(64),
        event_type ENUM('CATALOGUE_VIEW', 'MODEL_VIEW', 'WHATSAPP_CLICK') NOT NULL,
        created_at VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelier_id) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_cat_analytics (atelier_id, event_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        atelier_id VARCHAR(64) NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        device_id VARCHAR(100),
        platform ENUM('web', 'ios', 'android') DEFAULT 'web',
        created_at VARCHAR(30) NOT NULL,
        expires_at VARCHAR(30) NOT NULL,
        revoked_at VARCHAR(30),
        last_used_at VARCHAR(30) NOT NULL,
        INDEX idx_ref_user (user_id),
        INDEX idx_ref_atelier (atelier_id),
        INDEX idx_ref_hash (token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS otp_challenges (
        id VARCHAR(64) PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        codeHash VARCHAR(255) NOT NULL,
        expiresAt VARCHAR(30) NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        consumedAt VARCHAR(30),
        purpose VARCHAR(50) DEFAULT 'AUTH',
        createdAt VARCHAR(30) NOT NULL,
        INDEX idx_phone_purpose (phone, purpose),
        INDEX idx_expires_at (expiresAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        tier ENUM('FREE', 'STARTER', 'PRO', 'VIP', 'ENTERPRISE') DEFAULT 'FREE',
        name VARCHAR(100) NOT NULL,
        priceMonthly INT NOT NULL DEFAULT 0,
        priceYearly INT NOT NULL DEFAULT 0,
        maxUsers INT NOT NULL DEFAULT 1,
        maxClients INT NOT NULL DEFAULT 50,
        maxOrders INT NOT NULL DEFAULT 100,
        storageLimitMb INT NOT NULL DEFAULT 500,
        features JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        planId VARCHAR(64) NOT NULL,
        status ENUM('active', 'trialing', 'past_due', 'canceled', 'expired') DEFAULT 'active',
        startsAt VARCHAR(30) NOT NULL,
        endsAt VARCHAR(30),
        canceledAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (planId) REFERENCES subscription_plans(id),
        INDEX idx_atelier_sub (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscription_events (
        id VARCHAR(64) PRIMARY KEY,
        subscriptionId VARCHAR(64) NOT NULL,
        eventType VARCHAR(50) NOT NULL,
        details JSON,
        eventDate VARCHAR(30) NOT NULL,
        FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE CASCADE,
        INDEX idx_sub_event (subscriptionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        entityType VARCHAR(50) NOT NULL,
        entityId VARCHAR(64) NOT NULL,
        clientPayload JSON,
        serverPayload JSON,
        resolutionStrategy VARCHAR(50) DEFAULT 'SERVER_WINS',
        resolvedAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_conflict_atelier (atelierId, entityId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price INT NOT NULL DEFAULT 0,
        description TEXT,
        imageUrl TEXT,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        INDEX idx_product_atelier (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_measurement_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        orderId VARCHAR(64) UNIQUE NOT NULL,
        atelierId VARCHAR(64) NOT NULL,
        clientId VARCHAR(64) NOT NULL,
        epaules DECIMAL(6,2) DEFAULT 0,
        poitrine DECIMAL(6,2) DEFAULT 0,
        sousPoitrine DECIMAL(6,2) DEFAULT 0,
        hauteurPoitrine DECIMAL(6,2) DEFAULT 0,
        carrureDevant DECIMAL(6,2) DEFAULT 0,
        carrureDos DECIMAL(6,2) DEFAULT 0,
        tourCou DECIMAL(6,2) DEFAULT 0,
        tourBras DECIMAL(6,2) DEFAULT 0,
        tourPoignet DECIMAL(6,2) DEFAULT 0,
        longueurManche DECIMAL(6,2) DEFAULT 0,
        longueurTailleDevant DECIMAL(6,2) DEFAULT 0,
        longueurTailleDos DECIMAL(6,2) DEFAULT 0,
        tourTaille DECIMAL(6,2) DEFAULT 0,
        tourHanche DECIMAL(6,2) DEFAULT 0,
        hauteurHanches DECIMAL(6,2) DEFAULT 0,
        longueurBas DECIMAL(6,2) DEFAULT 0,
        longueurJupe DECIMAL(6,2) DEFAULT 0,
        longueurPantalon DECIMAL(6,2) DEFAULT 0,
        entrejambe DECIMAL(6,2) DEFAULT 0,
        cuisse DECIMAL(6,2) DEFAULT 0,
        tourGenou DECIMAL(6,2) DEFAULT 0,
        tourCheville DECIMAL(6,2) DEFAULT 0,
        longueurGrandBoubou DECIMAL(6,2) DEFAULT 0,
        largeurEnvergureBoubou DECIMAL(6,2) DEFAULT 0,
        customFields JSON,
        capturedAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_snapshot_order (orderId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS saas_payments (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        subscriptionId VARCHAR(64),
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'FCFA',
        method VARCHAR(50) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
        reference VARCHAR(100) UNIQUE,
        providerTransactionId VARCHAR(100),
        createdAt VARCHAR(30) NOT NULL,
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        atelierId VARCHAR(64) NOT NULL,
        userId VARCHAR(64) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('open', 'pending', 'resolved', 'closed') DEFAULT 'open',
        createdAt VARCHAR(30) NOT NULL,
        updatedAt VARCHAR(30),
        FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ─────────────────────────────────────────────────────────────────────────
    // MIGRATION AUTOMATIQUE DU SCHÉMA DE BASE (V1 → V2)
    // ─────────────────────────────────────────────────────────────────────────
    const migrations = [
      { table: 'catalogue_models', query: 'ALTER TABLE catalogue_models ADD COLUMN code VARCHAR(50)' },
      { table: 'catalogue_models', query: 'ALTER TABLE catalogue_models ADD UNIQUE KEY idx_cat_code_unique (atelier_id, code)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN description TEXT' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN phone VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN email VARCHAR(255) UNIQUE' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN logoUrl VARCHAR(255)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN notes TEXT' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN currency VARCHAR(10) DEFAULT "FCFA"' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN measurementUnit VARCHAR(10) DEFAULT "cm"' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN enablePublicCatalogue TINYINT(1) DEFAULT 1' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN registeredAt VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN trialEndsAt VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_plan VARCHAR(50) DEFAULT "FREE"' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_status VARCHAR(50) DEFAULT "TRIAL"' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_start_date VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_end_date VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN trial_start_date VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN trial_end_date VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_created_at VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN subscription_updated_at VARCHAR(30)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN monthly_order_limit INT DEFAULT 20' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN monthly_order_count INT DEFAULT 0' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN client_limit INT DEFAULT 50' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN user_limit INT DEFAULT 1' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN storage_limit_mb INT DEFAULT 500' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN slug VARCHAR(100)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN cover_image TEXT' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN is_catalogue_enabled TINYINT(1) DEFAULT 1' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN catalogue_public_token VARCHAR(100)' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN has_used_trial TINYINT(1) DEFAULT 0' },
      { table: 'ateliers', query: 'ALTER TABLE ateliers ADD COLUMN has_had_paid_plan TINYINT(1) DEFAULT 0' },
      
      { table: 'clients', query: 'ALTER TABLE clients ADD COLUMN customerCode VARCHAR(50)' },
      { table: 'clients', query: 'ALTER TABLE clients ADD COLUMN country VARCHAR(100) DEFAULT "Côte d\'Ivoire"' },
      { table: 'clients', query: 'ALTER TABLE clients ADD COLUMN notes TEXT' },
      { table: 'clients', query: 'ALTER TABLE clients ADD COLUMN updatedAt VARCHAR(30)' },
      
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN orderNumber VARCHAR(50)' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN dueDate VARCHAR(30)' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN paidAmount INT DEFAULT 0' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT "FCFA"' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN notes TEXT' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN createdBy VARCHAR(64)' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN updatedAt VARCHAR(30)' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN version INT DEFAULT 1' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN tracking_token VARCHAR(100)' },
      { table: 'orders', query: 'ALTER TABLE orders ADD COLUMN qr_code TEXT' },
      
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN atelierId VARCHAR(64) NOT NULL DEFAULT "atl-1787175204484"' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN currency VARCHAR(10) DEFAULT "FCFA"' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN status ENUM("pending", "completed", "failed", "refunded") DEFAULT "completed"' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN reference VARCHAR(100)' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN provider VARCHAR(50) DEFAULT "SYSTEM"' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN providerTransactionId VARCHAR(100)' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN createdAt VARCHAR(30) NOT NULL DEFAULT "2026-08-01"' },
      { table: 'payments', query: 'ALTER TABLE payments ADD COLUMN updatedAt VARCHAR(30)' },

      { table: 'notifications', query: 'ALTER TABLE notifications ADD COLUMN status VARCHAR(30) DEFAULT "SENT"' },
      { table: 'notifications', query: 'ALTER TABLE notifications ADD COLUMN readAt VARCHAR(30)' }
    ];

    for (const m of migrations) {
      try {
        await conn.query(m.query);
      } catch (e: any) {
        if (e.errno !== 1060 && e.errno !== 1061) {
          console.warn(`⚠️ [Migration DB] Colonne ${m.table}: ${e.message}`);
        }
      }
    }

    // Table d'audit des abonnements
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscription_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        adminUserId VARCHAR(64) NOT NULL DEFAULT 'super-admin',
        adminUserName VARCHAR(100) NOT NULL DEFAULT 'Admin Mohamed',
        atelierId VARCHAR(64) NOT NULL,
        action VARCHAR(100) NOT NULL,
        previousPlan VARCHAR(50),
        newPlan VARCHAR(50),
        previousStatus VARCHAR(50),
        newStatus VARCHAR(50),
        reason TEXT,
        createdAt VARCHAR(30) NOT NULL,
        INDEX idx_sub_audit_atelier (atelierId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Mise à jour / Seeding des 5 formules d'abonnement officielles DigiCouture VIP
    await conn.query(`
      INSERT INTO subscription_plans (id, code, tier, name, priceMonthly, priceYearly, maxUsers, maxClients, maxOrders, storageLimitMb, features)
      VALUES 
        ('plan-free', 'FREE', 'FREE', 'Offre Découverte', 0, 0, 1, 50, 20, 500, '{"trialDays": 30}'),
        ('plan-starter', 'STARTER', 'STARTER', 'Atelier Essentiel', 2000, 20000, 1, 100, 30, 2000, '{}'),
        ('plan-pro', 'PRO', 'PRO', 'Couture Premium', 5000, 50000, 3, 500, 999999, 10000, '{"recommended": true}'),
        ('plan-atelier', 'ATELIER', 'ATELIER', 'Haute Couture', 10000, 100000, 10, 999999, 999999, 50000, '{}'),
        ('plan-business', 'BUSINESS', 'ENTERPRISE', 'Maison de Couture', 0, 0, 99, 999999, 999999, 200000, '{"customQuote": true}')
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name), priceMonthly=VALUES(priceMonthly), maxUsers=VALUES(maxUsers), 
        maxClients=VALUES(maxClients), maxOrders=VALUES(maxOrders), features=VALUES(features);
    `);
    console.log('✅ [Database Seed] 5 Formules officielles DigiCouture mises à jour (FREE, STARTER, PRO ⭐, ATELIER, BUSINESS).');

    // ─────────────────────────────────────────────────────────────────────────
    // INDEX DE PERFORMANCE — Créés en IF NOT EXISTS pour être idempotents
    // Couvre : atelierId, clientId, orderId, phone, whatsapp, orderNumber,
    //          status, createdAt, providerTransactionId
    // ─────────────────────────────────────────────────────────────────────────
    const INDEXES: Array<{ table: string; name: string; cols: string }> = [
      // clients
      { table: 'clients', name: 'idx_clients_atelier',   cols: 'atelierId' },
      { table: 'clients', name: 'idx_clients_phone',     cols: 'whatsapp' },
      // orders
      { table: 'orders', name: 'idx_orders_client',      cols: 'clientId' },
      { table: 'orders', name: 'idx_orders_status',      cols: 'atelierId, status' },
      { table: 'orders', name: 'idx_orders_created',     cols: 'atelierId, createdAt' },
      { table: 'orders', name: 'idx_orders_delivery',    cols: 'atelierId, deliveryDate' },
      // payments
      { table: 'payments', name: 'idx_pay_atelier',      cols: 'atelierId, status' },
      { table: 'payments', name: 'idx_pay_order',        cols: 'orderId' },
      { table: 'payments', name: 'idx_pay_provider_txn', cols: 'providerTransactionId' },
      { table: 'payments', name: 'idx_pay_created',      cols: 'atelierId, createdAt' },
      // audit_logs
      { table: 'audit_logs', name: 'idx_audit_atelier',  cols: 'atelierId, createdAt' },
      { table: 'audit_logs', name: 'idx_audit_action',   cols: 'action' },
      // subscriptions
      { table: 'subscriptions', name: 'idx_sub_atelier', cols: 'atelierId, status' },
    ];

    for (const idx of INDEXES) {
      try {
        await conn.query(
          `ALTER TABLE \`${idx.table}\` ADD INDEX \`${idx.name}\` (${idx.cols})`
        );
      } catch (e: any) {
        // Code 1061 = Duplicate key name → index déjà présent, on ignore silencieusement
        if (e.errno !== 1061 && e.errno !== 1060) {
          console.warn(`⚠️ [Index] ${idx.name} sur ${idx.table} : ${e.message}`);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SEEDING DE DONNÉES PLATEFORME (IDEMPOTENT)
    // ─────────────────────────────────────────────────────────────────────────
    // Seeding des plans d'abonnement s'ils sont vides
    const [plansCount]: any = await conn.query('SELECT COUNT(*) as count FROM subscription_plans');
    if (plansCount[0]?.count === 0) {
      await conn.query(`
        INSERT INTO subscription_plans (id, code, tier, name, priceMonthly, priceYearly, maxUsers, maxClients, maxOrders, storageLimitMb, features)
        VALUES 
          ('plan-free', 'FREE', 'FREE', 'Offre Découverte', 0, 0, 1, 50, 100, 500, '{}'),
          ('plan-starter', 'STARTER', 'STARTER', 'Atelier Essentiel', 15000, 150000, 3, 200, 500, 2000, '{}'),
          ('plan-pro', 'PRO', 'PRO', 'Couture Premium', 30000, 300000, 10, 1000, 3000, 10000, '{}'),
          ('plan-vip', 'VIP', 'VIP', 'Haute Couture VIP', 50000, 500000, 25, 5000, 10000, 50000, '{}'),
          ('plan-enterprise', 'ENTERPRISE', 'ENTERPRISE', 'Maison de Couture', 150000, 1500000, 99, 99999, 99999, 200000, '{}')
      `);
      console.log('✅ [Database Seed] Plans d\'abonnement insérés.');
    }

    // Associer un abonnement par défaut à chaque atelier existant
    const [ateliers]: any = await conn.query('SELECT id FROM ateliers');
    for (const atl of ateliers) {
      const [sub]: any = await conn.query('SELECT id FROM subscriptions WHERE atelierId = ?', [atl.id]);
      if (sub.length === 0) {
        await conn.query(`
          INSERT INTO subscriptions (id, atelierId, planId, status, startsAt, endsAt)
          VALUES (?, ?, 'plan-pro', 'active', '2026-08-01', '2027-08-01')
        `, [`sub-${atl.id}`, atl.id]);
      }
    }

    // Seeding des paiements SaaS s'ils sont vides
    const [saasPaymentsCount]: any = await conn.query('SELECT COUNT(*) as count FROM saas_payments');
    if (saasPaymentsCount[0]?.count === 0 && ateliers.length > 0) {
      const firstAtelierId = ateliers[0].id;
      await conn.query(`
        INSERT INTO saas_payments (id, atelierId, subscriptionId, amount, currency, method, status, reference, providerTransactionId, createdAt)
        VALUES 
          ('saas-p1', ?, 'sub-p1', 30000.00, 'FCFA', 'cinetpay', 'completed', 'REF-SAAS-1001', 'CP-TX-9011', '2026-08-05T12:00:00Z'),
          ('saas-p2', ?, 'sub-p1', 30000.00, 'FCFA', 'cinetpay', 'completed', 'REF-SAAS-1002', 'CP-TX-9012', '2026-08-10T14:30:00Z'),
          ('saas-p3', ?, 'sub-p2', 50000.00, 'FCFA', 'cinetpay', 'completed', 'REF-SAAS-1003', 'CP-TX-9013', '2026-08-15T09:15:00Z'),
          ('saas-p4', ?, 'sub-p2', 50000.00, 'FCFA', 'cinetpay', 'failed', 'REF-SAAS-1004', 'CP-TX-9014', '2026-08-20T17:45:00Z')
      `, [firstAtelierId, firstAtelierId, firstAtelierId, firstAtelierId]);
      console.log('✅ [Database Seed] Paiements SaaS d\'exemples insérés.');
    }

    // Seeding des notifications d'exemples s'il n'y en a pas
    const [notifsCount]: any = await conn.query('SELECT COUNT(*) as count FROM notifications');
    if (notifsCount[0]?.count === 0 && ateliers.length > 0) {
      const firstAtelierId = ateliers[0].id;
      await conn.query(`
        INSERT INTO notifications (id, atelierId, orderId, event, channel, recipient, message, sentAt, status)
        VALUES 
          ('notif-1', ?, 'ord-1787219145023', 'ORDER_CREATED', 'whatsapp', '+225 0574384748', 'Bonjour Bony, votre commande CMD-2026-975 a été enregistrée avec succès chez Maiga Couture VIP.', '2026-08-20T10:00:00Z', 'DELIVERED'),
          ('notif-2', ?, 'ord-1787219145023', 'PAYMENT_RECEIVED', 'whatsapp', '+225 0574384748', 'Paiement d''acompte de 25 000 FCFA reçu pour la commande CMD-2026-975.', '2026-08-20T10:05:00Z', 'DELIVERED'),
          ('notif-3', ?, 'ord-1787181312415', 'FITTING_REMINDER', 'whatsapp', '+225 070404059', 'Rappel Essayage : Chère Soro Mariam, votre séance d''essayage est prévue demain à 15h.', '2026-08-24T14:30:00Z', 'SENT'),
      `, [firstAtelierId, firstAtelierId, firstAtelierId, firstAtelierId]);
      console.log('✅ [Database Seed] Notifications d\'exemples insérées.');
    }

    // Seeding des tickets de support s'ils sont vides
    const [ticketsCount]: any = await conn.query('SELECT COUNT(*) as count FROM support_tickets');
    if (ticketsCount[0]?.count === 0 && ateliers.length > 0) {
      const firstAtelierId = ateliers[0].id;
      await conn.query(`
        INSERT INTO support_tickets (id, atelierId, userId, subject, priority, status, createdAt)
        VALUES 
          ('t-1', ?, 'user-1', 'Erreur de connexion CinetPay', 'high', 'open', '2026-08-21T08:00:00Z'),
          ('t-2', ?, 'user-1', 'Question sur l''import des mesures', 'medium', 'pending', '2026-08-20T10:30:00Z'),
          ('t-3', ?, 'user-2', 'Changement de formule vers VIP', 'low', 'resolved', '2026-08-18T14:00:00Z')
      `, [firstAtelierId, firstAtelierId, firstAtelierId]);
      console.log('✅ [Database Seed] Tickets de support d\'exemples insérés.');
    }

    console.log('✅ [Database] Synchronisation des tables effectuée.');
  } catch (err: any) {
    console.error('⚠️ [Database] Erreur de synchronisation des tables:', err.message);
  }
}

