function guardarConductor(conductor) {
  try {
    const columnas = [
      'Cedula', 'Apellidos', 'Nombres', 'DireccionResidencia', 'CiudadResidencia', 
      'TelefonoPrincipal', 'TelefonoSecundario', 'Email', 'GrupoSanguineo', 'EPS', 'ARL', 
      'CajaDeCompensacion', 'LicenciaDeConduccion', 'Categoria', 'FechaVencimiento', 'Placa', 'Estado',
      'Banco', 'TipoCuenta', 'Numero',
      'Contacto1NombresApellidos', 'Contacto1Telefono', 'Contacto1Notas',
      'Contacto2NombresApellidos', 'Contacto2Telefono', 'Contacto2Notas',
      'Referencia1NombresApellidos', 'Referencia1Telefono', 'Referencia1Notas'
    ];
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == conductor.Cedula) { 
        return { status: 'error', message: 'La cédula ' + conductor.Cedula + ' ya existe.' };
      }
    }
    const nuevaFila = columnas.map(col => conductor[col] || ''); 
    hojaConductores.appendRow(nuevaFila);
    return { status: 'success', message: 'Conductor ' + conductor.Nombres + ' guardado con éxito.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function buscarConductor(cedula) {
  try {
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    const columnas = datos[0]; 
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == cedula) { 
        const filaEncontrada = datos[i];
        const conductor = {};
        columnas.forEach((columna, index) => {
          let valor = filaEncontrada[index];
          if (columna === 'FechaVencimiento' && valor) {
            valor = new Date(valor).toISOString().split('T')[0];
          }
          conductor[columna] = valor;
        });
        return { status: 'success', conductor: conductor };
      }
    }
    return { status: 'error', message: 'No se encontró ningún conductor con la cédula ' + cedula };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function actualizarConductor(conductor) {
  try {
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    const columnas = datos[0];
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == conductor.Cedula) { 
        const filaIndex = i + 1; 
        const filaActualizada = columnas.map(col => conductor[col] || '');
        hojaConductores.getRange(filaIndex, 1, 1, filaActualizada.length).setValues([filaActualizada]);
        return { status: 'success', message: 'Conductor ' + conductor.Nombres + ' actualizado.' };
      }
    }
    return { status: 'error', message: 'Error: No se pudo encontrar la cédula para actualizar.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getConductoresReporte(filtros) {
  try {
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    const resultados = [];
    const encabezados = datos[0];
    const iEstado = encabezados.indexOf('Estado');
    const iPlaca = encabezados.indexOf('Placa');
    const iCedula = encabezados.indexOf('Cedula');
    const iApellidos = encabezados.indexOf('Apellidos');
    const iNombres = encabezados.indexOf('Nombres');
    const iTelefono = encabezados.indexOf('TelefonoPrincipal');
    const iFechaVenc = encabezados.indexOf('FechaVencimiento');
    const iBanco = encabezados.indexOf('Banco');
    const iTipoCuenta = encabezados.indexOf('TipoCuenta');
    const encabezadosInforme = [
      'Estado', 'Placa', 'Cédula', 'Apellidos', 'Nombres', 
      'Teléfono Principal', 'Venc. Licencia', 'Banco', 'Tipo de Cuenta'
    ];
    resultados.push(encabezadosInforme);
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const estado = fila[iEstado];
      const placa = fila[iPlaca];
      const banco = fila[iBanco];
      const tipoCuenta = fila[iTipoCuenta];
      if (filtros.estado && filtros.estado !== estado) continue;
      if (filtros.placa && filtros.placa !== placa) continue;
      if (filtros.banco && filtros.banco !== banco) continue;
      if (filtros.tipoCuenta && filtros.tipoCuenta !== tipoCuenta) continue;
      resultados.push([
        estado,
        placa,
        fila[iCedula],
        fila[iApellidos],
        fila[iNombres],
        fila[iTelefono],
        fila[iFechaVenc] ? new Date(fila[iFechaVenc]).toLocaleDateString() : '', 
        banco,
        tipoCuenta
      ]);
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getDatosVehiculoConductor(placa) {
  try {
    const hojaConductores = getSheet('Conductores');
    const datos = hojaConductores.getDataRange().getValues();
    const encabezados = datos[0];
    const iPlaca = encabezados.indexOf('Placa');
    const iApellidos = encabezados.indexOf('Apellidos');
    const iNombres = encabezados.indexOf('Nombres');
    const iDireccion = encabezados.indexOf('DireccionResidencia');
    const iTelefono = encabezados.indexOf('TelefonoPrincipal');
    if (iPlaca === -1) {
      return { status: 'error', message: "No se encontró la columna 'Placa' en la hoja Conductores."};
    }
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][iPlaca] === placa) {
        const conductor = {
          Apellidos: datos[i][iApellidos],
          Nombres: datos[i][iNombres],
          Direccion: datos[i][iDireccion],
          Telefono: datos[i][iTelefono]
        };
        return { status: 'success', data: conductor };
      }
    }
    return { status: 'error', message: 'Placa no encontrada o sin conductor asignado.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
