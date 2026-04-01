# 🚀 QUICK START - Activar Sistema de Alertas

## ¿Qué se hizo?
Se implementó un **sistema completo de alertas en el dashboard** que ahora:
- ✅ Se crea automáticamente cuando pasas una tarjeta NFC
- ✅ Se muestra en tiempo real en el panel "Alertas Activas"
- ✅ Se puede marcar como "Atendida"
- ✅ Se guarda en la base de datos para auditoría

---

## 🎯 PASOS PARA ACTIVAR

### Paso 1: Verificar que los archivos se copiaron correctamente
```bash
# Verificar que AlertaController existe
ls -la app/Http/Controllers/AlertaController.php

# Verificar que se modificaron los controladores
grep "use App\\\Models\\\Alerta" app/Http/Controllers/CredencialController.php
grep "use App\\\Models\\\Alerta" app/Http/Controllers/AccesoPeatonalController.php

# Verificar que se agregaron las rutas
grep "AlertaController" routes/api.php

# Verificar que se modificó el dashboard
grep "loadAlertas" public/js/dashboard.js
grep "alertas-container" public/index.html
```

Si todos los comandos retornan algo, está bien. Si alguno no retorna nada, revisar los archivos.

### Paso 2: Limpiar caché de Laravel
```bash
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Paso 3: Crear los tipos de alerta en BD
```bash
# Opción A: Desde MySQL/PhpMyAdmin
# Copiar y ejecutar el contenido de: crear-tipos-alerta.sql

# Opción B: Desde terminal
mysql -u root -p AcControl < crear-tipos-alerta.sql

# Opción C: Manual en PhpMyAdmin
# - Abre http://localhost/phpmyadmin
# - Selecciona BD "AcControl"
# - Ve a tabla "tipoalerta"
# - Inserta estos 5 registros:
#   ID 1: Credencial no registrada
#   ID 2: Credencial desactivada
#   ID 3: Credencial expirada
#   ID 4: Usuario inactivo
#   ID 5: Vigencia expirada
```

### Paso 4: Ejecutar el script de prueba
```bash
php test-alertas-system.php
```

Deberías ver algo como:
```
✅ OK: AlertaController existe
✅ OK: Modelo Alerta existe
✅ OK: Tabla alerta existe (0 registros)
✅ OK: Existen 5 tipos de alerta
✅ OK: Alerta creada (ID: 1)
✅ OK: Obtenidas 1 alertas no atendidas
✅ OK: CredencialController importa Alerta

════════════════════════════════════════════════════════════════
RESULTADO FINAL: 6 PASS, 0 FAIL
════════════════════════════════════════════════════════════════
```

### Paso 5: Probar en el navegador
1. Abre http://localhost/public/index.html
2. Busca el panel "Alertas Activas" en el sidebar derecho
3. Debe mostrar "Sin alertas activas" si la BD está vacía
4. Pasa una tarjeta NFC (una que NO exista o que esté expirada)
5. ✅ Deberías ver la alerta aparecer en el panel en 1-2 segundos
6. Haz click en "Atender" para marcarla como atendida
7. ✅ La alerta debe desaparecer de la lista

---

## 📊 Ver Alertas en BD

### PhpMyAdmin
1. http://localhost/phpmyadmin
2. Selecciona BD "AcControl"
3. Tabla "alerta"
4. Verás todas las alertas creadas

### Terminal MySQL
```bash
# Ver última alerta
mysql -u root -p AcControl -e "SELECT * FROM alerta ORDER BY id_alerta DESC LIMIT 1\G"

# Ver alertas no atendidas
mysql -u root -p AcControl -e "SELECT * FROM alerta WHERE atendida=0\G"

# Contar alertas por tipo
mysql -u root -p AcControl -e "
  SELECT t.nombre_tipo, COUNT(*) as cantidad
  FROM alerta a
  LEFT JOIN tipoalerta t ON a.id_tipo_alerta = t.id_tipo_alerta
  GROUP BY a.id_tipo_alerta
