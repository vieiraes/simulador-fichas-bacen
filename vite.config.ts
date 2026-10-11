import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH permite publicar num subcaminho (ex.: GitHub Pages em /simulador-fichas-bacen/).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: { outDir: 'dist' },
  server: { port: 3001 },
  preview: { port: 4173 },
});
