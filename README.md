# Cootranslogi

Aplicación Web (Google Apps Script) para gestión de remesas, vehículos, conductores y clientes.

Resumen
- Plataforma: Google Apps Script (V8) + Google Sheets como backend.
- UI: HTML / CSS / JS inyectado desde plantillas `.html` y `.js.html`.
- Server: archivos `.gs` por módulo (Helpers.gs, Main.gs, Vehiculos.gs, Conductores.gs, Clientes.gs, Remesas.gs, Configuracion.gs, Informes.gs).

Estructura del repo
- appsscript.json — manifest y scopes.
- *.gs — lógica server-side separada por responsabilidad:
  - Helpers.gs: constantes y utilidades (abre la Spreadsheet, hash de contraseñas, loginHandler, etc.)
  - Main.gs: rutas principales (doGet, getPagina, incluir, cerrarSesion, etc.)
  - Vehiculos.gs, Conductores.gs, Clientes.gs, Remesas.gs, Configuracion.gs: CRUD y reportes de cada módulo
  - Informes.gs: funciones para generación de archivos temporales y avisos de vencimientos (moved from Vehiculos module)
- *.html / *.js.html — plantillas de UI y scripts cliente (Index.html, Login.html, MenuPrincipal.html, Vehiculos.html + Vehiculos.js.html, etc.)
- styles.css.html — estilos globales.

Hojas esperadas en Google Sheets
- Configuracion: listas (ej. Ciudades)
- Usuarios: columnas: Usuario | Password (hash) | Nombre | Rol
- Vehiculos: encabezados según la UI (Placa, Marca, Modelo, ...)
- Conductores
- Clientes
- Remesas

Notas de despliegue
1. Abrir este proyecto en https://script.google.com o usar `clasp` para sincronizar con el repositorio.
2. Verificar `SHEET_ID` en Helpers.gs y ajustar si es necesario.
3. Publicar una nueva implementación (Deploy → New deployment → Web app) para que los cambios estén activos.

Seguridad y recomendaciones
- Las contraseñas ahora se guardan hasheadas (SHA-256). El sistema hace una migración suave cuando un usuario inicia sesión con contraseña en texto plano: la celda se reemplaza por su hash.
- El login en el cliente fue cambiado para no enviar credenciales vía GET. Se usa `google.script.run` y `loginHandler` en el servidor.
- Se añadió `LockService` para la generación de ID de remesas para evitar duplicados por concurrencia.
- Revisar scopes en `appsscript.json` (Sheets, Drive, Properties).

Pruebas sugeridas
- Login con usuario existente (verificar migración de password a hash en la hoja `Usuarios`).
- Crear/editar/buscar en cada módulo (Vehículos, Conductores, Clientes, Remesas).
- Generar informes y descargar Excel (verificar permiso de Drive).

Cómo contribuir y próximos pasos
- Mantener separadas las responsabilidades en archivos `.gs` por módulo.
- Añadir validaciones/escaping en templates si los datos provienen de entradas no confiables.
- Opcional: tests con `clasp` + Node.js para comprobar endpoints críticos.
