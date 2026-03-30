-- ============================================================
-- DATOS DE PRUEBA - Control Access Security
-- Base de datos: cas
-- Fecha: 2026-03-28
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes
TRUNCATE TABLE accesopeatonal;
TRUNCATE TABLE accesovehicular;
TRUNCATE TABLE alerta;
TRUNCATE TABLE horarioacceso;
TRUNCATE TABLE credencial;
TRUNCATE TABLE vehiculo;
TRUNCATE TABLE vigenciausuario;
TRUNCATE TABLE visitante;
DELETE FROM usuario;
DELETE FROM persona;

SET FOREIGN_KEY_CHECKS = 1;

-- Resetear auto_increment
ALTER TABLE persona AUTO_INCREMENT = 1;
ALTER TABLE usuario AUTO_INCREMENT = 1;
ALTER TABLE credencial AUTO_INCREMENT = 1;
ALTER TABLE vehiculo AUTO_INCREMENT = 1;
ALTER TABLE horarioacceso AUTO_INCREMENT = 1;
ALTER TABLE vigenciausuario AUTO_INCREMENT = 1;
ALTER TABLE visitante AUTO_INCREMENT = 1;
ALTER TABLE accesopeatonal AUTO_INCREMENT = 1;
ALTER TABLE accesovehicular AUTO_INCREMENT = 1;
ALTER TABLE alerta AUTO_INCREMENT = 1;

-- ============================================================
-- 1. LECTORES NFC (necesarios para registrar accesos)
-- ============================================================
INSERT INTO lector (id_lector, nombre, ubicacion, id_tipo_acceso) VALUES
(1, 'Lector Entrada Principal', 'Puerta Principal - Edificio A', 1),
(2, 'Lector Salida Principal', 'Puerta Principal - Edificio A', 1),
(3, 'Lector Entrada Estacionamiento', 'Caseta Estacionamiento Norte', 2),
(4, 'Lector Salida Estacionamiento', 'Caseta Estacionamiento Norte', 2),
(5, 'Lector Laboratorio', 'Laboratorio de Cómputo - Edificio B', 1),
(6, 'Lector Biblioteca', 'Entrada Biblioteca Central', 1);

-- ============================================================
-- 2. PERSONAS (31 personas de la lista)
-- ============================================================
INSERT INTO persona (nombre_completo, email, telefono) VALUES
('Acosta Lopez Emiliano', 'emiliano.acosta@correo.edu.mx', '5510000001'),
('Amado Martinez Fernando', 'fernando.amado@correo.edu.mx', '5510000002'),
('Arroyo Montes Ricardo Antonio', 'ricardo.arroyo@correo.edu.mx', '5510000003'),
('Bautista Botello Iker Emiliano', 'iker.bautista@correo.edu.mx', '5510000004'),
('Calderon Guzman Gael', 'gael.calderon@correo.edu.mx', '5510000005'),
('Castro Reyes Maria Isabel', 'maria.castro@correo.edu.mx', '5510000006'),
('Chavez Perez Sebastian', 'sebastian.chavez@correo.edu.mx', '5510000007'),
('Cruz Diaz Rodrigo Abed', 'rodrigo.cruz@correo.edu.mx', '5510000008'),
('Estrada Olguin Miguel Ivan', 'miguel.estrada@correo.edu.mx', '5510000009'),
('Garcia Fragoso Bernardo', 'bernardo.garcia@correo.edu.mx', '5510000010'),
('Garcia Reyes Juan Jesus', 'juan.garcia@correo.edu.mx', '5510000011'),
('Guerrero Aguilar Francisco Javier', 'francisco.guerrero@correo.edu.mx', '5510000012'),
('Hernandez De Rueda Kevin Fernando', 'kevin.hernandez@correo.edu.mx', '5510000013'),
('Hernandez Hernandez Jonathan Fermin', 'jonathan.hernandez@correo.edu.mx', '5510000014'),
('Irineo Atanacio Diego', 'diego.irineo@correo.edu.mx', '5510000015'),
('Lara Perez Sohe Montserrat', 'sohe.lara@correo.edu.mx', '5510000016'),
('Llaca Martinez Uriel', 'uriel.llaca@correo.edu.mx', '5510000017'),
('Lozano Rangel Karol Ivan', 'karol.lozano@correo.edu.mx', '5510000018'),
('Marquez Sanchez Rouse Adaletze', 'rouse.marquez@correo.edu.mx', '5510000019'),
('Martinez Ramirez Gabriel Buenaventura', 'gabriel.martinez@correo.edu.mx', '5510000020'),
('Moctezuma Barco Angel Josafat', 'angel.moctezuma@correo.edu.mx', '5510000021'),
('Nabor Ramirez Mariana', 'mariana.nabor@correo.edu.mx', '5510000022'),
('Orozco Arias Cynthia Elizabeth', 'cynthia.orozco@correo.edu.mx', '5510000023'),
('Perez Mellado Jennyfer', 'jennyfer.perez@correo.edu.mx', '5510000024'),
('Ramos Gomez Daniel Ricardo', 'daniel.ramos@correo.edu.mx', '5510000025'),
('Rivera Ramirez Luis Osvaldo', 'luis.rivera@correo.edu.mx', '5510000026'),
('Rodriguez Sanchez Octavio Sebastian', 'octavio.rodriguez@correo.edu.mx', '5510000027'),
('Sainos Martinez Daniel Adrian', 'daniel.sainos@correo.edu.mx', '5510000028'),
('Valdelamar Martinez Leonardo', 'leonardo.valdelamar@correo.edu.mx', '5510000029'),
('Vazquez Martinez Edgar Uriel', 'edgar.vazquez@correo.edu.mx', '5510000030'),
('Vizcaino Hernandez Diego Ivan', 'diego.vizcaino@correo.edu.mx', '5510000031');

