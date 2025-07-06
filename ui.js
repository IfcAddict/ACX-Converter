// ui.js
import { parseCsv } from './converters.js';

/**
 * Muestra una notificación en la pantalla.
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
 */
export function setupDropZone(dropZoneId, inputId, fileCountId, onFilesLoaded) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(inputId);
    const fileCountDisplay = document.getElementById(fileCountId);

    if (!dropZone || !fileInput || !fileCountDisplay) {
        console.error("Error al inicializar la zona de drop.");
        return;
    }

    const handleFiles = (files) => {
        if (files && files.length > 0) {
            fileCountDisplay.textContent = `${files.length} archivo(s) seleccionado(s).`;
            onFilesLoaded(files);
        }
    };

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    ['dragleave', 'dragend'].forEach(type => dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over')));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
}

/**
 * Muestra u oculta el formulario de metadatos.
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

    // Limpia el contenido anterior
    tabContainer.innerHTML = '';
    contentContainer.innerHTML = '';
    previewSection.classList.remove('hidden');

    files.forEach((file, index) => {
        // Crea la pestaña
        const tab = document.createElement('button');
        tab.textContent = file.name;
        tab.className = 'tab-button';
        tab.dataset.index = index;

        // Crea el panel de contenido (inicialmente oculto)
        const contentPanel = document.createElement('div');
        contentPanel.className = 'tab-content';
        contentPanel.dataset.index = index;

        tabContainer.appendChild(tab);
        contentContainer.appendChild(contentPanel);

        // Lógica para mostrar el contenido al hacer clic en la pestaña
        tab.addEventListener('click', () => {
            // Desactiva todas las pestañas y oculta todos los contenidos
            tabContainer.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            contentContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Activa la pestaña y el contenido seleccionados
            tab.classList.add('active');
            contentPanel.classList.add('active');
        });

        // Carga el contenido del archivo en su panel
        displayFileContent(file, contentPanel);

        // Activa la primera pestaña por defecto
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
        contentPanel.innerHTML = ''; // Limpia el panel por si acaso

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
