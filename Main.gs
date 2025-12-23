function doGet(e) {
  // Legacy GET login preserved for compatibility
  if (e.parameter && e.parameter.usuario && e.parameter.password) {
    const usuario = e.parameter.usuario;
    const password = e.parameter.password;
    const ciudad = e.parameter.ciudad;
    const validacion = validarLogin(usuario, password, ciudad);
    if (validacion.status === 'success') {
      const props = PropertiesService.getUserProperties();
      props.setProperty('nombreUsuario', validacion.nombre);
      props.setProperty('rol', validacion.rol);
      props.setProperty('ciudadLogin', ciudad);
      props.setProperty('loginId', usuario);
      let template = HtmlService.createTemplateFromFile('MenuPrincipal');
      template.nombreUsuario = validacion.nombre;
      template.rol = validacion.rol;
      return template.evaluate().setTitle('Cootranslogin - Menu').addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } else {
      let template = HtmlService.createTemplateFromFile('Login');
      template.ciudades = getLista('Ciudades');
      template.appUrl = getAppUrl();
      template.error = validacion.message;
      return template.evaluate().setTitle('Cootranslogin - Login').addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }
  }

  const page = e.parameter && e.parameter.page;
  if (page === 'menu') {
    const props = PropertiesService.getUserProperties();
    const nombreUsuario = props.getProperty('nombreUsuario');
    const rol = props.getProperty('rol');
    if (!nombreUsuario) {
      let loginTemplate = HtmlService.createTemplateFromFile('Login');
      loginTemplate.ciudades = getLista('Ciudades');
      loginTemplate.appUrl = getAppUrl();
      loginTemplate.error = "Sesión expirada. Por favor, ingrese de nuevo.";
      return loginTemplate.evaluate().setTitle('Cootranslogin - Login');
    }
    let template = HtmlService.createTemplateFromFile('MenuPrincipal');
    template.nombreUsuario = nombreUsuario;
    template.rol = rol;
    return template.evaluate().setTitle('Cootranslogin - Menu').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  if (page === 'logout') {
    cerrarSesion();
    return HtmlService.createHtmlOutput('<script>window.top.location.href = "' + getAppUrl() + '";</script>');
  }

  let template = HtmlService.createTemplateFromFile('Login');
  template.ciudades = getLista('Ciudades');
  template.appUrl = getAppUrl(); 
  template.error = null; 
  return template.evaluate().setTitle('Cootranslogin - Login').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

function incluir(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getPagina(nombrePagina) {
  try {
    if (['Vehiculos', 'Conductores', 'Clientes', 'Remesas', 'Informes', 'Seguimiento', 'Configuracion'].includes(nombrePagina)) {
      const html = HtmlService.createTemplateFromFile(nombrePagina).evaluate().getContent();
      const jsFile = nombrePagina + '.js';
      let js = '';
      try { js = HtmlService.createHtmlOutputFromFile(jsFile + '.html').getContent(); } catch (e) { js = ''; }
      return { html: html, js: js };
    } else {
      return { html: '<h3>Error: Pagina no encontrada: ' + nombrePagina + '</h3>', js: '' };
    }
  } catch (e) {
    Logger.log('Error en getPagina(' + nombrePagina + '): ' + e.message);
    return { html: '<h3>Error al cargar el módulo: ' + e.message + '</h3>', js: '' };
  }
}

function cerrarSesion() {
  PropertiesService.getUserProperties().deleteAllProperties();
}

function FORZAR_AUTORIZACION() {
  try {
    getSS();
    Logger.log('Permiso de Sheets: OK');
    PropertiesService.getUserProperties();
    Logger.log('Permiso de Propiedades: OK');
    Browser.msgBox('¡Éxito! Los permisos han sido autorizados.');
  } catch (e) {
    Browser.msgBox('Error al autorizar: ' + e.message);
  }
}
