// MÓDULO: Informes
// Funciones relacionadas con generación de archivos temporales y reportes de vencimientos.

function generarExcelVehiculos(datos) {
  try {
    const anio = new Date().getFullYear();
    const mes = new Date().getMonth() + 1;
    const dia = new Date().getDate();
    const nombreArchivo = 'Informe_Vehiculos_' + anio + '-' + mes + '-' + dia;
    const hojaTemporal = SpreadsheetApp.create(nombreArchivo);
    const hoja = hojaTemporal.getSheets()[0];
    hoja.getRange(1, 1, datos.length, datos[0].length).setValues(datos);
    const url = hojaTemporal.getUrl();
    const id = hojaTemporal.getId();
    const urlDescarga = url.replace('/edit', '/export?format=xlsx');
    ScriptApp.newTrigger('borrarHojaTemporal')
      .timeBased()
      .after(10 * 60 * 1000) // 10 minutos
      .create();
    PropertiesService.getScriptProperties().setProperty('archivoTemporalID', id);
    return { status: 'success', url: urlDescarga };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error al crear el archivo: ' + e.message };
  }
}

function borrarHojaTemporal() {
  try {
    const id = PropertiesService.getScriptProperties().getProperty('archivoTemporalID');
    if (id) {
      const archivo = DriveApp.getFileById(id);
      archivo.setTrashed(true);
      PropertiesService.getScriptProperties().deleteProperty('archivoTemporalID');
    }
  } catch (e) {
    Logger.log('Error al borrar archivo temporal: ' + e.message);
  }
}

function getVencimientosSOAT() {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    const resultados = [];
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    resultados.push(['Placa', 'Marca', 'Modelo', 'Propietario', 'Teléfono', 'Fecha Venc. SOAT']);
    const iPlaca = datos[0].indexOf('Placa');
    const iMarca = datos[0].indexOf('Marca');
    const iModelo = datos[0].indexOf('Modelo');
    const iPropNombre = datos[0].indexOf('Prop1_Nombres');
    const iPropTel = datos[0].indexOf('Prop1_CelularWA');
    const iSOAT = datos[0].indexOf('SOAT');
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const fechaSOAT = new Date(fila[iSOAT]);
      if (fechaSOAT.getMonth() === mesActual && fechaSOAT.getFullYear() === anioActual) {
        resultados.push([
          fila[iPlaca],
          fila[iMarca],
          fila[iModelo],
          fila[iPropNombre],
          fila[iPropTel],
          fechaSOAT.toLocaleDateString()
        ]);
      }
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getVencimientosTecno() {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    const resultados = [];
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    resultados.push(['Placa', 'Marca', 'Modelo', 'Propietario', 'Teléfono', 'Fecha Venc. Tecno']);
    const iPlaca = datos[0].indexOf('Placa');
    const iMarca = datos[0].indexOf('Marca');
    const iModelo = datos[0].indexOf('Modelo');
    const iPropNombre = datos[0].indexOf('Prop1_Nombres');
    const iPropTel = datos[0].indexOf('Prop1_CelularWA');
    const iTecno = datos[0].indexOf('Tecnomecanica');
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const fechaTecno = new Date(fila[iTecno]);
      if (fechaTecno.getMonth() === mesActual && fechaTecno.getFullYear() === anioActual) {
        resultados.push([
          fila[iPlaca],
          fila[iMarca],
          fila[iModelo],
          fila[iPropNombre],
          fila[iPropTel],
          fechaTecno.toLocaleDateString()
        ]);
      }
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getVencimientosLicencias() {
  try {
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    const resultados = [];
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    resultados.push(['Cédula', 'Nombres', 'Apellidos', 'Teléfono', 'Placa', 'Fecha Venc. Licencia']);
    const iCedula = datos[0].indexOf('Cedula');
    const iNombres = datos[0].indexOf('Nombres');
    const iApellidos = datos[0].indexOf('Apellidos');
    const iTelefono = datos[0].indexOf('TelefonoPrincipal');
    const iPlaca = datos[0].indexOf('Placa');
    const iFechaVenc = datos[0].indexOf('FechaVencimiento');
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const fechaVenc = new Date(fila[iFechaVenc]);
      if (fechaVenc.getMonth() === mesActual && fechaVenc.getFullYear() === anioActual) {
        resultados.push([
          fila[iCedula],
          fila[iNombres],
          fila[iApellidos],
          fila[iTelefono],
          fila[iPlaca],
          fechaVenc.toLocaleDateString()
        ]);
      }
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
