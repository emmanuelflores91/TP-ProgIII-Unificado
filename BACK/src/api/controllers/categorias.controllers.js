import CategoriaModel from "../models/categoria.model.js";

export const getAllCategorias = async (req, res) => {

    try {
        const [rows] = await CategoriaModel.seleccionarTodasLasCategorias();
        
        res.status(200).json({
            payload: rows,
            message: rows.length === 0 ? "No se encontraron productos" : "Productos encontrados"
        });
        
    
    } catch (error) {
        console.error("Error obteniendo productos", error.message);

        res.status(500).json({
            message: "Error interno al obtener productos"
        });
    }
}