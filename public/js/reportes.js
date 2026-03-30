
// REPORTES E HISTORIAL

let allAccesos = [];

/**
 * Carga accesos (peatonal y vehicular)
 */
async function loadAccesos() {
    try {
        showLoading('accesos-table');
        
        const [peatonalResp, vehicularResp] = await Promise.all([
            fetch('/api/acceso-peatonal'),
            fetch('/api/acceso-vehicular')
        ]);
        
        const peatonal = await peatonalResp.json();
        const vehicular = await vehicularResp.json();
        
        // Combinar y ordenar
        allAccesos = [
            ...((Array.isArray(peatonal) ? peatonal : []).map(a => ({
                ...a,
                tipo_acceso: 'peatonal'
            }))),
            ...((Array.isArray(vehicular) ? vehicular : []).map(a => ({
                ...a,
                tipo_acceso: 'vehicular'
            })))
        ].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
        
        renderAccesos(allAccesos);
    } catch (error) {
        console.error('Error cargando accesos:', error);
        showAlert('Error al cargar accesos', 'danger');
    }
}

/**
 * Renderiza tabla de accesos
 */
function renderAccesos(accesos) {
    const tbody = document.getElementById('accesos-table');
    if (!tbody) return;
    
    if (!Array.isArray(accesos) || accesos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay registros</td></tr>';
        return;
    }
    
    tbody.innerHTML = accesos.map(acceso => `
        <tr>
            <td>${formatDate(acceso.fecha_hora)}</td>
            <td>${acceso.usuario?.nombre_completo || 'Desconocido'}</td>
            <td><span class="nfc">${acceso.credencial?.uid_nfc || acceso.placa_leida || '-'}</span></td>
            <td>
                <span class="badge badge-${acceso.tipo_acceso === 'peatonal' ? 'pending' : 'info'}">
                    ${acceso.tipo_acceso.toUpperCase()}
                </span>
            </td>
            <td>${acceso.tipo ? acceso.tipo.toUpperCase() : '-'}</td>
            <td>
                <span class="badge badge-${acceso.resultado === 'autorizado' ? 'allowed' : 'denied'}">
                    ${acceso.resultado.toUpperCase()}
                </span>
            </td>
            <td>${acceso.lector?.nombre || '-'}</td>
        </tr>
    `).join('');
}

/**
 * Filtra accesos por rango de fechas
 */
function filterByDate() {
    const dateFrom = document.getElementById('date-from')?.value;
    const dateTo = document.getElementById('date-to')?.value;
    
    if (!dateFrom || !dateTo) {
        renderAccesos(allAccesos);
        return;
    }
    
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    const filtered = allAccesos.filter(a => {
        const fecha = new Date(a.fecha_hora);
        return fecha >= from && fecha <= to;
    });
    
    renderAccesos(filtered);
}

/**
 * Filtra por tipo de acceso
 */
function filterByType() {
    const type = document.getElementById('filter-type')?.value;
    
    if (!type) {
        renderAccesos(allAccesos);
        return;
    }
    
    const filtered = allAccesos.filter(a => a.tipo_acceso === type);
    renderAccesos(filtered);
}

/**
 * Filtra por resultado
 */
function filterByResult() {
    const result = document.getElementById('filter-result')?.value;
    
    if (!result) {
        renderAccesos(allAccesos);
        return;
    }
    
    const filtered = allAccesos.filter(a => a.resultado === result);
    renderAccesos(filtered);
}

/**
 * Exporta reportes
 */
function exportReport(format) {
    if (format === 'csv') {
        const data = allAccesos.map(a => ({
            'Fecha y Hora': formatDate(a.fecha_hora),
            'Usuario': a.usuario?.nombre_completo || 'Desconocido',
            'NFC/Placa': a.credencial?.uid_nfc || a.placa_leida || '-',
            'Tipo de Acceso': a.tipo_acceso,
            'Movimiento': a.tipo || '-',
            'Resultado': a.resultado,
            'Lector': a.lector?.nombre || '-'
        }));
        
        downloadCSV(data, `reporte_accesos_${new Date().getTime()}.csv`);
    } else if (format === 'json') {
        downloadJSON(allAccesos, `reporte_accesos_${new Date().getTime()}.json`);
    }
}

/**
 * Genera estadísticas
 */
function generateStats() {
    if (!Array.isArray(allAccesos) || allAccesos.length === 0) return;
    
    const total = allAccesos.length;
    const autorizados = allAccesos.filter(a => a.resultado === 'autorizado').length;
    const denegados = allAccesos.filter(a => a.resultado === 'denegado').length;
    const peatonal = allAccesos.filter(a => a.tipo_acceso === 'peatonal').length;
    const vehicular = allAccesos.filter(a => a.tipo_acceso === 'vehicular').length;
    
    const statsHTML = `
        <div class="grid-3">
            <div class="card">
                <div class="sidebar-header">📊 Total de Accesos</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--accent-blue);">${total}</div>
            </div>
            <div class="card">
                <div class="sidebar-header">✓ Autorizados</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--success);">${autorizados}</div>
            </div>
            <div class="card">
                <div class="sidebar-header">✗ Denegados</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--danger);">${denegados}</div>
            </div>
            <div class="card">
                <div class="sidebar-header">👤 Peatonales</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--accent-blue);">${peatonal}</div>
            </div>
            <div class="card">
                <div class="sidebar-header">🚗 Vehiculares</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--accent-blue);">${vehicular}</div>
            </div>
            <div class="card">
                <div class="sidebar-header">📈 Tasa Éxito</div>
                <div style="font-size: 2rem; font-weight: 600; color: var(--success);">${Math.round((autorizados / total) * 100)}%</div>
            </div>
        </div>
    `;
    
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
    }
}

/**
 * Inicializa página de reportes
 */
function initReportesPage() {
    loadAccesos();
    generateStats();
    
    // Event listeners para filtros
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const typeFilter = document.getElementById('filter-type');
    const resultFilter = document.getElementById('filter-result');
    
    if (dateFromInput) dateFromInput.addEventListener('change', filterByDate);
    if (dateToInput) dateToInput.addEventListener('change', filterByDate);
    if (typeFilter) typeFilter.addEventListener('change', filterByType);
    if (resultFilter) resultFilter.addEventListener('change', filterByResult);
    
    // Auto-refresh
    setInterval(() => {
        loadAccesos();
        generateStats();
    }, 30000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportesPage);
} else {
    initReportesPage();
}