-- Personas adicionales (docentes y empleados)
INSERT INTO persona (nombre_completo, email, telefono) VALUES
('Prof. Roberto Sanchez Luna', 'roberto.sanchez@correo.edu.mx', '5520000001'),
('Prof. Ana Maria Gonzalez Torres', 'ana.gonzalez@correo.edu.mx', '5520000002'),
('Ing. Carlos Mendoza Rios', 'carlos.mendoza@correo.edu.mx', '5520000003'),
('Lic. Patricia Flores Vega', 'patricia.flores@correo.edu.mx', '5520000004');

-- ============================================================
-- 3. USUARIOS (31 alumnos + 2 docentes + 2 empleados)
-- ============================================================
-- Alumnos (tipo 1)
INSERT INTO usuario (id_persona, id_tipo_usuario, activo, observaciones_usuario) VALUES
(1, 1, 1, NULL),
(2, 1, 1, NULL),
(3, 1, 1, NULL),
(4, 1, 1, NULL),
(5, 1, 1, NULL),
(6, 1, 1, NULL),
(7, 1, 1, NULL),
(8, 1, 1, NULL),
(9, 1, 1, NULL),
(10, 1, 1, NULL),
(11, 1, 1, NULL),
(12, 1, 1, NULL),
(13, 1, 1, NULL),
(14, 1, 1, NULL),
(15, 1, 1, NULL),
(16, 1, 1, NULL),
(17, 1, 1, NULL),
(18, 1, 1, NULL),
(19, 1, 1, NULL),
(20, 1, 1, NULL),
(21, 1, 1, NULL),
(22, 1, 1, NULL),
(23, 1, 1, NULL),
(24, 1, 1, NULL),
(25, 1, 1, NULL),
(26, 1, 1, NULL),
(27, 1, 1, NULL),
(28, 1, 1, NULL),
(29, 1, 1, NULL),
(30, 1, 1, NULL),
(31, 1, 1, NULL);

-- Docentes (tipo 2)
INSERT INTO usuario (id_persona, id_tipo_usuario, activo, observaciones_usuario) VALUES
(32, 2, 1, 'Docente titular - Ingeniería en Sistemas'),
(33, 2, 1, 'Docente titular - Matemáticas');

-- Empleados (tipo 3)
INSERT INTO usuario (id_persona, id_tipo_usuario, activo, observaciones_usuario) VALUES
(34, 3, 1, 'Administrador de sistemas'),
(35, 3, 1, 'Coordinación académica');

-- ============================================================
-- 4. VIGENCIAS (semestre actual para todos los alumnos)
-- ============================================================
INSERT INTO vigenciausuario (id_usuario, vigencia_inicio, vigencia_fin, activo) VALUES
(1, '2026-01-15', '2026-07-15', 1),
(2, '2026-01-15', '2026-07-15', 1),
(3, '2026-01-15', '2026-07-15', 1),
(4, '2026-01-15', '2026-07-15', 1),
(5, '2026-01-15', '2026-07-15', 1),
(6, '2026-01-15', '2026-07-15', 1),
(7, '2026-01-15', '2026-07-15', 1),
(8, '2026-01-15', '2026-07-15', 1),
(9, '2026-01-15', '2026-07-15', 1),
(10, '2026-01-15', '2026-07-15', 1),
(11, '2026-01-15', '2026-07-15', 1),
(12, '2026-01-15', '2026-07-15', 1),
(13, '2026-01-15', '2026-07-15', 1),
(14, '2026-01-15', '2026-07-15', 1),
(15, '2026-01-15', '2026-07-15', 1),
(16, '2026-01-15', '2026-07-15', 1),
(17, '2026-01-15', '2026-07-15', 1),
(18, '2026-01-15', '2026-07-15', 1),
(19, '2026-01-15', '2026-07-15', 1),
(20, '2026-01-15', '2026-07-15', 1),
(21, '2026-01-15', '2026-07-15', 1),
(22, '2026-01-15', '2026-07-15', 1),
(23, '2026-01-15', '2026-07-15', 1),
(24, '2026-01-15', '2026-07-15', 1),
(25, '2026-01-15', '2026-07-15', 1),
(26, '2026-01-15', '2026-07-15', 1),
(27, '2026-01-15', '2026-07-15', 1),
(28, '2026-01-15', '2026-07-15', 1),
(29, '2026-01-15', '2026-07-15', 1),
(30, '2026-01-15', '2026-07-15', 1),
(31, '2026-01-15', '2026-07-15', 1);

