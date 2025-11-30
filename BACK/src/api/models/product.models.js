import pool from "../database/db.js";

// Seleccionar todos los productos
export const seleccionarTodosLosProductos = async () => {
    const [filas] = await pool.query("SELECT * FROM productos");
    return filas;  // ✅ CORRECTO: devuelve el array directamente
};

// Seleccionar producto por ID
export const seleccionarProductoPorId = async (id) => {
    const [filas] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    return filas[0];  // ✅ Devuelve un objeto, no array
};

// Insertar nuevo producto
export const insertarProducto = async (categoria_id, nombre, descripcion, precio, stock, ruta_img) => {
    const [resultado] = await pool.query(
        "INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, ruta_img) VALUES (?, ?, ?, ?, ?, ?)",
        [categoria_id, nombre, descripcion, precio, stock, ruta_img]
    );
    return resultado;  // ✅ Devuelve resultado directamente
};

// Actualizar producto existente
export const actualizarProducto = async (nombre, descripcion, precio, stock, id) => {
    const [resultado] = await pool.query(
        "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?",
        [nombre, descripcion, precio, stock, id]
    );
    return resultado;
};

// Eliminar producto
export const eliminarProducto = async (id) => {
    const [resultado] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);
    return resultado;
};

export default {
    seleccionarTodosLosProductos,
    seleccionarProductoPorId,
    insertarProducto,
    actualizarProducto,
    eliminarProducto
};