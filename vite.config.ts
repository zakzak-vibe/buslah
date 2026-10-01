import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const url = new URL(req.url, 'http://localhost:3000');
          const pathname = url.pathname;

          // Helper to wrap Node res with express/vercel-like helper methods
          const enhancedRes = res as unknown as {
            status: (code: number) => typeof enhancedRes;
            json: (data: unknown) => void;
            send: (data: unknown) => void;
            setHeader: (name: string, value: string) => void;
            end: (data?: unknown) => void;
          };

          enhancedRes.status = function (code: number) {
            res.statusCode = code;
            return enhancedRes;
          };

          enhancedRes.json = function (data: unknown) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data, null, 2));
          };

          enhancedRes.send = function (data: unknown) {
            res.end(typeof data === 'string' ? data : JSON.stringify(data));
          };

          const enhancedReq = req as unknown as {
            query: Record<string, string>;
            method: string;
            headers: typeof req.headers;
          };
          enhancedReq.query = Object.fromEntries(url.searchParams.entries());

          if (pathname === '/api/health' || pathname === '/api/health.js') {
            const healthModule = await server.ssrLoadModule('/api/health.js');
            return await healthModule.default(enhancedReq, enhancedRes);
          }

          if (
            pathname === '/api/bus-arrival' ||
            pathname === '/api/bus-arrival.js' ||
            pathname === '/api/bus-arrival/'
          ) {
            const arrivalModule = await server.ssrLoadModule('/api/bus-arrival.js');
            return await arrivalModule.default(enhancedReq, enhancedRes);
          }

          return next();
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: true, message: errorMessage }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