-- Docentes y empleados: vigencia anual
INSERT INTO vigenciausuario (id_usuario, vigencia_inicio, vigencia_fin, activo) VALUES
(32, '2026-01-01', '2026-12-31', 1),
(33, '2026-01-01', '2026-12-31', 1),
(34, '2026-01-01', '2026-12-31', 1),
(35, '2026-01-01', '2026-12-31', 1);

-- ============================================================
-- 5. CREDENCIALES NFC (una por usuario)
-- ============================================================
INSERT INTO credencial (id_usuario, uid_nfc, fecha_asignacion, activa, observaciones_credencial) VALUES
(1, 'A1:B2:C3:D4:E5:01', '2026-01-20 09:00:00', 1, NULL),
(2, 'A1:B2:C3:D4:E5:02', '2026-01-20 09:05:00', 1, NULL),
(3, 'A1:B2:C3:D4:E5:03', '2026-01-20 09:10:00', 1, NULL),
(4, 'A1:B2:C3:D4:E5:04', '2026-01-20 09:15:00', 1, NULL),
(5, 'A1:B2:C3:D4:E5:05', '2026-01-20 09:20:00', 1, NULL),
(6, 'A1:B2:C3:D4:E5:06', '2026-01-20 09:25:00', 1, NULL),
(7, 'A1:B2:C3:D4:E5:07', '2026-01-20 09:30:00', 1, NULL),
(8, 'A1:B2:C3:D4:E5:08', '2026-01-20 09:35:00', 1, NULL),
(9, 'A1:B2:C3:D4:E5:09', '2026-01-20 09:40:00', 1, NULL),
(10, 'A1:B2:C3:D4:E5:0A', '2026-01-20 09:45:00', 1, NULL),
(11, 'A1:B2:C3:D4:E5:0B', '2026-01-20 09:50:00', 1, NULL),
(12, 'A1:B2:C3:D4:E5:0C', '2026-01-20 09:55:00', 1, NULL),
(13, 'A1:B2:C3:D4:E5:0D', '2026-01-20 10:00:00', 1, NULL),
(14, 'A1:B2:C3:D4:E5:0E', '2026-01-20 10:05:00', 1, NULL),
(15, 'A1:B2:C3:D4:E5:0F', '2026-01-20 10:10:00', 1, NULL),
(16, 'A1:B2:C3:D4:E5:10', '2026-01-20 10:15:00', 1, NULL),
(17, 'A1:B2:C3:D4:E5:11', '2026-01-20 10:20:00', 1, NULL),
(18, 'A1:B2:C3:D4:E5:12', '2026-01-20 10:25:00', 1, NULL),
(19, 'A1:B2:C3:D4:E5:13', '2026-01-20 10:30:00', 1, NULL),
(20, 'A1:B2:C3:D4:E5:14', '2026-01-20 10:35:00', 1, NULL),
(21, 'A1:B2:C3:D4:E5:15', '2026-01-20 10:40:00', 1, NULL),
(22, 'A1:B2:C3:D4:E5:16', '2026-01-20 10:45:00', 1, NULL),
(23, 'A1:B2:C3:D4:E5:17', '2026-01-20 10:50:00', 1, NULL),
(24, 'A1:B2:C3:D4:E5:18', '2026-01-20 10:55:00', 1, NULL),
(25, 'A1:B2:C3:D4:E5:19', '2026-01-20 11:00:00', 1, NULL),
(26, 'A1:B2:C3:D4:E5:1A', '2026-01-20 11:05:00', 1, NULL),
(27, 'A1:B2:C3:D4:E5:1B', '2026-01-20 11:10:00', 1, NULL),
(28, 'A1:B2:C3:D4:E5:1C', '2026-01-20 11:15:00', 1, NULL),
(29, 'A1:B2:C3:D4:E5:1D', '2026-01-20 11:20:00', 1, NULL),
(30, 'A1:B2:C3:D4:E5:1E', '2026-01-20 11:25:00', 1, NULL),
(31, 'A1:B2:C3:D4:E5:1F', '2026-01-20 11:30:00', 1, NULL);

