// Helpers and constants
const SHEET_ID = '14gNXGyoIRuMJUy8XLldb5SyypB93jJFhxrm0kXl_Uno'; 

function getSS() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet(name) {
  return getSS().getSheetByName(name);
}

function readSheetData(name) {
  const sh = getSheet(name);
  return sh ? sh.getDataRange().getValues() : [];
}

/**
 * Hash simple (SHA-256) en hex para almacenar passwords.
 */
function hashPassword(password) {
  if (!password) return '';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * loginHandler: versión segura para usar con google.script.run desde el cliente.
 */
function loginHandler(usuario, password, ciudad) {
  try {
    const validacion = validarLogin(usuario, password, ciudad);
    if (validacion.status === 'success') {
      const props = PropertiesService.getUserProperties();
      props.setProperty('nombreUsuario', validacion.nombre); 
      props.setProperty('rol', validacion.rol); 
      props.setProperty('ciudadLogin', ciudad);
      props.setProperty('loginId', usuario);
      return { status: 'success', nombre: validacion.nombre, rol: validacion.rol };
    } else {
      return validacion;
    }
  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: 'Error de servidor: ' + e.message };
  }
}
