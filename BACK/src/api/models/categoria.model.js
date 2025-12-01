import conexion from "../database/db.js";

export const seleccionarTodasLasCategorias = () => {

    const sql = "SELECT * FROM categorias";

    return conexion.query(sql);
};