-- Credenciales docentes y empleados
INSERT INTO credencial (id_usuario, uid_nfc, fecha_asignacion, activa, observaciones_credencial) VALUES
(32, 'D0:CE:NT:E1:00:01', '2026-01-15 08:00:00', 1, 'Docente - acceso prioritario'),
(33, 'D0:CE:NT:E2:00:02', '2026-01-15 08:05:00', 1, 'Docente - acceso prioritario'),
(34, 'EM:PL:EA:D1:00:01', '2026-01-10 08:00:00', 1, 'Empleado admin - acceso total'),
(35, 'EM:PL:EA:D2:00:02', '2026-01-10 08:05:00', 1, 'Empleado coordinación');

-- ============================================================
-- 6. VEHICULOS (algunos usuarios con vehículo)
-- ============================================================
INSERT INTO vehiculo (id_usuario, placa, marca, modelo, color, activo) VALUES
(3, 'ABC-123-A', 'Nissan', 'Versa 2022', 'Blanco', 1),
(9, 'DEF-456-B', 'Volkswagen', 'Jetta 2021', 'Gris', 1),
(12, 'GHI-789-C', 'Chevrolet', 'Aveo 2020', 'Rojo', 1),
(17, 'JKL-012-D', 'Toyota', 'Corolla 2023', 'Negro', 1),
(20, 'MNO-345-E', 'Honda', 'Civic 2022', 'Azul', 1),
(25, 'PQR-678-F', 'Mazda', '3 2021', 'Plata', 1),
(30, 'STU-901-G', 'Ford', 'Focus 2020', 'Blanco', 1),
(32, 'DOC-001-A', 'Honda', 'CR-V 2023', 'Negro', 1),
(33, 'DOC-002-B', 'Toyota', 'RAV4 2022', 'Gris', 1),
(34, 'EMP-001-A', 'Nissan', 'Kicks 2024', 'Rojo', 1);

