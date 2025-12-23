function guardarCliente(cliente) {
  try {
    const hojaClientes = getSheet('Clientes');
    const datos = hojaClientes.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][1] == cliente.Numero) { 
        return { status: 'error', message: 'El cliente con documento ' + cliente.Numero + ' ya existe.' };
      }
    }
    const nuevaFila = [
      cliente.TipoDocumento, cliente.Numero, cliente.Nombres, cliente.Apellidos, cliente.Ciudad, cliente.DireccionPrincipal, cliente.Horario,
      cliente.ContactoPrincipal, cliente.TelefonoPrincipal, cliente.EmailPrincipal, cliente.NotasPrincipal,
      cliente.ContactoDespachos, cliente.TelefonoDespachos, cliente.EmailDespachos, cliente.NotasDespachos,
      cliente.ContactoFacturacion, cliente.TelefonoFacturacion, cliente.EmailFacturacion, cliente.NotasFacturacion,
      cliente.ContactoPagos, cliente.TelefonoPagos, cliente.EmailPagos, cliente.NotasPagos
    ];
    hojaClientes.appendRow(nuevaFila.flat());
    return { status: 'success', message: 'Cliente ' + cliente.Nombres + ' guardado con éxito.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function buscarCliente(numeroDocumento) {
  try {
    const hojaClientes = getSheet('Clientes');
    const datos = hojaClientes.getDataRange().getValues();
    const encabezados = datos[0]; 
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][1] == numeroDocumento) { 
        const filaEncontrada = datos[i];
        const cliente = {};
        encabezados.forEach((columna, index) => {
          if(columna) { 
             cliente[columna] = filaEncontrada[index];
          }
        });
        return { status: 'success', cliente: cliente };
      }
    }
    return { status: 'error', message: 'No se encontró ningún cliente con el documento ' + numeroDocumento };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function actualizarCliente(cliente) {
  try {
    const hojaClientes = getSheet('Clientes');
    const datos = hojaClientes.getDataRange().getValues();
    const encabezados = datos[0];
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][1] == cliente.Numero) { 
        const filaIndex = i + 1; 
        const filaActualizada = encabezados.map(col => cliente[col] || '');
        hojaClientes.getRange(filaIndex, 1, 1, filaActualizada.length).setValues([filaActualizada]);
        return { status: 'success', message: 'Cliente ' + cliente.Nombres + ' actualizado.' };
      }
    }
    return { status: 'error', message: 'Error: No se pudo encontrar el cliente para actualizar.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function getClientesReporte(filtros) {
  try {
    const hojaClientes = getSheet('Clientes');
    const datos = hojaClientes.getDataRange().getValues();
    const resultados = [];
    const encabezados = datos[0];
    const iCiudad = encabezados.indexOf('Ciudad');
    const iNombres = encabezados.indexOf('Nombres');
    const iNumero = encabezados.indexOf('Numero');
    const iContactoP = encabezados.indexOf('ContactoPrincipal');
    const iDireccionP = encabezados.indexOf('DireccionPrincipal');
    const iTelefonoP = encabezados.indexOf('TelefonoPrincipal');
    const iHorario = encabezados.indexOf('Horario');
    const iNotasP = encabezados.indexOf('NotasPrincipal');
    const encabezadosInforme = [
      'Ciudad', 'Nombres', 'Documento', 'Contacto Principal', 
      'Dirección', 'Teléfono', 'Horario', 'Notas'
    ];
    resultados.push(encabezadosInforme);
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const ciudad = fila[iCiudad];
      if (filtros.ciudad && filtros.ciudad !== ciudad) continue;
      resultados.push([
        ciudad,
        fila[iNombres],
        fila[iNumero],
        fila[iContactoP],
        fila[iDireccionP],
        fila[iTelefonoP],
        fila[iHorario],
        fila[iNotasP]
      ]);
    }
    return { status: 'success', data: resultados };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
