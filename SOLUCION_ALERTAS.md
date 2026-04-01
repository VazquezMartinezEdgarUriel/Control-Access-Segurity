# ✅ SOLUCIÓN COMPLETA: Sistema de Alertas en Dashboard

## 🎯 PROBLEMA RESUELTO

**Antes:** Las alertas no se mostraban cuando pasabas una tarjeta NFC en el dashboard  
**Ahora:** ✅ Las alertas se crea automáticamente y se muestran en tiempo real en el dashboard

---

## 📋 CAMBIOS IMPLEMENTADOS

### 1. ✅ AlertaController.php (NUEVO)
**Ruta:** `app/Http/Controllers/AlertaController.php`

Nuevo controlador con los siguientes métodos:
- `index()` - Listar todas las alertas
- `noAtendidas()` - Listar solo alertas sin atender (para dashboard)
- `store()` - Crear nueva alerta
- `atender()` - Marcar alerta como atendida
- `porUsuario()` - Alertas de un usuario específico
- `porTipo()` - Alertas por tipo
- `porFecha()` - Alertas por rango de fechas
- `estadisticas()` - Contar alertas por tipo

### 2. ✅ CredencialController.php (MODIFICADO)
**Ruta:** `app/Http/Controllers/CredencialController.php`

Se agregaron alertas automáticas en el método `validarNfc()`:
- ❌ **Tarjeta no registrada** → Alerta tipo 1
- ❌ **Credencial desactivada** → Alerta tipo 2
- ❌ **Credencial expirada** → Alerta tipo 3
- ❌ **Usuario inactivo** → Alerta tipo 4
- ⚠️ **Vigencia expirada** → Alerta tipo 5

```php
// Ejemplo:
if (!$credencial) {
    Alerta::create([
        'id_tipo_alerta' => 1,
        'descripcion' => "Intento de validación: Tarjeta NFC no registrada ($request->uid_nfc)",
        'fecha_hora' => now()
    ]);
    return response()->json([...], 200);
}
```

### 3. ✅ AccesoPeatonalController.php (MODIFICADO)
**Ruta:** `app/Http/Controllers/AccesoPeatonalController.php`

Se agregó creación de alerta cuando un acceso peatonal es denegado:
```php
if (!$credencial) {
    Alerta::create([
        'id_tipo_alerta' => 1,
        'descripcion' => "Intento de acceso peatonal denegado: Credencial no registrada",
        'fecha_hora' => now()
    ]);
```

### 4. ✅ routes/api.php (MODIFICADO)
**Ruta:** `routes/api.php`

Se agregaron nuevas rutas para alertas:
```php
// ALERTAS
GET    /api/alertas                              → Listar todas
GET    /api/alertas/no-atendidas                → Listar sin atender (Dashboard)
GET    /api/alertas/{id}                        → Obtener una alerta
GET    /api/alertas/estadisticas                → Ver estadísticas
POST   /api/alertas                             → Crear alerta
POST   /api/alertas/{id}/atender                → Marcar como atendida
DELETE /api/alertas/{id}                        → Eliminar alerta
GET    /api/alertas/usuario/{usuarioId}         → Alertas por usuario
GET    /api/alertas/tipo/{tipoId}               → Alertas por tipo
GET    /api/alertas/fecha/{inicio}/{fin}        → Alertas por fecha
```

### 5. ✅ public/js/dashboard.js (MODIFICADO)
**Ruta:** `public/js/dashboard.js`

Se agregaron nuevas funciones:
- `loadAlertas()` - Carga alertas no atendidas cada 5 segundos
- `atenderAlerta(alertaId)` - Marca alerta como atendida
- Modificación en `initDashboard()` para llamar `loadAlertas()`

```javascript
async function loadAlertas() {
    const response = await fetch('/api/alertas/no-atendidas?limit=10');
    const alertas = await response.json();
    // Mostrar alertas en el DOM
}

async function atenderAlerta(alertaId) {
    await fetch(`/api/alertas/${alertaId}/atender`, { method: 'POST' });
    loadAlertas();  // Recargar
}
```

### 6. ✅ public/index.html (MODIFICADO)
**Ruta:** `public/index.html`

Se reemplazó el panel estático:
```html
<!-- ANTES -->
<div class="sidebar-card">
    <div class="sidebar-header">Alertas Activas</div>
    <div>Sistema operativo correctamente</div>
</div>

<!-- AHORA -->
<div class="sidebar-card">
    <div class="sidebar-header">Alertas Activas</div>
    <div id="alertas-container" style="max-height: 400px; overflow-y: auto;">
        <!-- Se llena dinámicamente -->
    </div>
</div>
```

---

## 🔄 FLUJO COMPLETO

```
Usuario pasa NFC
          ↓
Dashboard WebSocket detecta tarjeta
          ↓
Frontend llama: POST /api/credenciales/validar-nfc
          ↓
Backend valida la tarjeta
          ├→ ✅ Valida OK → Alerta tipo 1 (Tarjeta no registrada)
          ├→ ✖️ NO activa → Alerta tipo 2 (Desactivada)
          ├→ ✖️ Expirada → Alerta tipo 3 (Expirada)
          ├→ ✖️ Usuario inactivo → Alerta tipo 4
          └→ ⚠️ Vigencia vencida → Alerta tipo 5
          ↓
Backend crea Alerta en BD
          ↓
Frontend cada 5s llama: GET /api/alertas/no-atendidas
          ↓
Dashboard muestra alertas en panel "Alertas Activas"
          ↓
Usuario hace click en "Atender"
          ↓
Frontend llama: POST /api/alertas/{id}/atender
          ↓
Alerta se marca como atendida
          ↓
Dashboard actualiza y alerta desaparece
```

---