-- ============================================================
-- 7. HORARIOS DE ACCESO (Lunes a Viernes para alumnos)
-- ============================================================
-- Horario matutino para todos los alumnos (Lun-Vie 7:00-15:00)
INSERT INTO horarioacceso (id_usuario, dia_semana, hora_inicio, hora_fin, activo) VALUES
-- Todos los alumnos: Lunes a Viernes
(1, 1, '07:00:00', '15:00:00', 1), (1, 2, '07:00:00', '15:00:00', 1), (1, 3, '07:00:00', '15:00:00', 1), (1, 4, '07:00:00', '15:00:00', 1), (1, 5, '07:00:00', '15:00:00', 1),
(2, 1, '07:00:00', '15:00:00', 1), (2, 2, '07:00:00', '15:00:00', 1), (2, 3, '07:00:00', '15:00:00', 1), (2, 4, '07:00:00', '15:00:00', 1), (2, 5, '07:00:00', '15:00:00', 1),
(3, 1, '07:00:00', '15:00:00', 1), (3, 2, '07:00:00', '15:00:00', 1), (3, 3, '07:00:00', '15:00:00', 1), (3, 4, '07:00:00', '15:00:00', 1), (3, 5, '07:00:00', '15:00:00', 1),
(4, 1, '07:00:00', '15:00:00', 1), (4, 2, '07:00:00', '15:00:00', 1), (4, 3, '07:00:00', '15:00:00', 1), (4, 4, '07:00:00', '15:00:00', 1), (4, 5, '07:00:00', '15:00:00', 1),
(5, 1, '07:00:00', '15:00:00', 1), (5, 2, '07:00:00', '15:00:00', 1), (5, 3, '07:00:00', '15:00:00', 1), (5, 4, '07:00:00', '15:00:00', 1), (5, 5, '07:00:00', '15:00:00', 1),
(6, 1, '07:00:00', '15:00:00', 1), (6, 2, '07:00:00', '15:00:00', 1), (6, 3, '07:00:00', '15:00:00', 1), (6, 4, '07:00:00', '15:00:00', 1), (6, 5, '07:00:00', '15:00:00', 1),
(7, 1, '07:00:00', '15:00:00', 1), (7, 2, '07:00:00', '15:00:00', 1), (7, 3, '07:00:00', '15:00:00', 1), (7, 4, '07:00:00', '15:00:00', 1), (7, 5, '07:00:00', '15:00:00', 1),
(8, 1, '07:00:00', '15:00:00', 1), (8, 2, '07:00:00', '15:00:00', 1), (8, 3, '07:00:00', '15:00:00', 1), (8, 4, '07:00:00', '15:00:00', 1), (8, 5, '07:00:00', '15:00:00', 1),
(9, 1, '07:00:00', '15:00:00', 1), (9, 2, '07:00:00', '15:00:00', 1), (9, 3, '07:00:00', '15:00:00', 1), (9, 4, '07:00:00', '15:00:00', 1), (9, 5, '07:00:00', '15:00:00', 1),
(10, 1, '07:00:00', '15:00:00', 1), (10, 2, '07:00:00', '15:00:00', 1), (10, 3, '07:00:00', '15:00:00', 1), (10, 4, '07:00:00', '15:00:00', 1), (10, 5, '07:00:00', '15:00:00', 1),
(11, 1, '07:00:00', '15:00:00', 1), (11, 2, '07:00:00', '15:00:00', 1), (11, 3, '07:00:00', '15:00:00', 1), (11, 4, '07:00:00', '15:00:00', 1), (11, 5, '07:00:00', '15:00:00', 1),
(12, 1, '07:00:00', '15:00:00', 1), (12, 2, '07:00:00', '15:00:00', 1), (12, 3, '07:00:00', '15:00:00', 1), (12, 4, '07:00:00', '15:00:00', 1), (12, 5, '07:00:00', '15:00:00', 1),
(13, 1, '07:00:00', '15:00:00', 1), (13, 2, '07:00:00', '15:00:00', 1), (13, 3, '07:00:00', '15:00:00', 1), (13, 4, '07:00:00', '15:00:00', 1), (13, 5, '07:00:00', '15:00:00', 1),
(14, 1, '07:00:00', '15:00:00', 1), (14, 2, '07:00:00', '15:00:00', 1), (14, 3, '07:00:00', '15:00:00', 1), (14, 4, '07:00:00', '15:00:00', 1), (14, 5, '07:00:00', '15:00:00', 1),
(15, 1, '07:00:00', '15:00:00', 1), (15, 2, '07:00:00', '15:00:00', 1), (15, 3, '07:00:00', '15:00:00', 1), (15, 4, '07:00:00', '15:00:00', 1), (15, 5, '07:00:00', '15:00:00', 1),
(16, 1, '07:00:00', '15:00:00', 1), (16, 2, '07:00:00', '15:00:00', 1), (16, 3, '07:00:00', '15:00:00', 1), (16, 4, '07:00:00', '15:00:00', 1), (16, 5, '07:00:00', '15:00:00', 1),
(17, 1, '07:00:00', '15:00:00', 1), (17, 2, '07:00:00', '15:00:00', 1), (17, 3, '07:00:00', '15:00:00', 1), (17, 4, '07:00:00', '15:00:00', 1), (17, 5, '07:00:00', '15:00:00', 1),
(18, 1, '07:00:00', '15:00:00', 1), (18, 2, '07:00:00', '15:00:00', 1), (18, 3, '07:00:00', '15:00:00', 1), (18, 4, '07:00:00', '15:00:00', 1), (18, 5, '07:00:00', '15:00:00', 1),
(19, 1, '07:00:00', '15:00:00', 1), (19, 2, '07:00:00', '15:00:00', 1), (19, 3, '07:00:00', '15:00:00', 1), (19, 4, '07:00:00', '15:00:00', 1), (19, 5, '07:00:00', '15:00:00', 1),
(20, 1, '07:00:00', '15:00:00', 1), (20, 2, '07:00:00', '15:00:00', 1), (20, 3, '07:00:00', '15:00:00', 1), (20, 4, '07:00:00', '15:00:00', 1), (20, 5, '07:00:00', '15:00:00', 1),
(21, 1, '07:00:00', '15:00:00', 1), (21, 2, '07:00:00', '15:00:00', 1), (21, 3, '07:00:00', '15:00:00', 1), (21, 4, '07:00:00', '15:00:00', 1), (21, 5, '07:00:00', '15:00:00', 1),
(22, 1, '07:00:00', '15:00:00', 1), (22, 2, '07:00:00', '15:00:00', 1), (22, 3, '07:00:00', '15:00:00', 1), (22, 4, '07:00:00', '15:00:00', 1), (22, 5, '07:00:00', '15:00:00', 1),
(23, 1, '07:00:00', '15:00:00', 1), (23, 2, '07:00:00', '15:00:00', 1), (23, 3, '07:00:00', '15:00:00', 1), (23, 4, '07:00:00', '15:00:00', 1), (23, 5, '07:00:00', '15:00:00', 1),
(24, 1, '07:00:00', '15:00:00', 1), (24, 2, '07:00:00', '15:00:00', 1), (24, 3, '07:00:00', '15:00:00', 1), (24, 4, '07:00:00', '15:00:00', 1), (24, 5, '07:00:00', '15:00:00', 1),
(25, 1, '07:00:00', '15:00:00', 1), (25, 2, '07:00:00', '15:00:00', 1), (25, 3, '07:00:00', '15:00:00', 1), (25, 4, '07:00:00', '15:00:00', 1), (25, 5, '07:00:00', '15:00:00', 1),
(26, 1, '07:00:00', '15:00:00', 1), (26, 2, '07:00:00', '15:00:00', 1), (26, 3, '07:00:00', '15:00:00', 1), (26, 4, '07:00:00', '15:00:00', 1), (26, 5, '07:00:00', '15:00:00', 1),
(27, 1, '07:00:00', '15:00:00', 1), (27, 2, '07:00:00', '15:00:00', 1), (27, 3, '07:00:00', '15:00:00', 1), (27, 4, '07:00:00', '15:00:00', 1), (27, 5, '07:00:00', '15:00:00', 1),
(28, 1, '07:00:00', '15:00:00', 1), (28, 2, '07:00:00', '15:00:00', 1), (28, 3, '07:00:00', '15:00:00', 1), (28, 4, '07:00:00', '15:00:00', 1), (28, 5, '07:00:00', '15:00:00', 1),
(29, 1, '07:00:00', '15:00:00', 1), (29, 2, '07:00:00', '15:00:00', 1), (29, 3, '07:00:00', '15:00:00', 1), (29, 4, '07:00:00', '15:00:00', 1), (29, 5, '07:00:00', '15:00:00', 1),
(30, 1, '07:00:00', '15:00:00', 1), (30, 2, '07:00:00', '15:00:00', 1), (30, 3, '07:00:00', '15:00:00', 1), (30, 4, '07:00:00', '15:00:00', 1), (30, 5, '07:00:00', '15:00:00', 1),
(31, 1, '07:00:00', '15:00:00', 1), (31, 2, '07:00:00', '15:00:00', 1), (31, 3, '07:00:00', '15:00:00', 1), (31, 4, '07:00:00', '15:00:00', 1), (31, 5, '07:00:00', '15:00:00', 1);

