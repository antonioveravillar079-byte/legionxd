-- Nova Dark Legion Database Schema
-- Compatible with MySQL 8.0+ and MariaDB 10.3+

CREATE DATABASE IF NOT EXISTS nova_dark_legion;
USE nova_dark_legion;

-- Tabla de usuarios
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    discord_username VARCHAR(100),
    roblox_username VARCHAR(100),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    has_applied BOOLEAN NOT NULL DEFAULT FALSE,
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45),
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_admin (is_admin)
);

-- Tabla de preguntas para solicitudes
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    text TEXT NOT NULL,
    type ENUM('radio', 'checkbox') NOT NULL,
    options JSON,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    contradicts_with JSON,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_num)
);

-- Tabla de aplicaciones al clan
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    responses JSON NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(36) NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- Tabla de sorteos
CREATE TABLE raffles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    end_date TIMESTAMP NOT NULL,
    participants JSON NOT NULL DEFAULT '[]',
    winner VARCHAR(36) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_is_active (is_active),
    INDEX idx_end_date (end_date),
    INDEX idx_created_by (created_by)
);

-- Tabla de tickets de soporte
CREATE TABLE tickets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'closed') NOT NULL DEFAULT 'open',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- Tabla de respuestas a tickets
CREATE TABLE ticket_responses (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_created_at (created_at)
);

-- Insertar preguntas por defecto
INSERT INTO questions (id, text, type, options, required, contradicts_with, order_num) VALUES
('1', '¿Tienes experiencia previa en clanes de Roblox?', 'radio', 
 JSON_ARRAY('Sí, mucha experiencia', 'Algo de experiencia', 'Soy nuevo en esto'), 
 TRUE, NULL, 1),
('2', '¿Cuántas horas juegas Roblox a la semana?', 'radio', 
 JSON_ARRAY('Menos de 5 horas', '5-15 horas', 'Más de 15 horas'), 
 TRUE, NULL, 2),
('3', '¿Estás dispuesto/a a seguir las reglas del clan?', 'radio', 
 JSON_ARRAY('Sí, completamente', 'Depende de las reglas', 'No estoy seguro/a'), 
 TRUE, JSON_ARRAY('Depende de las reglas', 'No estoy seguro/a'), 3);

-- Crear usuario administrador por defecto (contraseña: admin123)
-- Nota: En producción, cambiar esta contraseña inmediatamente
INSERT INTO users (id, email, password, username, is_admin, registered_at) VALUES
('admin-001', 'admin@novalegion.pro', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AdminLegion', TRUE, NOW());