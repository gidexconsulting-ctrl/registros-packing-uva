# Registros del packing de uva de mesa

Registros de calidad e inocuidad (BPM, HACCP, GlobalG.A.P.) de una planta de empaque de uva de mesa, **desde la recepción hasta el embarque**.

**Página de presentación:** https://gidexconsulting-ctrl.github.io/registros-packing-uva/  
**App en línea:** https://gidexconsulting-ctrl.github.io/registros-packing-uva/app.html

## Contenido

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Portada: recorrido 3D por la nave de empaque que avanza con el scroll. «Iniciar» abre la app. |
| `app.html` | App web (la misma que `Registros_packing_uva.html`). Se abre en el celular o la computadora. |
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

**Secciones:** Panel · Registros · Trazabilidad · Cumplimiento · Historial · Reporte del día · Ajustes.

- **Panel de control:** indicadores con tendencia (hoy, 7 o 30 días), producción diaria recibida vs. exportable, destino de la fruta (exportable, descarte, merma), cadena de frío con rango objetivo, avance de los registros diarios, alertas y actividad reciente.
- **Trazabilidad:** escriba un lote, pallet o contenedor y vea su recorrido por las 8 etapas, con todos los registros vinculados.
- **Cumplimiento:** matriz mensual registro × día (como el formato físico), % de días completos y tablero de no conformidades abiertas y cerradas.
- **Reporte del día:** resumen de lotes, registros por etapa, cadena de frío, despachos y alertas, listo para imprimir o guardar en PDF con firmas.
- **Buscador rápido (Ctrl K):** abre cualquier registro, lote, pallet, contenedor o acción.
- **Datos de ejemplo:** dos semanas de registros para probar o capacitar (Ajustes); nunca se envían a Google Sheets.

- Llenado guiado por pasos: datos generales → mediciones → verificación → cierre → revisión.
- Llenado **a mano, por dictado de voz o con foto** del formato en papel (OCR), y escáner de códigos.
- Cálculos automáticos (peso neto, tiempos, % exportable) y alertas de rango; un NC abre la acción correctiva R-21.
- Funciona **sin señal**: guarda en el equipo y envía a Google Sheets cuando vuelve la conexión.
- Trazabilidad de cada dato (ALCOA+): usuario, fecha y hora, origen, firma, versión y motivo de corrección.

## Novedades para el trabajo en planta

- **App instalable** (Android: «Instalar» en Ajustes › Preferencias; iPhone: Compartir › Agregar a pantalla de inicio). Abre al instante y funciona sin señal.
- **Ahora toca:** el Panel muestra qué registros diarios están atrasados según la hora y su frecuencia.
- **Dictado guiado:** toque Dictar una vez; la app recorre cada campo, lo llena con la voz y avanza sola. Comandos: siguiente, atrás, pausa, borrar, guardar.
- **Borrador automático:** si se cierra el formulario, al volver ofrece continuar donde quedó.
- **Flujo encadenado:** al guardar un registro propone el siguiente del proceso (R-01 → R-02, R-07 → R-08, R-10 → R-11…) con lote, variedad, pallet o contenedor ya llenos.

## Acceso (usuario, contraseña y Google Authenticator)

- **Registrarse:** nombre, cargo, usuario y contraseña. Luego se escanea un **código QR con Google Authenticator** (o Microsoft Authenticator, Authy, etc.). Cada usuario recibe un secreto propio y aleatorio.
- **Ingresar:** usuario y contraseña, y luego el **código de 6 dígitos** que muestra Authenticator (cambia cada 30 s). «Recordar este equipo» evita pedirlo de nuevo.
- **¿Olvidó su contraseña?:** usuario + código de Authenticator → contraseña nueva.
- **Cambió de celular:** Ajustes › Cuenta › Google Authenticator (pide la contraseña y muestra un QR nuevo).
- Todo se guarda solo en el equipo (contraseña cifrada con PBKDF2). Es un bloqueo local de la app, no una autenticación de servidor.

## Conectar con Google Sheets

1. Cree una hoja de cálculo en Google Drive.
2. **Extensiones › Apps Script**: pegue `Codigo_AppsScript.gs` y guarde.
3. **Implementar › Nueva implementación › Aplicación web** (ejecutar como: Yo; acceso: Cualquier persona).
4. Copie la URL que termina en `/exec` y péguela en la app: **Ajustes › Conexión con Google Sheets › Probar conexión**.

> Los registros se guardan en el navegador de cada equipo y en **su** Google Sheets. Este repositorio no contiene datos.

Los límites de alerta son referenciales: ajústelos a las especificaciones del cliente, al plan HACCP y a los requisitos de SENASA y del país de destino.
