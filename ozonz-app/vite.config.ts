import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'serve-root-assets-in-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const cleanUrl = req.url.split('?')[0];
          if (
            cleanUrl.startsWith('/data/') ||
            cleanUrl.startsWith('/js/') ||
            cleanUrl.startsWith('/favicon') ||
            cleanUrl.startsWith('/css/')
          ) {
            const filePath = resolve(__dirname, '..', cleanUrl.slice(1));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.writeHead(200);
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      }
    }
  ],
  base: './',
  build: {
    assetsDir: 'ozonz-assets',
    rollupOptions: {
      input: {
        'portfolio-ozonz': resolve(__dirname, 'portfolio-ozonz.html')
      }
    }
  }
});
