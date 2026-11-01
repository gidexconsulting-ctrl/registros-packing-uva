/**
 * REGISTROS DEL PACKING DE UVA DE MESA — receptor en Google Sheets
 * ------------------------------------------------------------------
 * Recibe los registros que envía la app "Registros_packing_uva.html" y los guarda
 * en una hoja de cálculo de Google: una pestaña por registro (R01…R21), con las
 * mismas columnas que los formatos del Excel, más columnas de auditoría.
 *
 * INSTALACIÓN (una sola vez):
 *  1. Cree una hoja de cálculo nueva en Google Drive (por ejemplo "Registros packing uva 2026").
 *  2. Menú Extensiones > Apps Script. Borre el contenido y pegue TODO este archivo. Guarde.
 *  3. Botón "Implementar" > "Nueva implementación" > tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier persona
 *     Autorice los permisos (Hojas de cálculo y Drive, para guardar las fotos).
 *  4. Copie la URL que termina en /exec y péguela en la app: Ajustes > URL de Apps Script > Probar conexión.
 *  5. Cada vez que modifique este código: Implementar > Gestionar implementaciones > editar > Versión nueva.
 *
 * Qué hace:
 *  - Crea la pestaña del registro si no existe (encabezado en la fila 1, congelado).
 *  - Si el ID del registro ya existe, ACTUALIZA la fila (corrección) y guarda el valor anterior en "Auditoría".
 *  - Guarda fotos de evidencia y firmas como imágenes en la carpeta de Drive "Evidencias packing uva" y deja el enlace.
 *  - Usa LockService para que varios celulares puedan enviar a la vez sin pisarse.
 */

const CARPETA_EVIDENCIAS = 'Evidencias packing uva';
const META = ['ID registro', 'Versión', 'Registrado por', 'Rol', 'Fecha-hora de registro', 'Recibido en servidor',
  'Origen de datos', 'Dispositivo', 'Ubicación (lat, long)', 'Alertas', 'Fotos de evidencia', 'Firma', 'Motivo de corrección'];

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'list' && p.sheet) {
    const sh = libro_().getSheetByName(p.sheet);
    if (!sh || sh.getLastRow() < 2) return json_({ ok: true, rows: [] });
    const n = Math.min(Number(p.n || 50), sh.getLastRow() - 1);
    const data = sh.getRange(sh.getLastRow() - n + 1, 1, n, sh.getLastColumn()).getDisplayValues();
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
    return json_({ ok: true, headers: head, rows: data });
  }
  return json_({ ok: true, app: 'Registros packing uva de mesa', libro: libro_().getName(), hora: new Date() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const body = JSON.parse(e.postData.contents);
    const recs = body.records || (body.record ? [body.record] : []);
    const results = recs.map(guardar_);
    return json_({ ok: true, results: results });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function guardar_(r) {
  const ss = libro_();
  const headers = r.headers.concat(META);
  let sh = ss.getSheetByName(r.sheet);
  if (!sh) {
    sh = ss.insertSheet(r.sheet);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#5B2C6F')
      .setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 48);
    sh.setColumnWidths(1, headers.length, 120);
    // formato de columnas de fecha
    (r.types || []).forEach(function (t, i) {
      if (t === 'date') sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1).setNumberFormat('dd/mm/yyyy');
    });
    sh.getRange(2, r.headers.length + 5, sh.getMaxRows() - 1, 2).setNumberFormat('dd/mm/yyyy hh:mm');
  }

  const vals = r.values.map(function (v, i) { return convertir_(v, (r.types || [])[i]); });
  const m = r.meta || {};
  const fotos = (r.photos || []).map(function (p, i) { return guardarImagen_(p, r.id + '_foto' + (i + 1)); }).join('\n');
  const firma = r.signature ? guardarImagen_(r.signature, r.id + '_firma') : '';
  const fila = vals.concat([
    r.id, r.version || 1, m.user || '', m.role || '',
    m.created ? new Date(m.created) : new Date(), new Date(),
    (m.origin || ['manual']).join(', '), m.device || '', m.geo || '',
    (r.alerts || []).join(' | '), fotos, firma, r.motivo || ''
  ]);

  const colId = r.headers.length + 1;
  let filaExistente = 0;
  if (sh.getLastRow() > 1) {
    const hit = sh.getRange(2, colId, sh.getLastRow() - 1, 1).createTextFinder(r.id).matchEntireCell(true).findNext();
    if (hit) filaExistente = hit.getRow();
  }

  let accion;
  if (filaExistente) {
    const rango = sh.getRange(filaExistente, 1, 1, fila.length);
    const antes = rango.getDisplayValues()[0];
    // si la corrección no trae fotos/firma nuevas, conservar las anteriores
    if (!fotos) fila[fila.length - 3] = antes[fila.length - 3];
    if (!firma) fila[fila.length - 2] = antes[fila.length - 2];
    fila[r.headers.length + 4] = sh.getRange(filaExistente, r.headers.length + 5).getValue(); // fecha de registro original
    rango.setValues([fila]);
    accion = 'actualizado';
    auditar_(r, accion, JSON.stringify(antes.slice(0, r.headers.length)));
  } else {
    sh.appendRow(fila);
    accion = 'creado';
    auditar_(r, accion, '');
  }
  return { id: r.id, action: accion };
}

function convertir_(v, t) {
  if (v === null || v === undefined || v === '') return '';
  if (t === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const p = v.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  if ((t === 'int' || t === 'dec' || t === 'calc') && typeof v === 'number') return v;
  if (t === 'time') return "'" + v; // se guarda como texto HH:MM
  return v;
}

function guardarImagen_(dataUrl, nombre) {
  try {
    const m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) return '';
    const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nombre + '.' + m[1].split('/')[1]);
    return carpeta_().createFile(blob).getUrl();
  } catch (err) {
    return 'Error al guardar imagen: ' + err;
  }
}

function carpeta_() {
  const it = DriveApp.getFoldersByName(CARPETA_EVIDENCIAS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_EVIDENCIAS);
}

function auditar_(r, accion, antes) {
  const ss = libro_();
  let a = ss.getSheetByName('Auditoría');
  if (!a) {
    a = ss.insertSheet('Auditoría');
    a.appendRow(['Fecha-hora', 'Acción', 'Registro', 'ID', 'Versión', 'Usuario', 'Motivo', 'Valores anteriores']);
    a.getRange(1, 1, 1, 8).setFontWeight('bold').setFontColor('#ffffff').setBackground('#4E7A3A');
    a.setFrozenRows(1);
  }
  a.appendRow([new Date(), accion, r.sheet, r.id, r.version || 1, (r.meta || {}).user || '', r.motivo || '', antes]);
}

function libro_() {
  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (activo) return activo;
  // Si el script no está vinculado a una hoja, escriba el ID en Propiedades del proyecto: SHEET_ID
  return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Menú en la hoja de cálculo */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Packing uva')
    .addItem('Ordenar pestañas R01…R21', 'ordenarPestanas')
    .addToUi();
}

function ordenarPestanas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojas = ss.getSheets().map(function (s) { return s.getName(); }).sort();
  hojas.forEach(function (n, i) { ss.setActiveSheet(ss.getSheetByName(n)); ss.moveActiveSheet(i + 1); });
}
