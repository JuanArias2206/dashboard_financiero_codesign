/**
 * api/[[...slug]].js — Vercel catch-all Serverless Function
 * Maneja TODAS las rutas /api/* como una sola funcion.
 * Express recibe el path original (ej. /api/cartera-data).
 */
const app = require('../server');
module.exports = app;
