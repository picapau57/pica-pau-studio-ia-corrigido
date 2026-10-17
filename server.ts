import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as apiApp } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
const server = express();

server.use(apiApp);

// Static assets from Vite production build
const distPath = path.resolve(__dirname, 'dist');
server.use(express.static(distPath));

server.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[Pica-Pau Studio IA] Servidor full-stack rodando na porta ${port}`);
});
