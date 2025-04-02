/**
 * Configuración central para las llamadas a la API
 */

// URL base para la API - Toma la variable de entorno o usa un valor por defecto
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tiempo de espera para las solicitudes (en milisegundos)
export const API_TIMEOUT = 10000;

// Estado de fallback para usar localStorage cuando la API no está disponible
export const useFallbackStorage = true;

/**
 * Función utilitaria para realizar solicitudes a la API con manejo de errores
 * y opciones de tiempo de espera
 */
export const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      // Si la respuesta no es correcta, intentar obtener el mensaje de error
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      } catch (jsonError) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    
    // Si es un error de tiempo de espera agotado
    if (error.name === 'AbortError') {
      throw new Error('La solicitud ha excedido el tiempo de espera');
    }
    
    throw error;
  }
};

/**
 * Verificar si la API está disponible
 * @returns {Promise<boolean>} true si la API está disponible, false en caso contrario
 */
export const isApiAvailable = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/check-connection`, {}, 5000);
    const data = await response.json();
    return data.status === 'connected';
  } catch (error) {
    console.error('Error al verificar disponibilidad de la API:', error);
    return false;
  }
};

/**
 * Configuración para mostrar mensajes de errores de API en la interfaz
 */
export const API_ERROR_MESSAGES = {
  network: 'Error de conexión. Comprueba tu conexión a internet.',
  server: 'Error en el servidor. Por favor, intenta más tarde.',
  timeout: 'La solicitud ha tardado demasiado tiempo. Verifica tu conexión.',
  notFound: 'Recurso no encontrado. Puede que ya no exista.',
  auth: 'Error de autenticación. Inicia sesión de nuevo.',
  default: 'Ha ocurrido un error. Por favor, intenta de nuevo.'
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  useFallbackStorage,
  fetchWithTimeout,
  isApiAvailable,
  API_ERROR_MESSAGES
};