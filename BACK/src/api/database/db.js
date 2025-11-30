import mysql2 from "mysql2/promise";

import entornos from "../config/environments.js";

const { database: baseDeDatos } = entornos;

console.log("Configuración BD (sin contraseña):", { host: baseDeDatos.host, puerto: baseDeDatos.port, usuario: baseDeDatos.user, nombre: baseDeDatos.name });

const conexion = mysql2.createPool({
  host: baseDeDatos.host,
  port: baseDeDatos.port,
  database: baseDeDatos.name,
  user: baseDeDatos.user,
  password: baseDeDatos.password,
});

export default conexion;
