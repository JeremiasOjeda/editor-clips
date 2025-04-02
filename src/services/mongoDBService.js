// Función para verificar la conexión a MongoDB
export const checkMongoDBConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/check-connection');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al verificar la conexión a MongoDB:', error);
      return { status: 'error', message: error.message };
    }
  };
  
  // Tengo que añadir funciones del crud aquí
  
  // Ejemplo para obtener todos los documentos de una colección
  export const getAllDocuments = async (collection) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${collection}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error al obtener documentos de ${collection}:`, error);
      throw error;
    }
  };
  
  // Función para crear un documento
  export const createDocument = async (collection, document) => {
    try {
      const response = await fetch(`http://localhost:5000/api/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error al crear documento en ${collection}:`, error);
      throw error;
    }
  };