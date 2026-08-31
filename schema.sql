-- Schema de Base de Données Unifié DigiCouture VIP (MySQL 8.0+)
-- Source Unique de Vérité pour Web App, Mobile App & Super-Admin Console

CREATE DATABASE IF NOT EXISTS digicouture_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digicouture_db;

-- 1. Table des Ateliers (Tenants Multi-Ateliers)
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

-- 2. Table des Utilisateurs & Authentification JWT
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  passwordHash VARCHAR(255),
  role ENUM('superadmin', 'owner', 'tailor', 'receptionist') DEFAULT 'owner',
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  INDEX idx_atelier_user (atelierId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table des Clients (Multi-Tenant)
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  address VARCHAR(255),
  avatarUrl TEXT,
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  INDEX idx_atelier_client (atelierId, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table des Mensurations Sur-Mesure (20+ Points de Mesures)
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
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table des Commandes & Workflow 8 Étapes
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  code VARCHAR(50) NOT NULL,
  clientId VARCHAR(64) NOT NULL,
  clientName VARCHAR(100) NOT NULL,
  clientWhatsapp VARCHAR(30) NOT NULL,
  modelName VARCHAR(150) NOT NULL,
  modelCategory VARCHAR(100) DEFAULT 'Création',
  garmentType VARCHAR(100) DEFAULT 'Sur-mesure',
  fabricName VARCHAR(100) DEFAULT 'Bazin Riche Luxe',
  fabricColor VARCHAR(50) DEFAULT '',
  description TEXT,
  specialInstructions TEXT,
  deliveryDate VARCHAR(30) NOT NULL,
  urgency ENUM('normale', 'urgente', 'tres_urgente') DEFAULT 'normale',
  totalAmount INT NOT NULL DEFAULT 0,
  depositAmount INT NOT NULL DEFAULT 0,
  remainingAmount INT NOT NULL DEFAULT 0,
  status ENUM('commande_recue', 'mesures_prises', 'mesures_validees', 'decoupe', 'couture', 'finitions', 'essayage', 'prete', 'livree') DEFAULT 'commande_recue',
  modelImageUrl TEXT,
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_atelier_order (atelierId, status),
  INDEX idx_order_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table des Paiements & Caisse
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  orderId VARCHAR(64) NOT NULL,
  clientName VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  method VARCHAR(50) DEFAULT 'Especes',
  date VARCHAR(30) NOT NULL,
  note TEXT,
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_atelier_payment (atelierId, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table du Catalogue de Modèles
CREATE TABLE IF NOT EXISTS catalogue (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(100) DEFAULT 'Robes',
  imageUrl TEXT NOT NULL,
  description TEXT,
  estimatedPrice VARCHAR(50) DEFAULT 'Sur devis',
  estimatedLeadTime VARCHAR(50) DEFAULT '3-5 jours',
  tags JSON,
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  INDEX idx_atelier_catalogue (atelierId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table des Journaux d'Audit & Sécurité
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  atelierId VARCHAR(64) NOT NULL,
  userId VARCHAR(64),
  action VARCHAR(100) NOT NULL,
  details JSON,
  ipAddress VARCHAR(45),
  createdAt VARCHAR(30),
  FOREIGN KEY (atelierId) REFERENCES ateliers(id) ON DELETE CASCADE,
  INDEX idx_atelier_audit (atelierId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
