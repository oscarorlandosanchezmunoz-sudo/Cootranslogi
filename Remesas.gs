function getProximoIDRemesa() {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(30000)) {
      return "Error: No se pudo obtener lock, intente de nuevo.";
    }
    const hojaRemesas = getSheet('Remesas');
    if (!hojaRemesas) {
      throw new Error("No se encontró la hoja 'Remesas'. Revisa el nombre.");
    }
    const ultimaFila = hojaRemesas.getLastRow();
    const anioActual = new Date().getFullYear();
    if (ultimaFila < 2) { 
      return anioActual + '-0001';
    }
    const ultimoID = hojaRemesas.getRange(ultimaFila, 1).getValue(); 
    if (!ultimoID || typeof ultimoID !== 'string' || ultimoID.indexOf('-') === -1) {
      return anioActual + '-0001';
    }
    const partes = ultimoID.split('-');
    if (partes.length === 2 && partes[0] == anioActual) {
      let consecutivo = parseInt(partes[1], 10);
      if (isNaN(consecutivo)) { 
        return anioActual + '-0001';
      }
      consecutivo++; 
      return anioActual + '-' + consecutivo.toString().padStart(4, '0');
    } else {
      return anioActual + '-0001';
    }
  } catch (e) {
    Logger.log(e);
    return "Error: " + e.message; 
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function guardarRemesa(remesa) {
  try {
    const hojaRemesas = getSheet('Remesas');
    const nuevaFila = [
      remesa.IDRemesa,
      remesa.FechaRemesa,
      remesa.Planilla,
      remesa.FechaPlanilla,
      remesa.Placa,
      remesa.ApellidosConductor, 
      remesa.NombresConductor,   
      remesa.DireccionConductor, 
      remesa.TelefonoConductor,  
      remesa.Origen,
      remesa.Remitente,
      remesa.DireccionRemitente,
      remesa.TelefonoRemitente,
      remesa.Destino,
      remesa.Destinatario,
      remesa.DireccionDestinatario,
      remesa.TelefonoDestinatario,
      remesa.Horario,
      remesa.NotasDestino,
      remesa.Peso,
      remesa.Unidades,
      remesa.ValorFlete,
      remesa.ValorAsegurado,
      remesa.ValorSeguro,
      remesa.OtroValor,
      remesa.Total,
      remesa.ValorAnticipo,
      remesa.ValorContraentrega,
      remesa.Saldo
    ];
    hojaRemesas.appendRow(nuevaFila);
    return { status: 'success', message: 'Remesa ' + remesa.IDRemesa + ' guardada.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function buscarRemesa(idRemesa) {
  try {
    const hojaRemesas = getSheet('Remesas');
    const datos = hojaRemesas.getDataRange().getValues();
    const encabezados = datos[0]; 
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == idRemesa) { 
        const filaEncontrada = datos[i];
        const remesa = {};
        encabezados.forEach((columna, index) => {
          if(columna) {
             let valor = filaEncontrada[index];
             if ((columna === 'FechaRemesa' || columna === 'FechaPlanilla') && valor) {
               valor = new Date(valor).toISOString().split('T')[0];
             }
             remesa[columna] = valor;
          }
        });
        return { status: 'success', remesa: remesa };
      }
    }
    return { status: 'error', message: 'No se encontró ninguna remesa con el ID ' + idRemesa };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function actualizarRemesa(remesa) {
  try {
    const hojaRemesas = getSheet('Remesas');
    const datos = hojaRemesas.getDataRange().getValues();
    const encabezados = datos[0];
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == remesa.IDRemesa) { 
        const filaIndex = i + 1; 
        const filaActualizada = encabezados.map(col => remesa[col] || '');
        hojaRemesas.getRange(filaIndex, 1, 1, filaActualizada.length).setValues([filaActualizada]);
        return { status: 'success', message: 'Remesa ' + remesa.IDRemesa + ' actualizada.' };
      }
    }
    return { status: 'error', message: 'Error: No se pudo encontrar la remesa para actualizar.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getRemesasReporte(filtros) {
  try {
    const hojaRemesas = getSheet('Remesas');
    const datos = hojaRemesas.getDataRange().getValues();
    const resultados = [];
    const encabezados = datos[0];
    const iID = encabezados.indexOf('IDRemesa');
    const iFechaR = encabezados.indexOf('FechaRemesa');
    const iPlaca = encabezados.indexOf('Placa');
    const iOrigen = encabezados.indexOf('Origen');
    const iRemitente = encabezados.indexOf('Remitente');
    const iDestino = encabezados.indexOf('Destino');
    const iDestinatario = encabezados.indexOf('Destinatario');
    const iFlete = encabezados.indexOf('ValorFlete');
    const iAnticipo = encabezados.indexOf('ValorAnticipo');
    const iContraentrega = encabezados.indexOf('ValorContraentrega');
    const iSaldo = encabezados.indexOf('Saldo');
    const encabezadosInforme = [
      'ID Remesa', 'Fecha', 'Placa', 'Origen', 'Remitente', 
      'Destino', 'Destinatario', 'Flete', 'Anticipo', 'Contraentrega', 'Saldo'
    ];
    resultados.push(encabezadosInforme);
    let totalFletes = 0, totalAnticipos = 0, totalContraentregas = 0, totalSaldos = 0;
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const placa = fila[iPlaca];
      const origen = fila[iOrigen]; 
      const saldo = parseFloat(fila[iSaldo]) || 0;
      if (filtros.ciudad && filtros.ciudad !== origen) continue; 
      if (filtros.placa && filtros.placa !== placa) continue;
      if (filtros.estado === 'Abiertas' && saldo === 0) continue;
      if (filtros.estado === 'Cerradas' && saldo !== 0) continue;
      const fleteNum = parseFloat(fila[iFlete]) || 0;
      const anticipoNum = parseFloat(fila[iAnticipo]) || 0;
      const contraentregaNum = parseFloat(fila[iContraentrega]) || 0;
      resultados.push([
        fila[iID],
        new Date(fila[iFechaR]).toLocaleDateString(),
        placa,
        origen,
        fila[iRemitente],
        fila[iDestino],
        fila[iDestinatario],
        fleteNum.toLocaleString('es-CO'), 
        anticipoNum.toLocaleString('es-CO'),
        contraentregaNum.toLocaleString('es-CO'),
        saldo.toLocaleString('es-CO')
      ]);
      totalFletes += fleteNum;
      totalAnticipos += anticipoNum;
      totalContraentregas += contraentregaNum;
      totalSaldos += saldo;
    }
    resultados.push([
      'TOTALES', '', '', '', '', '', '',
      totalFletes.toLocaleString('es-CO'),
      totalAnticipos.toLocaleString('es-CO'),
      totalContraentregas.toLocaleString('es-CO'),
      totalSaldos.toLocaleString('es-CO')
    ]);
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
