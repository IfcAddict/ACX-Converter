# **ACX Converter (Archicad Classification Exchanger)**

**ACX Converter** es una herramienta web diseñada específicamente para facilitar la edición y gestión de los **Sistemas de Clasificación de Archicad**. La aplicación permite convertir los complejos archivos XML de clasificación de Archicad a un formato CSV fácil de editar, y viceversa, funcionando completamente en el navegador sin necesidad de un backend.

Esta herramienta permite procesar múltiples archivos de clasificación simultáneamente, ofreciendo una previsualización instantánea de cada uno en un sistema de pestañas antes de realizar la conversión final.

## **Funcionalidad Principal**

* **Conversión XML a CSV:** Transforma un archivo de **Clasificación de Archicad (.xml)** a un formato **CSV**. Esto permite editar masivamente las clasificaciones (IDs, nombres, descripciones) de forma rápida y sencilla en cualquier programa de hoja de cálculo.  
* **Conversión CSV a XML:** Vuelve a convertir el archivo **CSV editado** al formato **XML** original que Archicad puede importar, respetando la estructura jerárquica anidada.  
* **Procesamiento en Lote:** Permite cargar y convertir varios sistemas de clasificación a la vez.  
* **Interfaz Intuitiva:** Utiliza una zona de "arrastrar y soltar" (drag & drop) para una carga de archivos sencilla.  
* **Previsualización Dinámica:** Muestra el contenido de los archivos cargados en pestañas. Los archivos CSV se visualizan como tablas formateadas para una fácil revisión de los datos.  
* **Metadatos Configurables:** Permite definir los metadatos del sistema de clasificación (nombre, versión, fecha, etc.) al generar el archivo XML final.

## **Cómo Usar**

1. **Exportar de Archicad:** Primero, exporta tu Sistema de Clasificación desde Archicad (el resultado será un archivo .xml).  
2. **Cargar Archivo(s):** Arrastra y suelta el archivo .xml (o varios) en la zona de carga.  
3. **Convertir a CSV:** Haz clic en "Convertir Archivos". La aplicación generará y descargará una versión .csv de tu sistema de clasificación.  
4. **Editar el CSV:** Abre el archivo .csv en tu programa de hoja de cálculo preferido y realiza las modificaciones que necesites.  
5. **Cargar el CSV Modificado:** Vuelve a la aplicación y carga el archivo .csv que acabas de editar.  
6. **Completar Metadatos:** Rellena los datos del sistema de clasificación para generar el nuevo XML.  
7. **Convertir a XML:** Haz clic en "Convertir Archivos" para obtener el .xml final, listo para ser importado de nuevo en Archicad.

## **Agradecimientos y Base del Proyecto**

La lógica de conversión y la estructura jerárquica de esta aplicación están basadas en el excelente trabajo del proyecto **EXCEL2XML** de **KhaledKammoun**. Este proyecto sirvió como inspiración y punto de partida fundamental.

Puedes encontrar el repositorio original aquí:  
https://github.com/KhaledKammoun/EXCEL2XML

## **Licencia**

Este proyecto se distribuye bajo los términos de la Licencia GPLv3. Consulta el archivo LICENSE para más detalles.