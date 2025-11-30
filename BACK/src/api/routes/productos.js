import express from 'express';
import pool from '../database/db.js';
import * as controladorProducto from '../controllers/product.controllers.js';

const enrutador = express.Router();

// GET /api/productos
// Método: GET (lectura)
// Objetivo: Obtener TODOS los productos
enrutador.get('/', async (req, res, next) => {
  try {
    // Query SQL para traer todo
    const CONSULTA_SQL = 'SELECT * FROM productos';

    // Ejecutar query (pool.query devuelve Promise)
    // [filas] = destructuring del array resultado
    const [filas] = await pool.query(CONSULTA_SQL);

    // Enviar respuesta al cliente
    return res.status(200).json({ payload: filas });

  } catch (error) {
    // Si hay error, respondemos con estado 500
    console.error('Error en GET /productos:', error);
    return res.status(500).json({
      error: 'Error al obtener productos'
    });
  }
});

// GET /api/productos/:id
// Método: GET
// Objetivo: Obtener UN producto específico
// :id = parámetro dinámico (ej: /productos/5)
enrutador.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;  // Destructurar id de la URL

    // Query con parámetro
    const CONSULTA_SQL = 'SELECT * FROM productos WHERE id = ?';

    // El ? es un placeholder (previene SQL injection)
    // mysql2 automáticamente escapa/valida el valor
    const [filas] = await pool.query(CONSULTA_SQL, [id]);

    if (filas.length === 0) {
      // Si no encuentra el producto, 404 (Not Found)
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    // Retornar el primer (y único) resultado
    return res.status(200).json({ payload: filas[0] });

  } catch (error) {
    console.error('Error en GET /productos/:id:', error);
    return res.status(500).json({
      error: 'Error al obtener producto'
    });
  }
});

// POST /api/productos
// Método: POST (creación)
// Objetivo: Crear un nuevo producto
// Los datos vienen en req.body (JSON)
enrutador.post('/', async (req, res, next) => {
  try {
    // Destructurar datos del body
    const { categoria_id, nombre, descripcion, precio, stock, ruta_img } = req.body;

    // Validación básica
    if (!nombre || !precio) {
      return res.status(400).json({
        error: 'Faltan datos requeridos'
      });
    }

    // Query de inserción
    const CONSULTA_SQL = 'INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, ruta_img) VALUES (?, ?, ?, ?, ?, ?)';

    // Pasar valores en orden
    const [resultado] = await pool.query(CONSULTA_SQL, [categoria_id, nombre, descripcion, precio, stock, ruta_img || 0]);

    // resultado.insertId = id del registro creado
    return res.status(201).json({
      message: 'Producto creado',
      id: resultado.insertId
    });

  } catch (error) {
    console.error('Error en POST /productos:', error);
    return res.status(500).json({
      error: 'Error al crear producto'
    });
  }
});

// PUT /api/productos/:id
// Método: PUT (actualización)
// Objetivo: Actualizar un producto existente
enrutador.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;

    // Query de actualización
    const CONSULTA_SQL = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';

    // resultado.affectedRows = cuántas filas se modificaron
    const [resultado] = await pool.query(CONSULTA_SQL, [nombre, descripcion, precio, stock, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      message: 'Producto actualizado'
    });

  } catch (error) {
    console.error('Error en PUT /productos/:id:', error);
    return res.status(500).json({
      error: 'Error al actualizar producto'
    });
  }
});

// DELETE /api/productos/:id
// Método: DELETE (eliminación)
// Objetivo: Eliminar un producto
enrutador.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Query de eliminación
    const CONSULTA_SQL = 'DELETE FROM productos WHERE id = ?';

    const [resultado] = await pool.query(CONSULTA_SQL, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      message: 'Producto eliminado'
    });

  } catch (error) {
    console.error('Error en DELETE /productos/:id:', error);
    return res.status(500).json({
      error: 'Error al eliminar producto'
    });
  }
});


// Rutas de Generación IA
enrutador.post('/preview-image', controladorProducto.previsualizarImagen);
enrutador.post('/confirm', controladorProducto.confirmarProducto);
enrutador.delete('/discard-preview', controladorProducto.descartarPrevisualizacion);
enrutador.post('/ticket', controladorProducto.generarTicket);

export default enrutador;