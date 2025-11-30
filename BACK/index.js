import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url';
import environments from "./src/api/config/environments.js";
import { inicializarMiddlewares, manejadorDeErrores } from './src/api/middlewares/middlewares.js';
import rutasProductos from './src/api/routes/productos.js';
import rutasVistas from './src/api/routes/views.routes.js';
import { seleccionarTodosLosProductos } from './src/api/models/product.models.js';

// ==========================================
// CONFIGURACIÓN INICIAL
// ==========================================

const app = express();
const PUERTO = environments.port;

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================

// ✅ 1. Inicializar middlewares personalizados
inicializarMiddlewares(app);

// ✅ 2. CORS - Permitir cliente en puerto 5173
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ 3. Body parsers - Procesar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 4. Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// CONFIGURACIÓN DE VISTAS (EJS)
// ==========================================

// ✅ 5. Configurar motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ==========================================
// RUTAS
// ==========================================

// ✅ 6. RUTAS API - Endpoints JSON para cliente SPA
// GET  /api/productos          - Obtener todos
// GET  /api/productos/:id      - Obtener uno
// POST /api/productos          - Crear
// PUT  /api/productos/:id      - Actualizar
// DELETE /api/productos/:id    - Eliminar
app.use('/api/productos', rutasProductos);

// ✅ 7. RUTAS VISTAS - Formularios SSR para admin
// GET  /admin/crear            - Formulario crear
// GET  /admin/editar?id=X      - Formulario editar
// GET  /admin/eliminar?id=X    - Confirmación eliminar
// POST /admin/crear            - Procesar crear
// POST /admin/editar           - Procesar editar
// POST /admin/eliminar         - Procesar eliminar
app.use('/', rutasVistas);

// ✅ 8. RUTA ESPECIAL - Dashboard admin (renderiza tabla de productos)
app.get('/admin', async (req, res) => {
  try {
    // TODO: Agregar autenticación aquí en el futuro
    const productos = await seleccionarTodosLosProductos();
    res.render('dashboard', { productos });
  } catch (error) {
    console.error('❌ Error en GET /admin:', error);
    res.status(500).render('dashboard', { productos: [], error: error.message });
  }
});

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// ✅ 9. Middleware de errores global - Se ejecuta si hay error en cualquier ruta
app.use(manejadorDeErrores);

// ✅ 10. Ruta 404 - Página no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PUERTO, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ Backend ejecutando en http://localhost:' + PUERTO);
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('📍 RUTAS DISPONIBLES:');
  console.log('');
  console.log('   🛒 CLIENTE (API JSON):');
  console.log('   GET    http://localhost:' + PUERTO + '/api/productos');
  console.log('   GET    http://localhost:' + PUERTO + '/api/productos/:id');
  console.log('   POST   http://localhost:' + PUERTO + '/api/productos');
  console.log('   PUT    http://localhost:' + PUERTO + '/api/productos/:id');
  console.log('   DELETE http://localhost:' + PUERTO + '/api/productos/:id');
  console.log('');
  console.log('   👨‍💼 ADMIN (SSR - Formularios):');
  console.log('   GET    http://localhost:' + PUERTO + '/admin (dashboard)');
  console.log('   GET    http://localhost:' + PUERTO + '/admin/crear');
  console.log('   GET    http://localhost:' + PUERTO + '/admin/editar?id=1');
  console.log('   GET    http://localhost:' + PUERTO + '/admin/eliminar?id=1');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('');
});

export default app;