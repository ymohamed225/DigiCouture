-- 🗄️ DATABASE SCHEMA SQL POUR DIGICOUTURE (MySQL / MariaDB)

CREATE DATABASE IF NOT EXISTS digicouture_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digicouture_db;

-- 1. Table Atelier / Profil SaaS
CREATE TABLE IF NOT EXISTS ateliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logoUrl TEXT,
    coverUrl TEXT,
    ownerName VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(64) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    description TEXT,
    specialties JSON,
    openingHours VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'pro',
    currency VARCHAR(20) DEFAULT 'FCFA',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Clients VIP
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(64) PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(64) NOT NULL,
    address TEXT,
    avatarUrl TEXT,
    createdAt DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table Mensurations
CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR(64) PRIMARY KEY,
    clientId VARCHAR(64) NOT NULL,
    category ENUM('femme', 'homme', 'enfant') NOT NULL,
    epaules FLOAT,
    poitrine FLOAT,
    sousPoitrine FLOAT,
    hauteurPoitrine FLOAT,
    carrureDevant FLOAT,
    carrureDos FLOAT,
    tourCou FLOAT,
    tourBras FLOAT,
    tourPoignet FLOAT,
    longueurManche FLOAT,
    longueurTailleDevant FLOAT,
    longueurTailleDos FLOAT,
    tourTaille FLOAT,
    tourHanche FLOAT,
    hauteurHanches FLOAT,
    longueurBas FLOAT,
    longueurJupe FLOAT,
    longueurPantalon FLOAT,
    entrejambe FLOAT,
    cuisse FLOAT,
    tourGenou FLOAT,
    tourCheville FLOAT,
    longueurGrandBoubou FLOAT,
    largeurEnvergureBoubou FLOAT,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table Commandes Haute Couture
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    clientName VARCHAR(255) NOT NULL,
    clientWhatsapp VARCHAR(64) NOT NULL,
    modelName VARCHAR(255) NOT NULL,
    fabricDetails TEXT,
    specialInstructions TEXT,
    deliveryDate DATE NOT NULL,
    urgency ENUM('normale', 'urgente', 'tres_urgente') DEFAULT 'normale',
    totalAmount INT NOT NULL,
    depositAmount INT NOT NULL,
    remainingAmount INT NOT NULL,
    status ENUM('commande_recue', 'mesures_prises', 'decoupe', 'couture', 'finitions', 'essayage', 'prete', 'livree') DEFAULT 'commande_recue',
    createdAt DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table Encaissements / Paiements
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    orderId VARCHAR(64) NOT NULL,
    clientName VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table Catalogue
CREATE TABLE IF NOT EXISTS catalogue (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    imageUrl TEXT NOT NULL,
    description TEXT,
    estimatedPrice VARCHAR(100),
    estimatedLeadTime VARCHAR(100),
    tags JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
