import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'deny-upload-file-requests',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          let pathname;
          try {
            pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).toLowerCase();
          } catch {
            res.statusCode = 400;
            return res.end();
          }
          if (pathname === '/uploads' || pathname.startsWith('/uploads/')) {
            res.statusCode = 404;
            return res.end();
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', 'uploads/**']
    }
  }
})
