// Vercel root-level catch-all serverless function.
// Handles all /api/* requests by delegating to the Express app.
// Vercel's Node File Tracing bundles backend/ and its node_modules automatically.
module.exports = require('../backend/api/index');
