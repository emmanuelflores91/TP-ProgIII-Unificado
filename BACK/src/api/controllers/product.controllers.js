import { Client } from "@gradio/client";
import ModeloProducto from "../models/product.models.js";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PROMPT_BASE = "A medieval {OBJETO} icon in fantasy RPG style, similar to Dungeons and Dragons artwork. Drawn in a slightly stylized but realistic illustration style with clean outlines and subtle shading. Soft ambient lighting creates gentle highlights on the surface. Art style: digital painting with cel-shading techniques, semi-cartoon aesthetic with defined black outlines. Solid flat fluorescent green background. The design should work as a game inventory item icon, clear and readable at small sizes. Medieval fantasy aesthetic, period-appropriate craftsmanship details with aging and wear marks to show authenticity.";

// Función simple de traducción
async function traducirTexto(texto) {
    try {
        const axios = (await import('axios')).default;
        const respuesta = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=${encodeURIComponent(texto)}`);
        return respuesta.data[0][0][0];
    } catch (error) {
        console.error("Error de traducción:", error.message);
        return texto;
    }
}

// Obtener todos los productos
export const obtenerTodosLosProductos = async (req, res) => {
    try {
        const [filas] = await ModeloProducto.seleccionarTodosLosProductos();
        res.status(200).json({
            payload: filas,
            message: filas.length === 0 ? "No se encontraron productos" : "Productos encontrados"
        });
    } catch (error) {
        console.error("Error obteniendo productos", error.message);
        res.status(500).json({
            message: "Error interno al obtener productos"
        });
    }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [filas] = await ModeloProducto.seleccionarProductoPorId(id);

        if (filas.length === 0) {
            return res.status(404).json({
                message: `No se encontró producto con id ${id}`
            });
        }

        res.status(200).json({
            payload: filas[0],
            message: "Producto encontrado"
        });
    } catch (error) {
        console.error(`Error obteniendo producto con id ${id}`, error.message);
        res.status(500).json({
            message: "Error interno al obtener producto con id"
        });
    }
};

// Crear producto
export const crearProducto = async (req, res) => {
    try {
        const { categoria_id, nombre, descripcion, precio, stock, ruta_img } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({
                message: "Datos inválidos, asegúrate de enviar todos los campos requeridos"
            });
        }

        const [resultado] = await ModeloProducto.insertarProducto(categoria_id, nombre, descripcion, precio, stock, ruta_img || 0);

        res.status(201).json({
            message: "Producto creado con éxito",
            productId: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Actualizar producto
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;

        const [resultado] = await ModeloProducto.actualizarProducto(nombre, descripcion, precio, stock, id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                message: "No se actualizó el producto (no encontrado)"
            });
        }

        res.status(200).json({
            message: `Producto con id ${id} actualizado correctamente`
        });
    } catch (error) {
        console.error("Error al actualizar productos", error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await ModeloProducto.eliminarProducto(id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                message: "No se eliminó el producto (no encontrado)"
            });
        }

        return res.status(200).json({
            message: `Producto con id ${id} eliminado correctamente`
        });
    } catch (error) {
        console.error("Error al eliminar un producto: ", error);
        res.status(500).json({
            message: `Error al eliminar un producto con id ${id}`,
            error: error.message
        });
    }
};

// Generación IA - Previsualizar Imagen
export const previsualizarImagen = async (req, res) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({ message: "Descripción requerida" });
        }

        console.log("1. Descripción recibida:", descripcion);

        // Traducir
        const descripcionTraducida = await traducirTexto(descripcion);
        console.log("2. Descripción traducida:", descripcionTraducida);

        const prompt = PROMPT_BASE.replace('{OBJETO}', descripcionTraducida);
        console.log("3. Prompt generado:", prompt.substring(0, 100) + "...");

        // Conectar con Z-Image-Turbo
        console.log("4. Conectando con Z-Image-Turbo...");
        const cliente = await Client.connect("Tongyi-MAI/Z-Image-Turbo");

        console.log("5. Generando imagen...");
        const resultado = await cliente.predict("/generate", {
            prompt: prompt,
            resolution: "1024x1024 ( 1:1 )",
            seed: 42,
            steps: 8,
            shift: 3,
            random_seed: true,
            gallery_images: []
        });

        console.log("6. Imagen generada exitosamente");
        console.log("7. Resultado completo:", JSON.stringify(resultado, null, 2));

        // La imagen está en resultado.data[0][0].image
        const datosImagen = resultado.data[0][0].image;
        console.log("8. Datos de imagen:", datosImagen);

        if (!datosImagen || !datosImagen.url) {
            throw new Error(`No se pudo extraer la imagen. Estructura: ${JSON.stringify(resultado.data)}`);
        }

        const urlImagen = datosImagen.url;
        console.log("9. URL de la imagen:", urlImagen);

        // Descargar imagen
        const axios = (await import('axios')).default;
        const respuestaImagen = await axios.get(urlImagen, {
            responseType: 'arraybuffer'
        });
        const bufferImagen = Buffer.from(respuestaImagen.data);

        console.log("10. Imagen descargada, tamaño:", bufferImagen.length);

        // Remover fondo verde con transparencia
        console.log("10.5. Removiendo fondo verde...");

        // Convertir a RGBA (4 canales) para soportar transparencia
        const imagenSinFondo = await sharp(bufferImagen)
            .ensureAlpha() // Asegurar que tenga canal alpha
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Crear máscara para eliminar verde
        const { data, info } = imagenSinFondo;
        const cantidadPixeles = info.width * info.height;

        // Procesar cada pixel (ahora con 4 canales: RGBA)
        for (let i = 0; i < cantidadPixeles; i++) {
            const desplazamiento = i * 4; // 4 canales: R, G, B, A
            const r = data[desplazamiento];
            const g = data[desplazamiento + 1];
            const b = data[desplazamiento + 2];

            // Detectar tonos verdes
            const esVerde = g > 100 && g > r * 1.2 && g > b * 1.2;

            if (esVerde) {
                // Hacer completamente transparente
                data[desplazamiento + 3] = 0; // Alpha = 0 (transparente)
            }
        }

        // Reconstruir imagen con fondo transparente
        const bufferFinal = await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4 // RGBA
            }
        })
            .png({ compressionLevel: 9 })
            .toBuffer();

        console.log("11. Fondo verde removido con transparencia");

        // Crear directorio temporal
        const dirTemporal = path.join(process.cwd(), 'public', 'img', 'productos', 'temp');
        if (!fs.existsSync(dirTemporal)) {
            console.log("12. Creando directorio:", dirTemporal);
            fs.mkdirSync(dirTemporal, { recursive: true });
        }

        // Generar nombre de archivo único
        const nombreArchivo = `temp_${Date.now()}.png`;
        const rutaTemporal = path.join(dirTemporal, nombreArchivo);
        console.log("13. Guardando imagen en:", rutaTemporal);

        // Optimizar y guardar (usando bufferFinal)
        await sharp(bufferFinal)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png({ quality: 90 })
            .toFile(rutaTemporal);

        console.log("14. ✅ Imagen guardada exitosamente con transparencia");

        res.json({ url: `/img/productos/temp/${nombreArchivo}` });

    } catch (error) {
        console.error("❌ Error de generación de preview:");
        console.error("Mensaje de error:", error.message);
        console.error("Error completo:", error);

        res.status(500).json({
            message: "Error generando imagen",
            error: error.message
        });
    }
};

// Generación IA - Confirmar Producto
export const confirmarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria_id, temp_image_url } = req.body;
        let rutaImagenFinal = temp_image_url;

        if (temp_image_url && temp_image_url.includes('/temp/')) {
            const nombreArchivo = path.basename(temp_image_url);
            const rutaOrigen = path.join(process.cwd(), 'public', temp_image_url);
            const rutaDestino = path.join(process.cwd(), 'public', 'img', 'productos', nombreArchivo);

            if (fs.existsSync(rutaOrigen)) {
                fs.renameSync(rutaOrigen, rutaDestino);
                rutaImagenFinal = `/img/productos/${nombreArchivo}`;
            }
        }

        const [resultado] = await ModeloProducto.insertarProducto(
            categoria_id,
            nombre,
            descripcion,
            parseFloat(precio),
            parseInt(stock),
            rutaImagenFinal
        );

        res.status(201).json({ message: "Producto creado", id: resultado.insertId });
    } catch (error) {
        console.error("Error al confirmar producto:", error);
        res.status(500).json({ message: "Error creando producto", error: error.message });
    }
};

// Generación IA - Descartar Previsualización
export const descartarPrevisualizacion = async (req, res) => {
    try {
        const { image_url } = req.body;

        if (image_url && image_url.includes('/temp/')) {
            const rutaArchivo = path.join(process.cwd(), 'public', image_url);
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
            }
        }

        res.json({ message: "Previsualización descartada" });
    } catch (error) {
        console.error("Error al descartar:", error);
        res.status(500).json({ message: "Error descartando imagen" });
    }
};

// Generación de Ticket
export const generarTicket = async (req, res) => {
    try {
        const { nombreUsuario, productos } = req.body;

        if (!nombreUsuario || !productos || productos.length === 0) {
            return res.status(400).json({ message: "Datos incompletos para generar ticket" });
        }

        // Calcular total (Se podría agregar validación aquí para verificar precios contra BD)
        const total = productos.reduce((acumulador, articulo) => acumulador + (articulo.precio * articulo.cantidad), 0);

        const ticket = {
            id: `TICKET-${Date.now()}`,
            nombreUsuario,
            productos,
            total,
            fecha: new Date().toLocaleString()
        };

        // En una aplicación real, guardar ticket en BD aquí

        res.status(201).json(ticket);
    } catch (error) {
        console.error("Error al generar ticket:", error);
        res.status(500).json({ message: "Error generando ticket", error: error.message });
    }
};

// ==========================================
// CONTROLADORES SSR (Server Side Rendering)
// ==========================================

// Crear producto desde formulario SSR
export const crearProductoSSR = async (req, res) => {
    try {
        const { categoria_id, nombre, descripcion, precio, stock, ruta_img } = req.body;

        if (!nombre || !precio) {
            return res.render("create", { error: "Nombre y precio son obligatorios" });
        }

        let rutaImagenFinal = ruta_img || 0;

        // Si hay una imagen temporal, moverla a permanente
        if (ruta_img && ruta_img.includes('/temp/')) {
            const nombreArchivo = path.basename(ruta_img);
            const rutaOrigen = path.join(process.cwd(), 'public', ruta_img);
            const rutaDestino = path.join(process.cwd(), 'public', 'img', 'productos', nombreArchivo);

            // Asegurar que existe el directorio de destino
            const dirDestino = path.dirname(rutaDestino);
            if (!fs.existsSync(dirDestino)) {
                fs.mkdirSync(dirDestino, { recursive: true });
            }

            if (fs.existsSync(rutaOrigen)) {
                fs.renameSync(rutaOrigen, rutaDestino);
                rutaImagenFinal = `/img/productos/${nombreArchivo}`;
            }
        }

        await ModeloProducto.insertarProducto(categoria_id, nombre, descripcion, precio, stock, rutaImagenFinal);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error en crearProductoSSR:", error);
        res.render("create", { error: "Error al crear el producto: " + error.message });
    }
};

// Actualizar producto desde formulario SSR
export const actualizarProductoSSR = async (req, res) => {
    try {
        const { id, nombre, descripcion, precio, stock } = req.body;

        await ModeloProducto.actualizarProducto(nombre, descripcion, precio, stock, id);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error en actualizarProductoSSR:", error);
        res.redirect("/admin?error=" + encodeURIComponent("Error al actualizar: " + error.message));
    }
};

// Eliminar producto desde formulario SSR
export const eliminarProductoSSR = async (req, res) => {
    try {
        const { id } = req.body;
        await ModeloProducto.eliminarProducto(id);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error en eliminarProductoSSR:", error);
        res.redirect("/admin?error=" + encodeURIComponent("Error al eliminar: " + error.message));
    }
};