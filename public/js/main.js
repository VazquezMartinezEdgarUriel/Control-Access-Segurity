// ==========================================
// UTILIDADES GLOBALES
// ==========================================

/**
 * Actualiza la hora y fecha en tiempo real
 */
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    
    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
}

/**
 * Actualiza la hora cada segundo
 */
setInterval(updateDateTime, 1000);
updateDateTime();

/**
 * Muestra una alerta temporal
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 4000);
}

/**
 * Formatea una fecha en formato legible
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX');
}

/**
 * Formatea hora en formato HH:MM:SS
 */
function formatTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX');
}

/**
 * Abre un modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cierra un modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Abre modal al hacer clic en el botón de cerrar
 */
function setupModalClose(modalId, closeButtonSelector) {
    const modal = document.getElementById(modalId);
    const closeButton = modal?.querySelector(closeButtonSelector);
    
    if (closeButton) {
        closeButton.addEventListener('click', () => closeModal(modalId));
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modalId);
        });
    }
}

/**
 * Navega a otra página
 */
function navigate(page) {
    window.location.href = page;
}

/**
 * Actualiza la navegación activa basada en la URL actual
 */
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href?.includes(currentPage) || (currentPage === '' && href?.includes('index'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Actualizar navegación activa al cargar
updateActiveNav();

/**
 * Valida si un email es válido
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Obtiene parámetro de URL
 */
function getUrlParameter(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
}

/**
 * Copia texto al portapapeles
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copiado al portapapeles', 'success');
    }).catch(() => {
        showAlert('Error al copiar', 'danger');
    });
}

/**
 * Descarga un archivo JSON
 */
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Descarga como CSV
 */
function downloadCSV(data, filename) {
    if (!Array.isArray(data) || data.length === 0) {
        showAlert('No hay datos para descargar', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Muestra un indicador de carga
 */
function showLoading(container) {
    const loadingHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
    `;
    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = loadingHTML;
    } else {
        container.innerHTML = loadingHTML;
    }
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(value);
}

/**
 * Debounce para funciones
 */
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Exportar funciones si se usa módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAlert,
        formatDate,
        formatTime,
        openModal,
        closeModal,
        navigate,
        isValidEmail,
        getUrlParameter,
        copyToClipboard,
        downloadJSON,
        downloadCSV,
        showLoading,
        formatCurrency,
        debounce
    };
}