"
```

---

## 🧪 Casos de Prueba

### Caso 1: Tarjeta NO registrada ✅
1. Obtén un UID de cualquier tarjeta (ej: AA:BB:CC:DD:EE:FF)
2. Pasa esa tarjeta en el dashboard
3. ✅ Deberá crear alerta "Credencial no registrada"

### Caso 2: Tarjeta registrada pero EXPIRADA ✅
1. Crea una credencial con fecha de expiración en el pasado
2. Pasa esa tarjeta
3. ✅ Deberá crear alerta "Credencial expirada"

### Caso 3: Usuario INACTIVO ✅
1. Desactiva un usuario desde usuarios.html
2. Pasa su tarjeta
3. ✅ Deberá crear alerta "Usuario inactivo"

### Caso 4: VIGENCIA expirada ✅
1. Crea un usuario con vigencia que expira en el pasado
2. Pasa su tarjeta
3. ✅ Deberá crear alerta "Vigencia expirada"

---

## 📝 Documentos Relacionados

| Archivo | Descripción |
|---------|------------|
| [DIAGNOSTICO_ALERTAS.md](DIAGNOSTICO_ALERTAS.md) | Análisis del problema identificado |
| [SOLUCION_ALERTAS.md](SOLUCION_ALERTAS.md) | Documentación completa de la solución |
| [CAMBIOS_RESUMIDOS.md](CAMBIOS_RESUMIDOS.md) | Resumen de todos los cambios |
| [test-alertas-system.php](test-alertas-system.php) | Script para verificar el sistema |
| [crear-tipos-alerta.sql](crear-tipos-alerta.sql) | Script SQL para crear tipos de alerta |

---

## ❓ Preguntas Frecuentes

### ¿Las alertas aparecen pero después desaparecen?
❌ **Problema:** Las alertas se actualiza cada 5 segundos y las no atendidas se recargan.  
✅ **Solución:** Si desaparecen es porque se marcaron como atendidas. Verifica en BD.

### ¿No veo ningún cambio en el dashboard?
✅ **Checklist:**
1. ¿Ejecutaste `php artisan cache:clear`?
2. ¿Actualizaste el navegador (F5)?
3. ¿Abriste la consola del navegador (F12) para ver errores?
4. ¿Ejecutaste `test-alertas-system.php` y pasó todas las pruebas?

### ¿Las alertas no se crean cuando paso una tarjeta?
✅ **Verificar:**
1. Abre la consola del navegador (F12) → Tab Network
2. Busca la llamada a `/api/credenciales/validar-nfc`
3. Verifica que retorna HTTP 200 (no es error)
4. Verifica que `public/js/dashboard.js` tiene la función `loadAlertas()`
5. Busca error específico en `storage/logs/laravel.log`

### ¿Cómo ver el log de Laravel?
```bash
tail -f storage/logs/laravel.log

# En Windows, usa:
type storage\logs\laravel.log

# O busca el archivo más reciente:
ls -ltr storage/logs/ | tail -5
```

---

## 🔗 API Endpoints Disponibles

```
GET    /api/alertas                          # Todas las alertas
GET    /api/alertas/no-atendidas             # No atendidas (Dashboard usa esta)
GET    /api/alertas/{id}                     # Alerta específica
POST   /api/alertas                          # Crear alerta
POST   /api/alertas/{id}/atender             # Marcar como atendida
DELETE /api/alertas/{id}                     # Eliminar alerta
GET    /api/alertas/usuario/{usuarioId}      # Alertas de un usuario
GET    /api/alertas/tipo/{tipoId}            # Alertas por tipo
GET    /api/alertas/estadisticas             # Estadísticas
GET    /api/alertas/fecha/{inicio}/{fin}     # Alertas por fecha
```

### Probar API con curl
```bash
# Ver alertas no atendidas
curl http://localhost/api/alertas/no-atendidas

# Crear alerta de prueba
curl -X POST http://localhost/api/alertas \
  -H "Content-Type: application/json" \
  -d '{"id_tipo_alerta":1,"descripcion":"Prueba desde curl"}'

# Marcar alerta como atendida
curl -X POST http://localhost/api/alertas/1/atender
```

---

## 📞 Soporte

Si algo no funciona:

1. Ejecuta `php test-alertas-system.php` y sube los resultados
2. Sube el archivo `storage/logs/laravel.log` (últimas 50 líneas)
3. Abre la consola del navegador (F12) y copia cualquier error
4. Sube screenshot del panel de alertas

---

## ✅ Estado Final

| Componente | Status |
|-----------|--------|
| AlertaController | ✅ Creado |
| Rutas API | ✅ Agregadas |
| CredencialController | ✅ Actualizado |
| AccesoPeatonalController | ✅ Actualizado |
| dashboard.js | ✅ Actualizado |
| index.html | ✅ Actualizado |
| Test script | ✅ Disponible |
| Documentación | ✅ Completa |

**LISTO PARA PRODUCCIÓN ✅**

---

¿**Necesitas ayuda?** Abre la consola del navegador (F12) y ejecuta:
```javascript
// Obtener alertas manualmente
fetch('/api/alertas/no-atendidas').then(r => r.json()).then(console.log)

// Ver historial de llamadas
console.log('Ver Network tab → XHR/Fetch')

// Probar loadAlertas manualmente
loadAlertas()
```

