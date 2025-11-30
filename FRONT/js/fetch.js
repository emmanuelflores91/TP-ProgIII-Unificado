const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010/api/productos';

// Obtiene todos los productos desde la API
export async function apiObtenerProductos() {
  const respuesta = await fetch(API_BASE); // ✅ CORREGIDO
  if (!respuesta.ok) throw new Error('Error al obtener productos: ' + respuesta.status);
  const cuerpo = await respuesta.json();

  let datos = cuerpo.payload ?? cuerpo;
  if (datos && datos.rows) datos = datos.rows;

  if (!Array.isArray(datos)) {
    const posible = Object.values(datos || {}).find(valor => Array.isArray(valor));
    if (posible) datos = posible;
  }
  return Array.isArray(datos) ? datos : [];
}

export default apiObtenerProductos;