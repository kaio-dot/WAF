import { startServer } from './listener/httpListener.js';

const PORT = 8080;

console.log(`[WAF] Iniciando servidor na porta ${PORT}...`);
startServer(PORT);
