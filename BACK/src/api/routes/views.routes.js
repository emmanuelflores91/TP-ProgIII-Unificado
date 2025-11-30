import { Router } from "express";
import {
    crearProductoSSR,
    actualizarProductoSSR,
    eliminarProductoSSR
} from "../controllers/product.controllers.js";
import { seleccionarProductoPorId, seleccionarTodosLosProductos } from "../models/product.models.js";

const enrutador = Router();

// ==========================================
// RUTAS GET - Mostrar formularios
// ==========================================

// Vista Crear Producto
enrutador.get("/admin/crear", (req, res) => {
    const { error } = req.query;
    res.render("create", { error: error || null });
});

// Vista Editar Producto
enrutador.get("/admin/editar", async (req, res) => {
    try {
        const { id, error } = req.query;
        if (!id) {
            return res.status(400).send("ID de producto requerido");
        }

        const producto = await seleccionarProductoPorId(id);
        if (!producto) {
            return res.status(404).send("Producto no encontrado");
        }

        res.render("update", { producto, error: error || null });
    } catch (error) {
        console.error("Error en GET /admin/editar:", error);
        res.status(500).send("Error al cargar el formulario de edición");
    }
});

// Vista Eliminar Producto (confirmación)
enrutador.get("/admin/eliminar", async (req, res) => {
    try {
        const { id, error } = req.query;
        if (!id) {
            return res.status(400).send("ID de producto requerido");
        }

        const producto = await seleccionarProductoPorId(id);
        if (!producto) {
            return res.status(404).send("Producto no encontrado");
        }

        res.render("delete", { producto, error: error || null });
    } catch (error) {
        console.error("Error en GET /admin/eliminar:", error);
        res.status(500).send("Error al cargar la confirmación");
    }
});

// ==========================================
// RUTAS POST - Procesar formularios
// ==========================================

// POST Crear Producto (SSR)
enrutador.post("/admin/crear", crearProductoSSR);

// POST Actualizar Producto (SSR)
enrutador.post("/admin/editar", actualizarProductoSSR);

// POST Eliminar Producto (SSR)
enrutador.post("/admin/eliminar", eliminarProductoSSR);

export default enrutador;