-- Docentes: Lunes a Sábado 6:00-20:00
INSERT INTO horarioacceso (id_usuario, dia_semana, hora_inicio, hora_fin, activo) VALUES
(32, 1, '06:00:00', '20:00:00', 1), (32, 2, '06:00:00', '20:00:00', 1), (32, 3, '06:00:00', '20:00:00', 1), (32, 4, '06:00:00', '20:00:00', 1), (32, 5, '06:00:00', '20:00:00', 1), (32, 6, '06:00:00', '14:00:00', 1),
(33, 1, '06:00:00', '20:00:00', 1), (33, 2, '06:00:00', '20:00:00', 1), (33, 3, '06:00:00', '20:00:00', 1), (33, 4, '06:00:00', '20:00:00', 1), (33, 5, '06:00:00', '20:00:00', 1), (33, 6, '06:00:00', '14:00:00', 1);

-- Empleados: Lunes a Viernes 8:00-18:00
INSERT INTO horarioacceso (id_usuario, dia_semana, hora_inicio, hora_fin, activo) VALUES
(34, 1, '08:00:00', '18:00:00', 1), (34, 2, '08:00:00', '18:00:00', 1), (34, 3, '08:00:00', '18:00:00', 1), (34, 4, '08:00:00', '18:00:00', 1), (34, 5, '08:00:00', '18:00:00', 1),
(35, 1, '08:00:00', '18:00:00', 1), (35, 2, '08:00:00', '18:00:00', 1), (35, 3, '08:00:00', '18:00:00', 1), (35, 4, '08:00:00', '18:00:00', 1), (35, 5, '08:00:00', '18:00:00', 1);

-- ============================================================
-- 8. ACCESOS PEATONALES (simulación de hoy 28 marzo 2026)
-- ============================================================
-- Entradas por la mañana
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(1, 1, '2026-03-28 07:02:15', 'entrada', 'autorizado', 1),
(2, 2, '2026-03-28 07:05:30', 'entrada', 'autorizado', 1),
(3, 3, '2026-03-28 07:08:45', 'entrada', 'autorizado', 1),
(4, 4, '2026-03-28 07:10:12', 'entrada', 'autorizado', 1),
(5, 5, '2026-03-28 07:12:33', 'entrada', 'autorizado', 1),
(6, 6, '2026-03-28 07:15:20', 'entrada', 'autorizado', 1),
(7, 7, '2026-03-28 07:18:05', 'entrada', 'autorizado', 1),
(8, 8, '2026-03-28 07:20:50', 'entrada', 'autorizado', 1),
(9, 9, '2026-03-28 07:22:15', 'entrada', 'autorizado', 1),
(10, 10, '2026-03-28 07:25:40', 'entrada', 'autorizado', 1),
(11, 11, '2026-03-28 07:28:55', 'entrada', 'autorizado', 1),
(12, 12, '2026-03-28 07:30:30', 'entrada', 'autorizado', 1),
(13, 13, '2026-03-28 07:33:10', 'entrada', 'autorizado', 1),
(14, 14, '2026-03-28 07:35:45', 'entrada', 'autorizado', 1),
(15, 15, '2026-03-28 07:38:20', 'entrada', 'autorizado', 1),
(16, 16, '2026-03-28 07:40:15', 'entrada', 'autorizado', 1),
(17, 17, '2026-03-28 07:42:33', 'entrada', 'autorizado', 1),
(18, 18, '2026-03-28 07:45:10', 'entrada', 'autorizado', 1),
(19, 19, '2026-03-28 07:48:25', 'entrada', 'autorizado', 1),
(20, 20, '2026-03-28 07:50:40', 'entrada', 'autorizado', 1),
(21, 21, '2026-03-28 07:53:15', 'entrada', 'autorizado', 1),
(22, 22, '2026-03-28 07:55:30', 'entrada', 'autorizado', 1),
(23, 23, '2026-03-28 07:58:45', 'entrada', 'autorizado', 1),
(24, 24, '2026-03-28 08:01:10', 'entrada', 'autorizado', 1),
(25, 25, '2026-03-28 08:05:20', 'entrada', 'autorizado', 1),
(26, 26, '2026-03-28 08:08:30', 'entrada', 'autorizado', 1),
(27, 27, '2026-03-28 08:10:45', 'entrada', 'autorizado', 1),
(28, 28, '2026-03-28 08:12:15', 'entrada', 'autorizado', 1),
(29, 29, '2026-03-28 08:15:40', 'entrada', 'autorizado', 1),
(30, 30, '2026-03-28 08:18:55', 'entrada', 'autorizado', 1),
(31, 31, '2026-03-28 08:22:10', 'entrada', 'autorizado', 1);

