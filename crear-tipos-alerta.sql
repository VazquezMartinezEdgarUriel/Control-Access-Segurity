-- ============================================================
-- SCRIPT: Crear Tipos de Alerta
-- ============================================================
-- Ejecutar en MySQL para asegurar que existen los 5 tipos
-- de alerta necesarios para el sistema
-- ============================================================

-- Verificar si ya existen los tipos
SELECT 'Tipos de alerta actuales:' as info;
SELECT * FROM tipoalerta WHERE id_tipo_alerta BETWEEN 1 AND 5;

-- Insertar tipos si no existen
INSERT IGNORE INTO tipoalerta (id_tipo_alerta, nombre_tipo, descripcion) VALUES
(1, 'Credencial no registrada', 'Intento de validación con tarjeta NFC que no existe en el sistema'),
(2, 'Credencial desactivada', 'Intento de acceso con credencial que ha sido desactivada'),
(3, 'Credencial expirada', 'Intento de acceso con tarjeta que ha pasado su fecha de expiración'),
(4, 'Usuario inactivo', 'Intento de acceso con usuario que no está activo en el sistema'),
(5, 'Vigencia expirada', 'Usuario tiene acceso pero su período de vigencia ha expirado');

-- Verificar que se insertaron
SELECT 'Tipos de alerta después de insertar:' as info;
SELECT * FROM tipoalerta WHERE id_tipo_alerta BETWEEN 1 AND 5;

-- Contar alertas actuales
SELECT 'Total de alertas en el sistema:' as info;
SELECT COUNT(*) as total_alertas, COUNT(CASE WHEN atendida=0 THEN 1 END) as pendientes FROM alerta;

-- Listar últimas alertas
SELECT 'Últimas 10 alertas:' as info;
SELECT 
    a.id_alerta,
    t.nombre_tipo,
    a.descripcion,
    a.fecha_hora,
    CASE WHEN a.atendida=1 THEN 'Atendida' ELSE 'Pendiente' END as estado
FROM alerta a
LEFT JOIN tipoalerta t ON a.id_tipo_alerta = t.id_tipo_alerta
ORDER BY a.fecha_hora DESC
LIMIT 10;
