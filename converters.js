// converters.js

// --- CLASES DE ESTRUCTURA DE DATOS ---
class DataElement {
    constructor(id, name, description, level) {
        this.id = id || "";
        this.name = name || "";
        this.description = description || "";
        this.level = level || 0;
    }
}

class TreeNode {
    constructor(data) {
        this.data = data;
        this.children = [];
    }
    addChild(childNode) {
        this.children.push(childNode);
    }
}

// --- LÓGICA DE CONVERSIÓN: CSV -> XML ---

/**
 * **FUNCIÓN CORREGIDA Y ROBUSTA**
 * Parsea un string en formato CSV a un array de arrays, manejando correctamente
 * los campos entre comillas y los campos vacíos.
 * @param {string} csvText - El contenido del archivo CSV.
 * @returns {string[][]} - Un array de filas, donde cada fila es un array de celdas.
 */
export function parseCsv(csvText) {
    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    const result = [];
    // Expresión regular robusta para parsear CSV.
    const regex = /("((?:[^"]|"")*)"|([^,]*))(,|$)/g;

    for (const line of lines) {
        const row = [];
        let match;
        // Resetea el índice de la regex para cada nueva línea.
        regex.lastIndex = 0;
        
        while (match = regex.exec(line)) {
            let value;
            // El grupo 1 captura el campo completo (con comillas si las hay).
            // El grupo 2 captura el contenido DENTRO de las comillas.
            // El grupo 3 captura el campo si NO tiene comillas.
            if (match[1].startsWith('"') && match[1].endsWith('"')) {
                // Campo con comillas: usa el grupo 2 y escapa las comillas dobles.
                value = (match[2] || "").replace(/""/g, '"');
            } else {
                value = match[1]; // Campo sin comillas
            }
            row.push(value.trim());
            // Si el delimitador es el final de la línea, hemos terminado con esta fila.
            if (match[4] === '') break;
        }
        result.push(row);
    }
    return result;
}


function getAllRowsFromCsv(rows) {
    const elements = [];
    // Empezar desde la segunda fila para saltar la cabecera
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const elementData = new DataElement(row[0], row[1], row[2], row[3]);
        elements.push(new TreeNode(elementData));
    }
    return elements;
}

function createTree(root, elements) {
    if (elements.length === 0) return root;
    const stack = [root];
    for (const elementNode of elements) {
        let topOfStack = stack[stack.length - 1];
        while (stack.length > 1 && elementNode.data.level <= topOfStack.data.level) {
            stack.pop();
            topOfStack = stack[stack.length - 1];
        }
        topOfStack.addChild(elementNode);
        stack.push(elementNode);
    }
    return root;
}

function createXMLTree(doc, parentElement, nodes) {
    nodes.forEach(node => {
        const itemElement = doc.createElement("Item");
        const createTextElement = (parent, name, text) => {
            const el = doc.createElement(name);
            el.textContent = text != null ? String(text) : "";
            parent.appendChild(el);
        };
        createTextElement(itemElement, "ID", node.data.id);
        createTextElement(itemElement, "Name", node.data.name);
        createTextElement(itemElement, "Description", node.data.description);
        if (node.children.length > 0) {
            const childrenElement = doc.createElement("Children");
            createXMLTree(doc, childrenElement, node.children);
            itemElement.appendChild(childrenElement);
        }
        parentElement.appendChild(itemElement);
    });
}

function createNewXMLFile(rootNode, metadata) {
    const doc = document.implementation.createDocument(null, "BuildingInformation", null);
    const classification = doc.createElement("Classification");
    const system = doc.createElement("System");
    classification.appendChild(system);
    const createTextElement = (parent, name, text) => {
        const el = doc.createElement(name);
        el.textContent = text || "";
        parent.appendChild(el);
    };
    createTextElement(system, "Name", metadata.name);
    createTextElement(system, "EditionVersion", metadata.edition);
    const editionDate = doc.createElement("EditionDate");
    createTextElement(editionDate, "Year", metadata.year);
    createTextElement(editionDate, "Month", metadata.month);
    createTextElement(editionDate, "Day", metadata.day);
    system.appendChild(editionDate);
    createTextElement(system, "Description", "");
    createTextElement(system, "Source", metadata.source);
    const items = doc.createElement("Items");
    createXMLTree(doc, items, rootNode.children);
    system.appendChild(items);
    doc.documentElement.appendChild(classification);
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(doc);
    const formattedXml = formatXml(xmlString);
    return '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n' + formattedXml;
}

export async function createXmlFromCsv(file, metadata) {
    const csvText = await file.text();
    const rows = parseCsv(csvText);
    const elements = getAllRowsFromCsv(rows);
    const rootNode = new TreeNode(new DataElement('0', "Classification Root", null, 0));
    createTree(rootNode, elements);
    return createNewXMLFile(rootNode, metadata);
}

// --- LÓGICA DE CONVERSIÓN: XML -> CSV ---

export async function createCsvFromXml(file) {
    const xmlString = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const items = xmlDoc.querySelectorAll("BuildingInformation > Classification > System > Items > Item");
    const data = [["ID", "Name", "Description", "Level"]];
    function traverseItems(itemsNodeList, level) {
        itemsNodeList.forEach(item => {
            const id = item.querySelector("ID")?.textContent || "";
            const name = item.querySelector("Name")?.textContent || "";
            const description = item.querySelector("Description")?.textContent || "";
            data.push([id, name, description, level]);
            const childrenContainer = item.querySelector(":scope > Children");
            if (childrenContainer) {
                const childItems = childrenContainer.querySelectorAll(":scope > Item");
                traverseItems(childItems, level + 1);
            }
        });
    }
    traverseItems(items, 1);
    return data.map(row =>
        row.map(cell => {
            const strCell = String(cell || '');
            if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        }).join(',')
    ).join('\n');
}

// --- FUNCIONES AUXILIARES ---

function formatXml(xml) {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    xml = xml.replace(reg, '$1\r\n$2$3');
    return xml.split('\r\n').map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1;
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        }
        const padding = Array(pad + 1).join(PADDING);
        pad += indent;
        return padding + node;
    }).join('\r\n');
}