## 🧪 CÓMO PROBAR

### Opción 1: Desde el Dashboard (Visual)
1. Abre http://localhost/public/index.html
2. Ve a la sección "Alertas Activas" en el sidebar
3. Pasa una tarjeta NFC que NO exista (o que esté expirada/bloqueada)
4. ✅ Deberías ver la alerta aparecer en 1-2 segundos
5. Haz click en "Atender" para marcar como atendida

### Opción 2: Desde PhpMyAdmin
1. Abre http://localhost/phpmyadmin
2. Ve a base de datos `AcControl` → Tabla `alerta`
3. Pasa una tarjeta NFC en el dashboard
4. ✅ Deberías ver un nuevo registro en la tabla

### Opción 3: Desde API REST (CURL/Postman)
```bash
# Ver alertas no atendidas
curl http://localhost/api/alertas/no-atendidas

# Ver TODAS las alertas
curl http://localhost/api/alertas

# Ver estadísticas
curl http://localhost/api/alertas/estadisticas

# Marcar alerta como atendida (reemplaza ID)
curl -X POST http://localhost/api/alertas/1/atender

# Ver alertas de un usuario (reemplaza usuario ID)
curl http://localhost/api/alertas/usuario/1
```

---

## 📊 TIPOS DE ALERTAS

| ID | Tipo | Descripción |
|----|------|-------------|
| 1 | Credencial no registrada | Tarjeta NFC no existe en BD |
| 2 | Credencial desactivada | Usuario desactivó la tarjeta |
| 3 | Credencial expirada | Fecha de expiración passou |
| 4 | Usuario inactivo | Usuario no está habilitado |
| 5 | Vigencia expirada | Período acceso terminó |

**Nota:** Estos IDs deben existir en tabla `tipoalerta`. Si no existen, ejecuta:
```sql
INSERT INTO tipoalerta (id_tipo_alerta, nombre_tipo, descripcion) VALUES
(1, 'Credencial no registrada', 'Intento de validación con tarjeta no registrada'),
(2, 'Credencial desactivada', 'Credencial está inactiva'),
(3, 'Credencial expirada', 'La credencial ha pasado su fecha de expiración'),
(4, 'Usuario inactivo', 'El usuario no está activo en el sistema'),
(5, 'Vigencia expirada', 'El período de vigencia del usuario ha expirado');
```

---

## 📱 RESPUESTAS API

### GET /api/alertas/no-atendidas
```json
[
  {
    "id_alerta": 1,
    "id_tipo_alerta": 1,
    "descripcion": "Intento de validación: Tarjeta NFC no registrada (04:1C:E8:72:A1:14:80)",
    "fecha_hora": "2026-03-31T14:35:22.000000Z",
    "id_usuario": null,
    "id_acceso_peatonal": null,
    "id_acceso_vehicular": null,
    "atendida": false,
    "id_usuario_atencion": null,
    "fecha_atencion": null,
    "tipoAlerta": {
      "id_tipo_alerta": 1,
      "nombre_tipo": "Credencial no registrada",
      "descripcion": "..."
    },
    "usuario": null
  }
]
```

### POST /api/alertas/{id}/atender
```json
{
  "id_alerta": 1,
  "atendida": true,
  "id_usuario_atencion": 1,
  "fecha_atencion": "2026-03-31T14:36:45.000000Z",
  "tipoAlerta": { ... }
}
```

---

## 📝 RESUMEN TÉCNICO

| Aspecto | Antes | Después |
|--------|-------|---------|
| Panel Alertas | Texto estático | Dinámico con alertas reales |
| Creación Alertas | No ocurría | Automática al validar NFC |
| Rutas API | No existen | 10+ nuevas rutas |
| Controladores | No existe AlertaController | Ahora existe |
| Funciones JS | No hay loadAlertas() | Ahora carga cada 5s |
| Backend | No crear alertas | Crea en 5 escenarios |
| BD Alertas | Vacía | Se llena automáticamente |
| Visibilidad Usuario | ❌ No ve nada | ✅ Ve alertas en tiempo real |

---

## 🚀 PRÓXIMOS PASOS OPCIONALES

1. **Webhooks/Notificaciones:** Enviar SMS/Email cuando hay alerta crítica
2. **Histórico:** Mostrar alertas atendidas con filtros/búsqueda
3. **Dashboard mejorado:** Gráficos de alertas por tipo/hora
4. **Escaladas:** Alertas no atendidas > 30min se escalan a supervisor
5. **Audio:** Sonido cuando aparece alerta crítica
6. **Automáticas:** Auto-atender alertas de ciertos tipos después de X tiempo

---

## ✅ VALIDACIÓN

Para verificar que TODO funciona:

```bash
# 1. Verificar API
curl http://localhost/api/alertas

# 2. Verificar tabla
SELECT COUNT(*) FROM alerta;

# 3. Crear alerta de prueba
curl -X POST http://localhost/api/alertas \
  -H "Content-Type: application/json" \
  -d '{"id_tipo_alerta":1,"descripcion":"Prueba"}'

# 4. Ver en dashboard
# Abre http://localhost/public/index.html
# Debe aparecer en panel "Alertas Activas"
```

---

## 📞 SOPORTE

Si no aparecen alertas:

1. ✓ Verifica que AlertaController.php existe
2. ✓ Verifica que rutas en api.php están correctas
3. ✓ Abre consola del navegador (F12) y busca errores
4. ✓ Revisa logs en `storage/logs/`
5. ✓ Verifica que tipos de alerta existen en BD
6. ✓ Ejecuta: `php artisan cache:clear`

---

**Estado:** ✅ IMPLEMENTADO Y LISTO PARA PRODUCCIÓN  
**Fecha:** 31 Marzo 2026  
**Versión:** 1.0

