// main.js
import { showNotification, setupDropZone, downloadFile, toggleMetadataForm, renderFilePreviews } from './ui.js';
import { createXmlFromCsv, createCsvFromXml } from './converters.js';

// Variable global para almacenar los archivos cargados.
let loadedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    try {
        const conversionForm = document.getElementById('conversion-form');
        setupDropZone('file-drop-zone', 'file-input', 'file-count-display', handleFilesLoad);
        if (conversionForm) {
            conversionForm.addEventListener('submit', handleConversionSubmit);
        }
        setDefaultDate();
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        showNotification("Error al cargar la aplicación. Revise la consola.", true);
    }
});

function setDefaultDate() {
    const dateInput = document.getElementById('meta-date');
    if (!dateInput) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
}

/**
 * Callback que se ejecuta cuando se cargan uno o varios archivos.
 * @param {FileList} files - La lista de archivos cargados.
 */
function handleFilesLoad(files) {
    if (!files || files.length === 0) return;

    loadedFiles = Array.from(files); // Convierte FileList a un array
    const convertButton = document.getElementById('convert-button');

    const containsCsv = loadedFiles.some(file => file.name.endsWith('.csv'));
    toggleMetadataForm(containsCsv);

    renderFilePreviews(loadedFiles);
    
    convertButton.disabled = false;
}

/**
 * Maneja la lógica principal cuando el usuario hace clic en "Convertir Archivos".
 * @param {Event} e - El evento del formulario.
 */
async function handleConversionSubmit(e) {
    e.preventDefault();
    if (loadedFiles.length === 0) {
        showNotification("Por favor, carga al menos un archivo primero.", true);
        return;
    }

    const button = document.getElementById('convert-button');
    const originalButtonText = button.textContent;
    button.disabled = true;
    button.textContent = 'Procesando...';

    const containsCsv = loadedFiles.some(file => file.name.endsWith('.csv'));
    let metadata = null;

    if (containsCsv) {
        const dateValue = document.getElementById('meta-date').value;
        const [year, month, day] = dateValue ? dateValue.split('-') : [null, null, null];
        metadata = {
            name: document.getElementById('meta-name').value,
            edition: document.getElementById('meta-edition').value,
            year, month, day,
            source: document.getElementById('meta-source').value,
        };
        if (Object.values(metadata).some(v => !v)) {
            showNotification("Todos los campos de metadatos son obligatorios para la conversión de CSV.", true);
            button.disabled = false;
            button.textContent = originalButtonText;
            return;
        }
    }

    showNotification(`Iniciando conversión de ${loadedFiles.length} archivo(s)...`);

    for (const file of loadedFiles) {
        try {
            const extension = file.name.split('.').pop().toLowerCase();
            const baseName = file.name.substring(0, file.name.lastIndexOf('.'));

            if (extension === 'csv') {
                const xmlContent = await createXmlFromCsv(file, metadata);
                downloadFile(`${baseName}.xml`, xmlContent, 'application/xml');
            } else if (extension === 'xml') {
                const csvContent = await createCsvFromXml(file);
                downloadFile(`${baseName}.csv`, csvContent, 'text/csv');
            }
            // Pequeña pausa para evitar que el navegador bloquee las descargas
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`Error convirtiendo ${file.name}:`, error);
            showNotification(`Error al convertir ${file.name}: ${error.message}`, true);
        }
    }
    
    showNotification('¡Todas las conversiones han finalizado!', false);
    button.disabled = false;
    button.textContent = originalButtonText;
}
