import cors from 'cors';
import express from 'express';

// Inicializar middlewares
export const inicializarMiddlewares = (aplicacion) => {
  // CORS: Permite solicitudes desde otros orígenes
  // Sin esto, el frontend (en localhost:5500) no puede
  // hacer solicitudes al backend (localhost:3010)
  aplicacion.use(cors());

  // JSON Parser: Convierte req.body de texto a objeto
  // Sin esto, req.body sería undefined
  aplicacion.use(express.json());

  // URL Encoded Parser: Para formularios HTML tradicionales
  aplicacion.use(express.urlencoded({ extended: true }));
};

// Middleware de manejo de errores
// Se ejecuta si hay un error en alguna ruta
export const manejadorDeErrores = (error, req, res, next) => {
  console.error('Error:', error);
  return res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor'
  });
};