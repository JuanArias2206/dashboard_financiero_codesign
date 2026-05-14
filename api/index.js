/**
 * api/index.js — Single Vercel Serverless Function
 * Exports the Express app from server.js so all /api/* routes
 * are handled by one function (avoids Hobby plan 12-function limit).
 */
const app = require('../server');
module.exports = app;
