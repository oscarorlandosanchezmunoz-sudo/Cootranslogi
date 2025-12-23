function guardarVehiculo(vehiculo) {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === vehiculo.placa) { 
        return { status: 'error', message: 'La placa ' + vehiculo.placa + ' ya existe.' };
      }
    }
    const nuevaFila = [
      vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.linea, vehiculo.color,
      vehiculo.tipoCarroceria, vehiculo.soat, vehiculo.tecnomecanica, vehiculo.capacidad,
      vehiculo.urlSatelital, vehiculo.usuarioSatelital, vehiculo.claveSatelital, vehiculo.estado,
      vehiculo.propietario1Id, vehiculo.propietario1Nombres, vehiculo.propietario1Apellidos,
      vehiculo.propietario1Empresa, vehiculo.propietario1Direccion, vehiculo.propietario1Celular,
      vehiculo.propietario1Email,
      vehiculo.propietario2Id, vehiculo.propietario2Nombres, vehiculo.propietario2Apellidos,
      vehiculo.propietario2Empresa, vehiculo.propietario2Direccion, vehiculo.propietario2Celular,
      vehiculo.propietario2Email
    ];
    hojaVehiculos.appendRow(nuevaFila);
    return { status: 'success', message: 'Vehículo ' + vehiculo.placa + ' guardado con éxito.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function buscarVehiculo(placa) {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === placa) { 
        const filaEncontrada = hojaVehiculos.getRange(i + 1, 1, 1, 27).getValues()[0];
        const vehiculo = {
          placa: filaEncontrada[0],
          marca: filaEncontrada[1],
          modelo: filaEncontrada[2],
          linea: filaEncontrada[3],
          color: filaEncontrada[4],
          tipoCarroceria: filaEncontrada[5],
          soat: new Date(filaEncontrada[6]).toISOString().split('T')[0],
          tecnomecanica: new Date(filaEncontrada[7]).toISOString().split('T')[0],
          capacidad: filaEncontrada[8],
          urlSatelital: filaEncontrada[9],
          usuarioSatelital: filaEncontrada[10],
          claveSatelital: filaEncontrada[11],
          estado: filaEncontrada[12],
          propietario1Id: filaEncontrada[13],
          propietario1Nombres: filaEncontrada[14],
          propietario1Apellidos: filaEncontrada[15],
          propietario1Empresa: filaEncontrada[16],
          propietario1Direccion: filaEncontrada[17],
          propietario1Celular: filaEncontrada[18],
          propietario1Email: filaEncontrada[19],
          propietario2Id: filaEncontrada[20],
          propietario2Nombres: filaEncontrada[21],
          propietario2Apellidos: filaEncontrada[22],
          propietario2Empresa: filaEncontrada[23],
          propietario2Direccion: filaEncontrada[24],
          propietario2Celular: filaEncontrada[25],
          propietario2Email: filaEncontrada[26]
        };
        return { status: 'success', vehiculo: vehiculo };
      }
    }
    return { status: 'error', message: 'No se encontró ningún vehículo con la placa ' + placa };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function actualizarVehiculo(vehiculo) {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === vehiculo.placa) { 
        const filaIndex = i + 1;
        const filaActualizada = [
          vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.linea, vehiculo.color,
          vehiculo.tipoCarroceria, vehiculo.soat, vehiculo.tecnomecanica, vehiculo.capacidad,
          vehiculo.urlSatelital, vehiculo.usuarioSatelital, vehiculo.claveSatelital, vehiculo.estado,
          vehiculo.propietario1Id, vehiculo.propietario1Nombres, vehiculo.propietario1Apellidos,
          vehiculo.propietario1Empresa, vehiculo.propietario1Direccion, vehiculo.propietario1Celular,
          vehiculo.propietario1Email,
          vehiculo.propietario2Id, vehiculo.propietario2Nombres, vehiculo.propietario2Apellidos,
          vehiculo.propietario2Empresa, vehiculo.propietario2Direccion, vehiculo.propietario2Celular,
          vehiculo.propietario2Email
        ];
        hojaVehiculos.getRange(filaIndex, 1, 1, filaActualizada.length).setValues([filaActualizada]);
        return { status: 'success', message: 'Vehículo ' + vehiculo.placa + ' actualizado.' };
      }
    }
    return { status: 'error', message: 'Error: No se pudo encontrar la placa para actualizar.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getVehiculosReporte(filtros) {
  try {
    const hojaVehiculos = getSheet('Vehiculos');
    const datos = hojaVehiculos.getDataRange().getValues();
    const resultados = [];
    const encabezados = [
      datos[0][12], // Estado
      datos[0][0],  // Placa
      datos[0][2],  // Modelo
      datos[0][5],  // Tipo de Carrocería
      datos[0][8],  // Capacidad
      datos[0][6],  // SOAT
      datos[0][7]   // Tecnomecánica
    ];
    resultados.push(encabezados);
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const estado = fila[12];
      const modelo = fila[2];
      const tipoCarroceria = fila[5];
      const capacidad = fila[8];
      if (filtros.estado && filtros.estado !== estado) continue;
      if (filtros.modelo && filtros.modelo !== modelo) continue;
      if (filtros.tipoCarroceria && filtros.tipoCarroceria !== tipoCarroceria) continue;
      if (filtros.capacidad && filtros.capacidad !== capacidad) continue;
      resultados.push([
        estado,
        fila[0], 
        modelo,
        tipoCarroceria,
        capacidad,
        new Date(fila[6]).toLocaleDateString(), 
        new Date(fila[7]).toLocaleDateString()
      ]);
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

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
    const urlDescarga = url.replace("/edit", "/export?format=xlsx");
    ScriptApp.newTrigger('borrarHojaTemporal').timeBased().after(10 * 60 * 1000).create();
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
