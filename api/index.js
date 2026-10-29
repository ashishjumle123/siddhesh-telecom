// Vercel Serverless Function entry point
// This file re-exports the Express app from server.js
// Vercel automatically serves files in the /api directory as serverless functions
module.exports = require('../server.js');
