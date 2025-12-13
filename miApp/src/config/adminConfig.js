/**
 * Configuración de credenciales del Administrador
 * IMPORTANTE: En producción, estas credenciales deben estar en variables de entorno
 * y la autenticación debe manejarse del lado del servidor.
 */

export const ADMIN_CREDENTIALS = {
  email: 'admin@agroconnect.com',
  password: 'Admin123',
};

/**
 * Valida si las credenciales son las del administrador
 * @param {string} email - Correo electrónico ingresado
 * @param {string} password - Contraseña ingresada
 * @returns {boolean} - true si las credenciales son correctas
 */
export const validateAdminCredentials = (email, password) => {
  return (
    email === ADMIN_CREDENTIALS.email && 
    password === ADMIN_CREDENTIALS.password
  );
};

/**
 * Mensaje de error para credenciales inválidas
 */
export const ADMIN_ERROR_MESSAGE = 
  'Credenciales de administrador inválidas.\n\n' +
  'Correo: admin@agroconnect.com\n' +
  'Si olvidó la contraseña, contacte al soporte técnico.';