-- Docentes y empleados
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(32, 32, '2026-03-28 06:45:00', 'entrada', 'autorizado', 1),
(33, 33, '2026-03-28 06:50:15', 'entrada', 'autorizado', 1),
(34, 34, '2026-03-28 07:55:30', 'entrada', 'autorizado', 1),
(35, 35, '2026-03-28 08:00:00', 'entrada', 'autorizado', 1);

-- Algunos accesos al laboratorio
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(1, 1, '2026-03-28 09:00:00', 'entrada', 'autorizado', 5),
(5, 5, '2026-03-28 09:01:30', 'entrada', 'autorizado', 5),
(7, 7, '2026-03-28 09:02:45', 'entrada', 'autorizado', 5),
(10, 10, '2026-03-28 09:03:15', 'entrada', 'autorizado', 5),
(17, 17, '2026-03-28 09:04:00', 'entrada', 'autorizado', 5),
(22, 22, '2026-03-28 09:05:30', 'entrada', 'autorizado', 5),
(30, 30, '2026-03-28 09:06:45', 'entrada', 'autorizado', 5);

-- Accesos a biblioteca
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(6, 6, '2026-03-28 10:15:00', 'entrada', 'autorizado', 6),
(16, 16, '2026-03-28 10:20:30', 'entrada', 'autorizado', 6),
(19, 19, '2026-03-28 10:25:10', 'entrada', 'autorizado', 6),
(22, 22, '2026-03-28 10:30:45', 'entrada', 'autorizado', 6),
(24, 24, '2026-03-28 10:35:20', 'entrada', 'autorizado', 6);

-- Algunos accesos DENEGADOS
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_motivo_denegacion, id_lector) VALUES
(NULL, 1, '2026-03-28 08:30:00', 'entrada', 'denegado', 1, 1),
(NULL, 3, '2026-03-28 09:45:00', 'entrada', 'denegado', 2, 5),
(NULL, 7, '2026-03-28 11:00:00', 'entrada', 'denegado', 3, 6);

-- Salidas al mediodía
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(1, 1, '2026-03-28 12:00:00', 'salida', 'autorizado', 2),
(5, 5, '2026-03-28 12:02:15', 'salida', 'autorizado', 2),
(10, 10, '2026-03-28 12:05:30', 'salida', 'autorizado', 2),
(15, 15, '2026-03-28 12:08:45', 'salida', 'autorizado', 2),
(17, 17, '2026-03-28 12:10:20', 'salida', 'autorizado', 2),
(20, 20, '2026-03-28 12:12:55', 'salida', 'autorizado', 2),
(25, 25, '2026-03-28 12:15:30', 'salida', 'autorizado', 2),
(30, 30, '2026-03-28 12:18:10', 'salida', 'autorizado', 2);

-- Re-entradas después de comida
INSERT INTO accesopeatonal (id_usuario, id_credencial, fecha_hora, tipo, resultado, id_lector) VALUES
(1, 1, '2026-03-28 13:00:00', 'entrada', 'autorizado', 1),
(5, 5, '2026-03-28 13:05:20', 'entrada', 'autorizado', 1),
(10, 10, '2026-03-28 13:08:40', 'entrada', 'autorizado', 1),
(15, 15, '2026-03-28 13:10:15', 'entrada', 'autorizado', 1),
(17, 17, '2026-03-28 13:12:30', 'entrada', 'autorizado', 1),
(20, 20, '2026-03-28 13:15:45', 'entrada', 'autorizado', 1),
(25, 25, '2026-03-28 13:18:00', 'entrada', 'autorizado', 1),
(30, 30, '2026-03-28 13:20:30', 'entrada', 'autorizado', 1);

