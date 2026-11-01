# Registros del packing de uva de mesa

Registros de calidad e inocuidad (BPM, HACCP, GlobalG.A.P.) de una planta de empaque de uva de mesa, **desde la recepción hasta el embarque**.

**App en línea:** https://gidexconsulting-ctrl.github.io/registros-packing-uva/

## Contenido

| Archivo | Para qué sirve |
|---|---|
| `index.html` | App web (la misma que `Registros_packing_uva.html`). Se abre en el celular o la computadora. |
| `Codigo_AppsScript.gs` | Código para Google Sheets: recibe los registros de la app y los guarda en una pestaña por registro. |
| `Registros_packing_uva_de_mesa.xlsx` | Formatos físicos para imprimir (R-01 a R-21), uno por hoja, para un mes. |

## Registros incluidos

1. **Recepción**: R-01 Recepción de materia prima · R-02 Calidad en recepción
2. **Fumigación**: R-03 Fumigación con SO₂
3. **Cámara de espera**: R-04 Temperatura en cámara de espera
4. **Embalaje**: R-05 Control en línea · R-06 Calidad de producto terminado
5. **Paletizado**: R-07 Paletizado y armado de pallets
6. **Prefrío**: R-08 Prefrío en túnel
7. **Almacenamiento**: R-09 Cámara de producto terminado
8. **Embarque**: R-10 Inspección de contenedor · R-11 Carga y despacho

Trazabilidad y control: R-12 Trazabilidad · R-13 Descarte y mermas · R-21 Acciones correctivas
Soporte y BPM: R-14 Materiales de empaque · R-15 Limpieza y desinfección · R-16 Higiene del personal · R-17 Cloro en agua · R-18 Control de plagas · R-19 Vidrios y plásticos · R-20 Calibración de equipos

## Funciones de la app

- Llenado guiado por pasos: datos generales → mediciones → verificación → cierre → revisión.
- Llenado **a mano, por dictado de voz o con foto** del formato en papel (OCR), y escáner de códigos.
- Cálculos automáticos (peso neto, tiempos, % exportable) y alertas de rango; un NC abre la acción correctiva R-21.
- Funciona **sin señal**: guarda en el equipo y envía a Google Sheets cuando vuelve la conexión.
- Trazabilidad de cada dato (ALCOA+): usuario, fecha y hora, origen, firma, versión y motivo de corrección.

## Conectar con Google Sheets

1. Cree una hoja de cálculo en Google Drive.
2. **Extensiones › Apps Script**: pegue `Codigo_AppsScript.gs` y guarde.
3. **Implementar › Nueva implementación › Aplicación web** (ejecutar como: Yo; acceso: Cualquier persona).
4. Copie la URL que termina en `/exec` y péguela en la app: **Ajustes › Conexión con Google Sheets › Probar conexión**.

> Los registros se guardan en el navegador de cada equipo y en **su** Google Sheets. Este repositorio no contiene datos.

Los límites de alerta son referenciales: ajústelos a las especificaciones del cliente, al plan HACCP y a los requisitos de SENASA y del país de destino.
