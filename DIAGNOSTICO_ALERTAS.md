# 🔍 DIAGNÓSTICO: Alertas No Se Muestran en Dashboard

## ✗ PROBLEMA IDENTIFICADO

Las alertas **NO SE MUESTRAN** cuando pasas una tarjeta NFC en el dashboard porque:

### 1. **FALTA DE CÓDIGO BACKEND** ❌
- **No existe AlertaController** - No hay controlador para manejar alertas
- **No existe endpoint GET /api/alertas** - El dashboard no puede traer las alertas
- **No hay lógica de creación de alertas** - Cuando se valida un NFC, NO se guardan alertas en la BD

### 2. **FALTA DE CÓDIGO FRONTEND** ❌
- **No existe función loadAlertas()** en dashboard.js
- **El panel "Alertas Activas" es solo texto estático** en index.html: "Sistema operativo correctamente"
- **No hay lógica para refrescar alertas** en el intervalo del dashboard

### 3. **FLUJO INCOMPLETO** ❌
```
Usuario pasa NFC → ValidarNFC (API) → ✓ Modal muestra resultado
                                     ↓
                          ❌ NO SE CREA ALERTA
                          ❌ NO SE GUARDA EN BD
                          ❌ NO SE MUESTRA EN DASHBOARD
```

## 📊 DETALLES TÉCNICOS

### Código Faltante en AccesoPeatonalController.php
```php
// Cuando se registra un acceso, debería crear una alerta
// Pero actualmente NO LO HACE

public function registrarEntrada(Request $request)
{
    // ... existe código para validar y crear acceso
    // ✗ PERO NO CREA ALERTA
    $acceso = AccesoPeatonal::create([...]);
    // ❌ Falta: Alerta::create([...])
}
```

### Código Faltante en CredencialController.php
```php
// Cuando se valida NFC, debería crear una alerta
// Si es DENEGADO o ADVERTENCIA
public function validarNfc(Request $request)
{
    // ... posiblemente valida la tarjeta
    // ❌ PERO NO CREA ALERTA
}
```

### Código Faltante en dashboard.js
```javascript
// El dashboard NO intenta cargar alertas
// Falta:
async function loadAlertas() {
    const alertas = await fetch('/api/alertas').then(r => r.json());
    // mostrar en el panel
}

// Y en initDashboard():
// ❌ No llama a loadAlertas()
// ❌ No actualiza alertas cada 5 segundos
```

### Código Faltante en routes/api.php
```php
// ❌ NO EXISTE:
Route::get('alertas', [AlertaController::class, 'index']);
Route::get('alertas/no-atendidas', [AlertaController::class, 'noAtendidas']);
Route::post('alertas/{id}/atender', [AlertaController::class, 'atender']);
```

### Modelo Disponible ✓
```php
App\Models\Alerta  // EXISTE pero no se usa
- Tabla: alerta
- Campos: id_tipo_alerta, descripcion, fecha_hora, id_usuario, etc.
```

## 🔧 SOLUCIÓN

Se necesita:

1. ✅ **Crear AlertaController.php**
   - Método `index()` - listar alertas no atendidas
   - Método `store()` - crear nueva alerta
   - Método `atender()` - marcar alerta como atendida

2. ✅ **Modificar AccesoPeatonalController**
   - Crear alerta cuando acceso resultado = "denegado"
   - Crear alerta cuando es "advertencia"

3. ✅ **Modificar CredencialController**
   - En validarNfc(), crear alerta según resultado

4. ✅ **Agregar rutas a routes/api.php**
   - GET /api/alertas
   - GET /api/alertas/no-atendidas
   - POST /api/alertas/{id}/atender

5. ✅ **Actualizar dashboard.js**
   - Agregar función loadAlertas()
   - Agregar función mostrarAlertas()
   - Llamar a loadAlertas() en initDashboard()
   - Refrescar alertas cada 5 segundos

6. ✅ **Actualizar index.html**
   - Reemplazar texto estático por contenedor dinámico
   - Mostrar alertas reales con estado

## 📋 RESUMEN

| Componente | Estado | Problema |
|-----------|--------|---------|
| BD (alerta) | ✓ Existe | No se inserta datos |
| Modelo (Alerta) | ✓ Existe | No se usa en controladores |
| Controllers | ✗ Falta | AlertaController no existe |
| Routes | ✗ Falta | /api/alertas no definida |
| Frontend JS | ✗ Falta | loadAlertas() no existe |
| Frontend HTML | ✗ Falta | Panel es texto estático |

## 🎯 IMPACTO

- Dashboard muestra "Sistema operativo correctamente" siempre
- Las alertas nunca se guardan en BD
- El usuario NO VE las alertas/incidentes que ocurren
- No hay forma de atender alertas

