import {Router} from "express";
import {getAllCategorias} from "../controllers/categorias.controllers.js"

const router = Router();


router.get("/", getAllCategorias);

export default router;