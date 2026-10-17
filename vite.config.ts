import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

// Em desenvolvimento (npm run dev) o backend Express roda dentro do próprio Vite.
// O import é dinâmico para NÃO carregar o servidor durante o `vite build` (Vercel).
function expressBackendPlugin(): Plugin {
  return {
    name: 'express-backend-plugin',
    apply: 'serve',
    async configureServer(server) {
      const { app: apiApp } = await import('./server/app.js');
      server.middlewares.use(apiApp);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Disponibiliza .env / .env.local para o backend no modo dev
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), tailwindcss(), expressBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
