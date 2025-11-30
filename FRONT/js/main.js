import { actualizarTarjetas } from "./tarjetas.js";
import { apiObtenerProductos } from "./fetch.js";
import { canasto } from "./canasto.js";

document.addEventListener('DOMContentLoaded', async () => {
  canasto.inicializar();

  // Botón de Administrador
  const botonAdmin = document.getElementById('login-admin');
  if (botonAdmin) {
    botonAdmin.addEventListener('click', () => {
      window.location.href = '/admin';
    });
  }

  const contenedor = document.getElementById("section-productos");
  try {
    const productos = await apiObtenerProductos();
    actualizarTarjetas(productos, contenedor);
  } catch (error) {
    console.error('Error cargando productos:', error);
    if (contenedor) contenedor.innerHTML = '<p>Error cargando productos.</p>';
  }
});
