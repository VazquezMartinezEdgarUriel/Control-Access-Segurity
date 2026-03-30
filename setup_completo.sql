-- ==========================================
-- CONTROL ACCESS SECURITY - BD COMPLETA (cas)
-- ==========================================

DROP DATABASE IF EXISTS cas;
CREATE DATABASE cas;
USE cas;

-- ==========================================
-- 1. TABLAS DE CATÁLOGOS
-- ==========================================

CREATE TABLE tipoacceso (
    id_tipo_acceso TINYINT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE tipoalerta (
    id_tipo_alerta TINYINT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NULL
);

CREATE TABLE tipousuario (
    id_tipo_usuario TINYINT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NULL
);

CREATE TABLE motivodenegacion (
    id_motivo TINYINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    aplica_peatonal BOOLEAN DEFAULT TRUE,
    aplica_vehicular BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 2. TABLAS BASE
-- ==========================================

CREATE TABLE direccion (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(100) NOT NULL,
    numero_exterior VARCHAR(10),
    numero_interior VARCHAR(10),
    colonia VARCHAR(100),
    ciudad VARCHAR(50),
    estado VARCHAR(50),
    codigo_postal VARCHAR(10),
    pais VARCHAR(50) DEFAULT 'México'
);

CREATE TABLE persona (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    id_direccion INT NULL,
    fecha_registro_persona DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_direccion) REFERENCES direccion(id_direccion)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE lector (
    id_lector SMALLINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(100),
    id_tipo_acceso TINYINT NOT NULL,
    FOREIGN KEY (id_tipo_acceso) REFERENCES tipoacceso(id_tipo_acceso)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL UNIQUE,
    id_tipo_usuario TINYINT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones_usuario TEXT NULL,
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipousuario(id_tipo_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE vigenciausuario (
    id_vigencia INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fin DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE credencial (
    id_credencial INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    uid_nfc VARCHAR(50) UNIQUE NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    observaciones_credencial TEXT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    color VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================
-- 3. TABLAS DE ACCESO
-- ==========================================

CREATE TABLE accesopeatonal (
    id_acceso_peatonal BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    id_credencial INT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('entrada', 'salida') NOT NULL,
    resultado ENUM('autorizado', 'denegado') NOT NULL,
    id_motivo_denegacion TINYINT NULL,
    id_lector SMALLINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_credencial) REFERENCES credencial(id_credencial)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_motivo_denegacion) REFERENCES motivodenegacion(id_motivo)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_lector) REFERENCES lector(id_lector)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE accesovehicular (
    id_acceso_vehicular BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    id_vehiculo INT NULL,
    id_credencial INT NULL,
    placa_leida VARCHAR(20) NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    resultado ENUM('autorizado', 'denegado') NOT NULL,
    id_motivo_denegacion TINYINT NULL,
    imagen_placa VARCHAR(255),
    id_lector SMALLINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_credencial) REFERENCES credencial(id_credencial)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_motivo_denegacion) REFERENCES motivodenegacion(id_motivo)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_lector) REFERENCES lector(id_lector)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE alerta (
    id_alerta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_alerta TINYINT NOT NULL,
    descripcion TEXT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NULL,
    id_acceso_peatonal BIGINT NULL,
    id_acceso_vehicular BIGINT NULL,
    atendida BOOLEAN DEFAULT FALSE,
    id_usuario_atencion INT NULL,
    fecha_atencion DATETIME NULL,
    FOREIGN KEY (id_tipo_alerta) REFERENCES tipoalerta(id_tipo_alerta)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_acceso_peatonal) REFERENCES accesopeatonal(id_acceso_peatonal)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_acceso_vehicular) REFERENCES accesovehicular(id_acceso_vehicular)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario_atencion) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE horarioacceso (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    dia_semana TINYINT CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME,
    hora_fin TIME,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE visitante (
    id_visitante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    empresa VARCHAR(100),
    motivo_visita VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ==========================================
-- 4. TABLA DISPOSITIVOS MÓVILES (HCE)
-- ==========================================

CREATE TABLE dispositivos_moviles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_credencial INT NULL,
    nombre_dispositivo VARCHAR(100) NOT NULL,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    imei VARCHAR(50) UNIQUE NULL,
    tipo_dispositivo ENUM('android','ios','web') NOT NULL DEFAULT 'android',
    so_version VARCHAR(50) NULL,
    metodo_autenticacion ENUM('nfc_emulation','biometrico','pin','codigo_qr') NOT NULL DEFAULT 'nfc_emulation',
    tiene_nfc TINYINT(1) DEFAULT 0,
    uid_virtual_hce VARCHAR(255) NULL,
    estado ENUM('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME NULL,
    ultima_ip VARCHAR(45) NULL,
    ubicacion_gps TEXT NULL,
    intentos_fallidos INT DEFAULT 0,
    fecha_bloqueo DATETIME NULL,
    notas TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_credencial) REFERENCES credencial(id_credencial)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ==========================================
-- 5. TABLA DE SESIONES (Laravel)
-- ==========================================

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    INDEX sessions_user_id_index (user_id),
    INDEX sessions_last_activity_index (last_activity)
);

-- ==========================================
-- 6. DATOS DE PRUEBA
-- ==========================================

-- Catálogos
INSERT INTO tipoacceso (nombre_tipo) VALUES ('peatonal'), ('vehicular');

INSERT INTO tipoalerta (nombre_tipo, descripcion) VALUES
('acceso_no_autorizado', 'Intento de acceso sin autorización'),
('discrepancia_placa', 'Placa leída no coincide con registros'),
('credencial_vencida', 'Credencial utilizada fuera de vigencia'),
('otro', 'Alerta general');

INSERT INTO tipousuario (nombre_tipo, descripcion) VALUES
('alumno', 'Estudiante inscrito'),
('docente', 'Profesor o instructor'),
('empleado', 'Personal administrativo'),
('visitante', 'Visitante temporal'),
('proveedor', 'Proveedor de servicios'),
('otro', 'Otro tipo de usuario');

INSERT INTO motivodenegacion (codigo, descripcion, aplica_peatonal, aplica_vehicular) VALUES
('FUERA_HORARIO', 'Acceso fuera de horario permitido', TRUE, TRUE),
('CREDENCIAL_VENCIDA', 'Credencial vencida', TRUE, TRUE),
('NO_AUTORIZADO', 'Usuario no autorizado para esta área', TRUE, TRUE),
('PLACA_NO_REG', 'Placa no registrada en el sistema', FALSE, TRUE),
('MANTENIMIENTO', 'Sistema en mantenimiento', TRUE, TRUE);

-- Lectores
INSERT INTO lector (nombre, ubicacion, id_tipo_acceso) VALUES
('Torniquete Principal', 'Entrada Principal - Acceso Peatonal', 1),
('Torniquete Sur', 'Acceso Sur - Salida Peatonal', 1),
('Pluma Estacionamiento A', 'Estacionamiento A - Acceso Vehicular', 2),
('Pluma Estacionamiento B', 'Estacionamiento B - Acceso Vehicular', 2);

-- Dirección de prueba
INSERT INTO direccion (calle, numero_exterior, colonia, ciudad, estado, codigo_postal) 
VALUES ('Circuito Principal', '123', 'Real Solare', 'El Marqués', 'Querétaro', '76240');

-- Persona y usuario de prueba (alumno)
INSERT INTO persona (nombre_completo, email, telefono, id_direccion) 
VALUES ('Edgar Uriel Vazquez Martinez', '124040760@upq.edu.mx', '4421234567', 1);

INSERT INTO usuario (id_persona, id_tipo_usuario, activo) 
VALUES (1, 1, TRUE);

INSERT INTO vigenciausuario (id_usuario, vigencia_inicio, vigencia_fin, activo) 
VALUES (1, '2024-01-01', '2026-12-31', TRUE);

-- Credencial NFC
INSERT INTO credencial (id_usuario, uid_nfc, activa) 
VALUES (1, '04:8F:2A:92:B4:71:80', TRUE);

-- Vehículo
INSERT INTO vehiculo (id_usuario, placa, marca, modelo, color, activo) 
VALUES (1, 'UKR-123-A', 'Chevrolet', 'Aveo', 'Blanco', TRUE);

-- Segunda dirección
INSERT INTO direccion (calle, numero_exterior, colonia, ciudad, estado, codigo_postal) 
VALUES ('Av. Paseo de las Artes', '45', 'Centro', 'Querétaro', 'Querétaro', '76000');

-- Persona y usuario docente
INSERT INTO persona (nombre_completo, email, telefono, id_direccion) 
VALUES ('Marcos Garcia Monroy', 'marcos.garcia@upq.edu.mx', '4429876543', 2);

INSERT INTO usuario (id_persona, id_tipo_usuario, activo) 
VALUES (2, 2, TRUE);

INSERT INTO vigenciausuario (id_usuario, vigencia_inicio, vigencia_fin, activo) 
VALUES (2, '2024-01-01', '2030-12-31', TRUE);

-- Credencial NFC del docente
INSERT INTO credencial (id_usuario, uid_nfc, activa) 
VALUES (2, '04:1C:5E:22:A1:33:90', TRUE);

-- Accesos peatonales de prueba
INSERT INTO accesopeatonal (id_usuario, id_credencial, tipo, resultado, id_lector)
VALUES (1, 1, 'entrada', 'autorizado', 1);

INSERT INTO accesopeatonal (id_usuario, id_credencial, tipo, resultado, id_lector)
VALUES (2, 2, 'entrada', 'autorizado', 1);

-- Horarios del usuario 1
INSERT INTO horarioacceso (id_usuario, dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, 1, '07:00:00', '09:00:00', TRUE),
(1, 2, '07:00:00', '09:00:00', TRUE),
(1, 3, '07:00:00', '09:00:00', TRUE),
(1, 4, '07:00:00', '09:00:00', TRUE),
(1, 5, '07:00:00', '09:00:00', TRUE);
