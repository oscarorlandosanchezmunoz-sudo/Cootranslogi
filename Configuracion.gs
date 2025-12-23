function getLista(nombreLista) {
  try {
    const SHEET_CONFIG = getSheet('Configuracion');
    const data = SHEET_CONFIG.getDataRange().getValues();
    const lista = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === nombreLista) { 
        lista.push(data[i][1]);
      }
    }
    return lista;
  } catch (e) {
    Logger.log(e);
    return [];
  }
}

function getUsuarios() {
  try {
    const hojaUsuarios = getSheet('Usuarios');
    const datos = hojaUsuarios.getDataRange().getValues();
    const usuarios = [];
    for (let i = 1; i < datos.length; i++) {
      usuarios.push({
        usuario: datos[i][0],
        nombre: datos[i][2],
        rol: datos[i][3]
      });
    }
    return { status: 'success', data: usuarios };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function guardarUsuario(usuarioObjeto) {
  try {
    const props = PropertiesService.getUserProperties();
    const callerRol = props.getProperty('rol');
    if (callerRol === 'Usuario') {
      return { status: 'error', message: 'No tienes permisos para guardar usuarios.' };
    }
    if (callerRol === 'Administrador' && usuarioObjeto.rol === 'Superadministrador') {
      return { status: 'error', message: 'Un Administrador no puede crear o asignar el rol de Superadministrador.' };
    }
    const hojaUsuarios = getSheet('Usuarios');
    const datos = hojaUsuarios.getDataRange().getValues();
    let filaIndex = -1;
    let i_encontrado = -1;
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == usuarioObjeto.usuario) {
        filaIndex = i + 1;
        i_encontrado = i;
        break;
      }
    }
    if (filaIndex > -1) {
      const targetRol = datos[i_encontrado][3];
      if (targetRol === 'Superadministrador' && callerRol === 'Administrador') {
        return { status: 'error', message: 'Un Administrador no puede editar a un Superadministrador.'};
      }
      if (usuarioObjeto.password === "" || usuarioObjeto.password === null) {
        hojaUsuarios.getRange(filaIndex, 3).setValue(usuarioObjeto.nombre);
        hojaUsuarios.getRange(filaIndex, 4).setValue(usuarioObjeto.rol);
      } else {
        const passHash = hashPassword(usuarioObjeto.password);
        hojaUsuarios.getRange(filaIndex, 2).setValue(passHash);
        hojaUsuarios.getRange(filaIndex, 3).setValue(usuarioObjeto.nombre);
        hojaUsuarios.getRange(filaIndex, 4).setValue(usuarioObjeto.rol);
      }
      return { status: 'success', message: 'Usuario ' + usuarioObjeto.usuario + ' actualizado.' };
    } else {
      if (!usuarioObjeto.password) {
        return { status: 'error', message: 'Para un usuario nuevo, la contraseña es obligatoria.' };
      }
      const nuevaFila = [
        usuarioObjeto.usuario,
        hashPassword(usuarioObjeto.password),
        usuarioObjeto.nombre,
        usuarioObjeto.rol
      ];
      hojaUsuarios.appendRow(nuevaFila);
      return { status: 'success', message: 'Usuario ' + usuarioObjeto.usuario + ' creado.' };
    }
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}

function eliminarUsuario(usuarioAEliminar) {
  try {
    const props = PropertiesService.getUserProperties();
    const callerRol = props.getProperty('rol');
    const callerId = props.getProperty('loginId');
    if (callerId === usuarioAEliminar) {
      return { status: 'error', message: 'No puedes eliminarte a ti mismo.' };
    }
    if (callerRol === 'Administrador' || callerRol === 'Usuario') {
      return { status: 'error', message: 'No tienes permisos para eliminar usuarios.' };
    }
    const hojaUsuarios = getSheet('Usuarios');
    const datos = hojaUsuarios.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] == usuarioAEliminar) {
        hojaUsuarios.deleteRow(i + 1);
        return { status: 'success', message: 'Usuario ' + usuarioAEliminar + ' eliminado.' };
      }
    }
    return { status: 'error', message: 'No se encontró el usuario.' };
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