-- ============================================================
-- 9. ACCESOS VEHICULARES (hoy)
-- ============================================================
INSERT INTO accesovehicular (id_usuario, id_vehiculo, placa_leida, fecha_hora, resultado, id_lector) VALUES
(3, 1, 'ABC-123-A', '2026-03-28 07:08:00', 'autorizado', 3),
(9, 2, 'DEF-456-B', '2026-03-28 07:20:30', 'autorizado', 3),
(12, 3, 'GHI-789-C', '2026-03-28 07:30:00', 'autorizado', 3),
(17, 4, 'JKL-012-D', '2026-03-28 07:42:00', 'autorizado', 3),
(20, 5, 'MNO-345-E', '2026-03-28 07:50:00', 'autorizado', 3),
(25, 6, 'PQR-678-F', '2026-03-28 08:04:30', 'autorizado', 3),
(30, 7, 'STU-901-G', '2026-03-28 08:18:00', 'autorizado', 3),
(32, 8, 'DOC-001-A', '2026-03-28 06:44:00', 'autorizado', 3),
(33, 9, 'DOC-002-B', '2026-03-28 06:49:00', 'autorizado', 3),
(34, 10, 'EMP-001-A', '2026-03-28 07:54:30', 'autorizado', 3);

-- Vehiculares denegados (placas no registradas)
INSERT INTO accesovehicular (placa_leida, fecha_hora, resultado, id_motivo_denegacion, id_lector) VALUES
('XYZ-999-Z', '2026-03-28 08:45:00', 'denegado', 1, 3),
('AAA-111-A', '2026-03-28 09:30:00', 'denegado', 1, 3);

-- Salidas vehiculares al mediodía
INSERT INTO accesovehicular (id_usuario, id_vehiculo, placa_leida, fecha_hora, resultado, id_lector) VALUES
(17, 4, 'JKL-012-D', '2026-03-28 12:10:00', 'autorizado', 4),
(20, 5, 'MNO-345-E', '2026-03-28 12:13:00', 'autorizado', 4),
(25, 6, 'PQR-678-F', '2026-03-28 12:15:30', 'autorizado', 4);

-- ============================================================
-- 10. VISITANTE DE PRUEBA
-- ============================================================
INSERT INTO persona (nombre_completo, email, telefono) VALUES
('Ing. Pedro Ramirez Soto', 'pedro.ramirez@empresa.com', '5530000001');

INSERT INTO usuario (id_persona, id_tipo_usuario, activo, observaciones_usuario) VALUES
(36, 4, 1, 'Visitante - proveedor de equipos');

INSERT INTO visitante (id_usuario, empresa, motivo_visita, id_autorizado_por, fecha_entrada_estimada, fecha_salida_estimada) VALUES
(36, 'TechSupply S.A. de C.V.', 'Entrega de equipos de cómputo', 34, '2026-03-28 09:00:00', '2026-03-28 14:00:00');

-- ============================================================
-- 11. ALERTAS
-- ============================================================
INSERT INTO alerta (id_tipo_alerta, descripcion, fecha_hora, id_acceso_peatonal, atendida, id_usuario_atencion, fecha_atencion) VALUES
(1, 'Intento de acceso con credencial no registrada en entrada principal', '2026-03-28 08:30:15', 36, 1, 34, '2026-03-28 08:35:00'),
(2, 'Acceso denegado en laboratorio - credencial inactiva', '2026-03-28 09:45:10', 37, 1, 34, '2026-03-28 09:50:00'),
(3, 'Intento de acceso fuera de horario en biblioteca', '2026-03-28 11:00:05', 38, 0, NULL, NULL);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'Datos insertados correctamente' AS resultado;
SELECT 'Personas' AS tabla, COUNT(*) AS total FROM persona
UNION ALL SELECT 'Usuarios', COUNT(*) FROM usuario
UNION ALL SELECT 'Credenciales', COUNT(*) FROM credencial
UNION ALL SELECT 'Vehículos', COUNT(*) FROM vehiculo
UNION ALL SELECT 'Vigencias', COUNT(*) FROM vigenciausuario
UNION ALL SELECT 'Horarios', COUNT(*) FROM horarioacceso
UNION ALL SELECT 'Accesos Peatonales', COUNT(*) FROM accesopeatonal
UNION ALL SELECT 'Accesos Vehiculares', COUNT(*) FROM accesovehicular
UNION ALL SELECT 'Visitantes', COUNT(*) FROM visitante
UNION ALL SELECT 'Alertas', COUNT(*) FROM alerta
UNION ALL SELECT 'Lectores', COUNT(*) FROM lector;
