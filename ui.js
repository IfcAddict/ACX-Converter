// ui.js
import { parseCsv } from './converters.js';

/**
 * Muestra una notificación en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} isError - Si es true, la notificación será de error.
 */
export function showNotification(message, isError = false) {
    const area = document.getElementById('notification-area');
    if (!area) return;
    const notification = document.createElement('div');
    notification.className = `notification p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    notification.textContent = message;
    area.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

/**
 * Configura una zona de 'arrastrar y soltar' para múltiples archivos.
 * @param {string} dropZoneId - El ID de la zona de drop.
 * @param {string} inputId - El ID del input de archivo oculto.
 * @param {string} fileCountId - El ID del elemento <p> para mostrar el número de archivos.
 * @param {Function} onFilesLoaded - Callback a ejecutar cuando se cargan los archivos.
 */
export function setupDropZone(dropZoneId, inputId, fileCountId, onFilesLoaded) {
    const dropZoneLabel = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(inputId);
    const fileCountDisplay = document.getElementById(fileCountId);

    if (!dropZoneLabel || !fileInput || !fileCountDisplay) {
        console.error("Error al inicializar la zona de drop.");
        return;
    }

    const handleFiles = (files) => {
        if (files && files.length > 0) {
            fileCountDisplay.textContent = `${files.length} archivo(s) seleccionado(s).`;
            onFilesLoaded(files);
        }
    };

    dropZoneLabel.addEventListener('dragover', e => { e.preventDefault(); dropZoneLabel.classList.add('drag-over'); });
    ['dragleave', 'dragend'].forEach(type => dropZoneLabel.addEventListener(type, () => dropZoneLabel.classList.remove('drag-over')));
    
    dropZoneLabel.addEventListener('drop', e => {
        e.preventDefault();
        dropZoneLabel.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
}

/**
 * Muestra u oculta el formulario de metadatos y ajusta el atributo 'required'.
 * @param {boolean} show - True para mostrar, false para ocultar.
 */
export function toggleMetadataForm(show) {
    const container = document.getElementById('metadata-form-container');
    if (container) {
        container.classList.toggle('hidden', !show);
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => { input.required = show; });
    }
}

/**
 * Renderiza las pestañas y el contenido de previsualización para los archivos cargados.
 * @param {File[]} files - Un array de archivos.
 */
export function renderFilePreviews(files) {
    const previewSection = document.getElementById('preview-section');
    const tabContainer = document.getElementById('tab-container');
    const contentContainer = document.getElementById('tab-content-container');

    if (!previewSection || !tabContainer || !contentContainer) return;

    tabContainer.innerHTML = '';
    contentContainer.innerHTML = '';
    previewSection.classList.remove('hidden');

    files.forEach((file, index) => {
        const tab = document.createElement('button');
        tab.textContent = file.name;
        tab.className = 'tab-button';
        tab.dataset.index = index;

        const contentPanel = document.createElement('div');
        contentPanel.className = 'tab-content';
        contentPanel.dataset.index = index;

        tabContainer.appendChild(tab);
        contentContainer.appendChild(contentPanel);

        tab.addEventListener('click', () => {
            tabContainer.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            contentContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            contentPanel.classList.add('active');
        });

        displayFileContent(file, contentPanel);

        if (index === 0) {
            tab.click();
        }
    });
}

/**
 * Lee el contenido de un archivo y lo muestra en su panel de previsualización.
 */
function displayFileContent(file, contentPanel) {
    const fileType = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
        const content = e.target.result;
        contentPanel.innerHTML = '';

        if (fileType === 'csv') {
            const parsedRows = parseCsv(content);
            const table = document.createElement('table');
            table.className = 'w-full text-left text-sm table-auto';
            if (parsedRows.length > 0) {
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                parsedRows[0].forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                parsedRows.slice(1).forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellText => {
                        const td = document.createElement('td');
                        td.textContent = cellText;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
            }
            contentPanel.appendChild(table);
        } else {
            const pre = document.createElement('pre');
            pre.textContent = content;
            contentPanel.appendChild(pre);
        }
    };
    reader.readAsText(file, 'UTF-8');
}

/**
 * Ofrece un archivo para descarga.
 */
export function downloadFile(filename, content, mimeType) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
